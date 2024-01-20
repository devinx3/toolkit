import React from 'react';

// 脚本节点
export class ScriptNode {
    #next = null;
    constructor({ code, name, script, version }) {
        this.code = code;
        this.name = name;
        this.script = script;
        this.version = version || 0;
    }
    hasNext() {
        return !!this.#next;
    }
    add(code, name, script, version) {
        if (!script) {
            throw Error("添加异常, 无可执行脚本");
        }
        this.#next = new ScriptNode({ code, name, script, version })
        return this.#next;
    }
    next() {
        return this.#next;
    }
}

// 脚本结果对象
// 区域标识
const AREA = Symbol(1)
export class ScriptResult {
    #origin = undefined
    constructor(origin) {
        this.#origin = origin;
    }
    get() {
        return this.#origin;
    }
    static boxArea(input, output) {
        return new ScriptResult({ input, output, [AREA]: true })
    }
    isArea() {
        return this.#origin?.[AREA] === true;
    }
}

// 脚本异常
class ScriptError extends Error { }


// 创建缓存
const createCategoryCache = () => {
    const _cache = {};
    const getValue = (obj, key, initialVal) => {
        let val = obj[key];
        if (val === undefined && initialVal !== undefined) val = obj[key] = initialVal;
        return val;
    }
    return {
        get: (category, key, initialVal) => {
            const data = getValue(_cache, category, {});
            return getValue(data, key, initialVal);
        },
        set: (category, key, val) => {
            const data = getValue(_cache, category, {});
            return data[key] = val;
        },
        remove: (category, key) => {
            const data = getValue(_cache, category, undefined);
            if (data === undefined) return;
            if (data[key] === undefined) return;
            try {
                delete data[key];
            } catch (e) {
                data[key] = undefined
            }
        }
    }
}

// 脚本上下文
class ScriptContext {
    #category = "-";
    #share = undefined;
    #previous = null;
    #stage = null;
    #plugins = {};
    constructor(category, root, stage, previous) {
        this.#category = category;
        this.getCode = () => root.code;
        this.getName = () => root.name;
        this.#stage = stage;
        this.#previous = previous;
        this.originInputData = null;
    }
    // 原始输入
    getOriginInputData() {
        return this.originInputData;
    }
    // 阶段编码
    getStageCode() {
        return this.#stage?.code;
    }
    // 阶段名称
    getStageName() {
        return this.#stage?.name;
    }
    // 第一个阶段
    firstStage() {
        return !(this.#stage?.position > 0);
    }
    // 是否存在下一个节点
    hasNext() {
        return !!this.#stage.nextFlag;
    }
    // 使用功共享数据
    useShare(initialShare) {
        if (this.#share === undefined || this.#share === null) this.#share = (initialShare instanceof Function) ? initialShare() : initialShare;
        return [this.#share, v => this.#share = v];
    }
    // 获取上一个阶段的输出
    getPreviousStageOutput() {
        return this.#previous.output;
    }
    // 添加插件
    addPlugin(name, plugin) {
        return this.#plugins[name] = plugin;
    }
    // 获取插件
    getPlugin(name) {
        return this.#plugins[name];
    }
}

// 创建脚本上下文对象
const createScriptContext = (category, root) => {
    const previous = { output: undefined };
    const stage = { code: root.code, name: root.name, nextFlag: root.hasNext(), position: -1 };
    const context = new ScriptContext(category, root, stage, previous);
    const modifyStage = (node, position) => {
        stage.code = node.code;
        stage.name = node.name;
        stage.nextFlag = node.hasNext();
        stage.position = position;
    }
    return {
        get: () => context,
        setInputData: data => context.originInputData = data,
        nextStage: (node, position, previousOut) => {
            if (!node) return;
            modifyStage(node, position);
            previous.output = previousOut;
        },
    }
}

// 脚本方法
class ScriptInvocation {
    constructor(source, paramNames) {
        this.invocation = null;
        this.source = source;
        this.paramNames = paramNames || [];
    }
    // 编译
    compile() {
        const Fun = Function;
        this.invocation = new Fun(...this.paramNames, this.source);
    }
    // 执行
    execute(thisObj, values) {
        if (!this.invocation) {
            throw new ScriptError("未编译的方法, 无法执行");
        }
        return this.invocation.call(thisObj, ...values);
    }
}

// 脚本任务
const scriptCacheInvocation = createCategoryCache();
class ScriptTask {
    constructor(category, code, source, version, transform) {
        this.category = category;
        this.code = code;
        this.sourceCode = source;
        this.version = version || 0;
        this.transform = transform;
    }
    // 编译
    _compileInvocation() {
        if (this.transform) {
            try {
                const prefix = "function f(inputData, inputObj, Util, React) {";
                const suffix = "}"
                const code = this.transform(prefix + this.sourceCode + suffix);
                this.sourceCode = code.substring(prefix.length, code.length - suffix.length)
            } catch (err) {
                throw new ScriptError("编译失败: " + err.message)
            }
        }
        const invocation = new ScriptInvocation(this.sourceCode, ['inputData', 'inputObj', 'Util', 'React']);
        invocation.compile();
        return invocation;
    }
    // 编译并获取
    _compileAndGetInvocation() {
        let item = scriptCacheInvocation.get(this.category, this.code);
        if (!item || item.v !== this.version) {
            scriptCacheInvocation[this.code] = item = {};
            item.v = this.version;
        }
        if (item.i) return item.i;
        // 编译
        return item.i = this._compileInvocation();
    }
    // 执行任务
    run(thisObj, inputData, handleInputObj, util) {
        const inputObj = handleInputObj ? handleInputObj(inputData) : undefined;
        // 编译并执行方法
        return this._compileAndGetInvocation().execute(thisObj, [inputData, inputObj, util, this.transform ? React : undefined]);
    }
}

// 脚本执行器
export class ScriptExector {
    constructor(category, scriptEvnet, handler, options = {}) {
        this.options = options;
        this.handler = handler;
        this.root = scriptEvnet;
        this.category = category;
        this.context = createScriptContext(category, this.root);
    }
    // 设置下一个阶段
    nexState(node, position, previousOutput) {
        this.context.nextStage(node, position, previousOutput);
    }
    // 提交任务
    submit(inputData) {
        return ((async () => {
            try {
                this.context.setInputData(inputData);
                const { before, after, convertMedian, transform, getUtil } = this.handler;
                const taskParamUtil = getUtil ? getUtil() || {} : {};
                // 前置
                const { handleInputObj } = before(this.root, inputData) || {};
                // 任务执行
                let nodeOutputData = undefined;
                const outContext = { input: undefined, output: undefined };
                let node = this.root.script ? this.root : this.root.next();
                let medianInputData = inputData;
                let index = 0;
                while (node) {
                    this.nexState(node, index, nodeOutputData);
                    const task = new ScriptTask(this.category, node.code, node.script, node.version, transform)
                    nodeOutputData = task.run(this.context.get(), medianInputData, handleInputObj, taskParamUtil);
                    if (nodeOutputData instanceof Function) nodeOutputData = nodeOutputData.apply(this.context.get());
                    if (nodeOutputData instanceof Promise) nodeOutputData = await nodeOutputData;
                    if (nodeOutputData instanceof ScriptResult) {
                        if (nodeOutputData.isArea()) {
                            const tmpResult = nodeOutputData.get();
                            if (tmpResult?.input) outContext.input = tmpResult.input;
                            if (tmpResult?.output) outContext.output = tmpResult.output;
                        }
                    } else if (this.options.enableJsx) {
                        outContext.output = nodeOutputData;
                    }
                    medianInputData = convertMedian(node, nodeOutputData);
                    node = node.next();
                    index++;
                }
                if (outContext.input) {
                    nodeOutputData = ScriptResult.boxArea(outContext.input, outContext.output);
                } else if (outContext.output) {
                    nodeOutputData = new ScriptResult(outContext.output);
                }
                // 后置
                return after(this.root, nodeOutputData);
            } catch (err) {
                console.debug(`${this.context?.stage?.name || this.root?.name} 执行异常`, err)
                const name = this.root.hasNext() ? this.context?.stage?.name : null;
                let msg = (err instanceof Object ? err.message : err) || '';
                throw name === null || name === undefined ? msg : `${name}: ${msg}`;
            }
        })())
    }
}