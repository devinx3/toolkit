import { ScriptUtil } from '../manage/handler';
import store from './store'

const { createRepository, TYPE } = store;

// 数据源
// editConfig: [{id: 1, name: '名称', description: '描述', scriptContent: '脚本内容'}]
// editCombination: [{id: 1, name: '名称', description: '描述', combination: [1, 2, 3]}]

// 创建数据仓库
function createEditRepository(type) {
    const baseRepository = createRepository(type)
    const store = (category, obj) => {
        try {
            baseRepository.store(category, obj)
        } catch (e) {
            console.log(`store ${type} error`, e);
            return e.message;
        }
        return true;
    }
    return {
        forceList: baseRepository.forceList,
        list: baseRepository.list,
        store
    }
}

// 数据仓库
const configRepository = createEditRepository(TYPE.editConfig);
const combinationRepository = createEditRepository(TYPE.editCombination);

// 根据id在数据源查询数据
const queryItemById = (baseRepository, category, id) => {
    const source = baseRepository.list(category);
    for (let item of source) {
        if (item.id === id) {
            return item;
        }
    }
    return null;
}

// 根据编码在数据源查询数据
const queryItemByCode = (baseRepository, category, code) => {
    const source = baseRepository.list(category);
    const list = [];
    for (let item of source) {
        if (item.code === code) {
            list.push(item);
        }
    }
    return list;
}

// 判断编码是否唯一
const checkUniqueCode = (baseRepository, category, code) => {
    const source = baseRepository.forceList(category);
    for (let item of source) {
        if (item.code === code) {
            throw new Error("编码重复, 请修改冲重新添加");
        }
    }
    return true;
}

const nextSeed = (() => {
    let _seed = 1;
    return () => _seed++;
})();

// 数据方法存储方法
const EditService = {
    // 查询所有节点
    listAllConfig: (category) => configRepository.list(category),
    // 根据编码查询节点
    queryConfigByCode: (category, code) => queryItemByCode(configRepository, category, code),
    // 根据名称查询节点
    queryConfigByName: (category, name) => EditService.listAllConfig(category)?.filter(item => item.name === name) || [],
    // 添加节点
    addConfig: (category, item, importFlag) => {
        // 生成编码
        item.code = importFlag ? item.code : null;
        if (!item.code) item.code = ScriptUtil.generateCode(item.name + '-' + new Date().getTime() + '-' + nextSeed());
        checkUniqueCode(configRepository, category, item.code);
        const arr = EditService.listAllConfig(category);
        arr.push(item);
        return configRepository.store(category, arr);
    },
    // 更新节点
    updateConfig: (category, item, importFlag) => {
        const source = EditService.listAllConfig(category);
        for (let index = 0; index < source.length; index++) {
            if (source[index].code === item.code) {
                source[index].name = item.name;
                source[index].description = item.description;
                source[index].scriptContent = item.scriptContent;
                source[index].hidden = item.hidden ? 1 : undefined;
                source[index].version = importFlag ? item.version || undefined : ScriptUtil.generateVersion();
                return configRepository.store(category, source);
            }
        }
        return false;
    },
    // 隐藏节点
    hiddenConfig: (category, codeList, hidden) => {
        if (!codeList || codeList.length === 0) {
            return;
        }
        const source = EditService.listAllConfig(category);
        for (let index = 0; index < source.length; index++) {
            if (codeList.includes(source[index].code)) {
                source[index].hidden = hidden ? 1 : undefined;
                source[index].version = ScriptUtil.generateVersion();
            }
        }
        return configRepository.store(category, source);
    },
    // 删除节点
    deleteConfig: (category, code) => EditService.batchDeleteConfig(category, [code]),
    // 批量删除节点
    batchDeleteConfig: (category, codeList) => {
        if (!(codeList && codeList.length && codeList.length > 0)) {
            // 传入为空则代表删除成功
            return true;
        }
        const source = EditService.listAllConfig(category);
        let success = false;
        for (let index = 0; index < source.length; index++) {
            if (codeList.indexOf(source[index].code) >= 0) {
                const pass = EditService.checkCombinationByConfig(category, [source[index].code]);
                if (pass !== true) {
                    return "当前节点被编排 [" + pass + "] 引用";
                }
                source.splice(index, 1);
                index--;
                success = true;
            }
        }
        if (success) {
            return configRepository.store(category, source);
        }
        return "数据不存在, 请刷新页面";
    },
    // 查询所有编排
    listAllCombination: (category) => combinationRepository.list(category),
    // 根据编码查询编排
    queryCombinationByCode: (category, code) => queryItemById(combinationRepository, category, code),
    // 是否编排存在指定节点
    checkCombinationByConfig: (category, configCodeList) => {
        for (let item of EditService.listAllCombination(category)) {
            if (item.combination) {
                for (let configCode of item.combination) {
                    if (configCodeList.indexOf(configCode) >= 0) {
                        return item.name || "-";
                    }
                }
            }
        }
        return true;
    },
    // 添加编排
    addCombination: (category, item) => {
        const source = EditService.listAllCombination(category);
        item.code = ScriptUtil.generateCode(item.name + '-' + new Date().getTime() + '-' + nextSeed());
        checkUniqueCode(combinationRepository, category, item.code);
        source.push(item);
        return combinationRepository.store(category, source);
    },
    // 更新节点
    updateCombination: (category, item) => {
        const source = EditService.listAllCombination(category);
        for (let index = 0; index < source.length; index++) {
            if (source[index].code === item.code) {
                source[index].name = item.name;
                source[index].description = item.description;
                source[index].combination = item.combination;
                source[index].version = ScriptUtil.generateVersion();
                return combinationRepository.store(category, source);
            }
        }
        return "数据不存在, 请刷新页面";
    },
    // 删除节点
    deleteCombination: (category, code) => EditService.batchDeleteCombination(category, [code]),
    // 批量删除节点
    batchDeleteCombination: (category, codeList) => {
        if (!(codeList && codeList.length && codeList.length > 0)) {
            // 传入为空则代表删除成功
            return true;
        }
        let success = false;
        const source = EditService.listAllCombination(category)
        for (let index = 0; index < source.length; index++) {
            if (codeList.indexOf(source[index].code) >= 0) {
                source.splice(index, 1);
                index--;
                success = true;
            }
        }
        if (success) {
            return combinationRepository.store(category, source);
        }
        return "数据不存在, 请刷新页面";
    },
};

/**
 * 执行流程
 * 
 * @param {Function} task     待执行逻辑
 * @param {Object[]} params  待执行逻辑参数
 */
export const requestService = (fn, ...params) => {
    return new Promise((resove, reject) => {
        let result = false;
        try {
            result = fn.apply(this, params);
        } catch (error) {
            reject(error.message);
        }
        if (result === true) {
            resove.apply(this, params)
        } else if (result instanceof Array) {
            resove.apply(this, [result])
        } else if (result instanceof Object) {
            resove.apply(this, result)
        } else {
            reject(result)
        }
    })
}

export default EditService;