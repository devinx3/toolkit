// eslint-disable-next-line
import * as MonacoType from 'monaco-editor/esm/vs/editor/editor.api';
import registerPostfix from './postfix'
import globalUtil, { keys } from '../../../../utils/GlobalUtil'

const generageImportPluginSource = (pluginNames) => {
    if (!pluginNames || pluginNames.length <= 0) {
        return `(moduleName: string): null`;
    }
    let importPluginSource = '(moduleName: ';
    importPluginSource = importPluginSource + pluginNames.map(name => "'" + name + "'").join(" | ");
    importPluginSource = importPluginSource + ") => Promise<";
    importPluginSource = importPluginSource + pluginNames.map(name => "typeof import('" + name + "')").join(" | ");
    importPluginSource = importPluginSource + ">"
    return importPluginSource;
}

const converterDTS = (pluginNames) => {
    const importPluginSource = generageImportPluginSource(pluginNames);
    return `
    declare const inputData: (string | Object | File[]);
    declare const inputObj: (Object | null);
    interface ElementDefinition & Element {
        type: string | Element;
        props: any;
        children?: string | number | ElementDefinition | ElementDefinition[]
    }
    declare const Util: ({
        _: typeof import("lodash"),
        dayjs: typeof import("dayjs"),
        cryptoJS: typeof import("cryptoJS"),
        XLSX: typeof import("xlsx"),
        message: {
            info(content: string, duration?: number): void;
            success(content: string, duration?: number): void;
            error(content: string, duration?: number): void;
            warning(content: string, duration?: number): void;
            loading(content: string, duration?: number): void;
        },
        UIHelper: {
            createSchemaForm(getSchemaFormProps: { resolve: (out: any) => void, reject: (err: any) => object }, options?: object): Promise<void>;
        },
        importPlugin: ${importPluginSource}
    });`;
}

// 缓存对象
class Cache {
    constructor() {
        this.dataSource = {};
    }
    has(key) {
        return key in this.dataSource;
    }
    get(key) {
        return this.dataSource[key];
    }
    set(key, val) {
        this.dataSource[key] = val;
    }
}
// 库缓存
const libCache = new Cache();


// 添加扩展库
const addMonacoExtraLibs = (monaco, libSource, libUri) => {
    monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
    monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));
}

const libConfigs = [{
    name: 'lodash',
    path: 'https://cdn.jsdelivr.net/npm/@types/lodash@4.14.93/index.d.ts'
}, {
    name: 'dayjs',
    path: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.6/index.d.ts'
}, {
    name: 'cryptoJS',
    path: 'https://cdn.jsdelivr.net/npm/@types/crypto-js@4.1.1/index.d.ts'
}, {
    name: 'xlsx',
    path: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/types/index.d.ts'
}]
const innerConfigs = [{
    name: 'react',
    path: 'https://cdn.jsdelivr.net/npm/@types/react@18.2.0/index.d.ts'
}]
const pluginConfigs = [{
    name: 'antd',
    path: 'https://cdn.jsdelivr.net/npm/antd@4.23.6/es/index.d.ts'
}]

// 缓存key
const loadMonacoKey = keys.loadMonaco;

/**
 * 加载编辑器
 * @param {MonacoType} monaco 
 */
function loadMonaco(monaco) {
    if (!monaco || globalUtil.getFromCache(loadMonacoKey)) {
        return;
    }
    globalUtil.setToCache(loadMonacoKey, true)
    const extraLibs = monaco.languages.typescript.javascriptDefaults.getExtraLibs() || {};
    const fetchLib = (libConfig) => {
        const name = libConfig.name;
        const lib = { name }
        if (libCache.has(name)) {
            lib.content = libCache.get(name);
            return Promise.resolve(lib);
        }
        const _fetchLib = async () => {
            const res = await fetch(libConfig.path);
            lib.content = await res.text();
            return lib.content ? lib : null;
        }
        return _fetchLib();
    }
    const _libs = [...innerConfigs, ...libConfigs, ...pluginConfigs]
    Promise.all(_libs.map(libConfig => fetchLib(libConfig)))
        .then(libs => {
            libs.filter(lib => !!lib).forEach(lib => {
                libCache.set(lib.name, lib.content)
                const uri = `ts:web/${lib.name}/index.d.ts`;
                if (uri in extraLibs) {
                    return;
                }
                const conetnt = `declare module '${lib.name}' { ${lib.content} }`;
                addMonacoExtraLibs(monaco, conetnt, uri)
            });
            const converterUri = 'ts:inner/converter.d.ts';
            if (converterUri in extraLibs) {
                return;
            }
            addMonacoExtraLibs(monaco, converterDTS(pluginConfigs.map(x => x.name)), converterUri);
        }).catch(error => console.error("load extraLibs error", error));
    // 自动补全
    try {
        registerPostfix(monaco, provider => monaco.languages.registerCompletionItemProvider('javascript', provider))
    } catch (error) {
        console.error("load completionPostfix error", error)
    }
}

export default loadMonaco;