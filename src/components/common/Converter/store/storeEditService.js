import store from './store'
import { LANG } from '../constants'


// 读取配置
const listConfig = (lang) => {
    return store.editConfig.list(lang) || [];
}
// 加载所有脚本
const loadAllConfig = () => {
    const data = {};
    for (const key in LANG) {
        const lang = LANG[key];
        data[lang] = listConfig(lang)
    }
    return data;
}

// 读取配置组合
const listCombination = (lang) => {
    return store.editCombination.list(lang);
}
// 加载所有配置组合
const loadAllCombination = () => {
    const data = {};
    for (const lang in LANG) {
        data[lang] = listCombination(lang)
    }
    return data;
}

// eg: {json: [{id: 1, name: '名称', description: '描述', scriptContent: '脚本内容'}] }
// 数据源
const configCache = loadAllConfig();

// eg: [{id: 1, name: '名称', description: '描述', combination: [1, 2, 3]}]
const combinationCache = loadAllCombination();

// 写入配置
const storeEditConfig = (lang, arr) => {
    try {
        store.editConfig.store(lang, arr);
        configCache[lang] = listConfig(lang);
    } catch (e) {
        console.log("storeEditConfig error", e);
        return e.message;
    }
    return true;
}

// 写入配置
const storeEditCombination = (lang, arr) => {
    try {
        store.editCombination.store(lang, arr);
        combinationCache[lang] = listCombination(lang);
    } catch (e) {
        console.log("storeEditCombination error", e);
        return e.message;
    }
    return true;
}

// 根据id在数据源查询数据
const queryItemById = (source, id) => {
    for (let item of source) {
        if (item.id === id) {
            return item;
        }
    }
    return null;
}

// 查询最大id
const queryMaxId = (fn, lang) => {
    const source = fn(lang);
    let maxId = 0;
    for (let item of source) {
        if (item.id > maxId) {
            maxId = item.id;
        }
    }
    return maxId;
}

// 数据方法存储方法
const EditService = {
    // 查询所有配置
    listAllConfig: (lang) => {
        configCache[lang] = listConfig(lang)
        return configCache[lang];
    },
    // 根据 ID 查询配置
    queryConfigById: (lang, id) => {
        return queryItemById(configCache[lang], id)
    },
    // 添加配置
    addConfig: (lang, item) => {
        // 最大id加1作为新ID
        item.id = queryMaxId(listConfig, lang) + 1;
        configCache[lang].push(item);
        return storeEditConfig(lang, configCache[lang]);
    },
    // 更新配置
    updateConfig: (lang, item) => {
        const source = configCache[lang];
        for (let index = 0; index < source.length; index++) {
            if (source[index].id === item.id) {
                source[index].name = item.name;
                source[index].description = item.description;
                source[index].scriptContent = item.scriptContent;
                return storeEditConfig(lang, source);
            }
        }
        return false;
    },
    // 删除配置
    deleteConfig: (lang, id) => {
        return EditService.batchDeleteConfig(lang, [id]);
    },
    // 批量删除配置
    batchDeleteConfig: (lang, idList) => {
        if (!(idList && idList.length && idList.length > 0)) {
            // 传入为空则代表删除成功
            return true;
        }
        const source = configCache[lang];
        let success = false;
        for (let index = 0; index < source.length; index++) {
            if (idList.indexOf(source[index].id) >= 0) {
                const pass = EditService.checkCombinationByConfig(lang, [source[index].id]);
                if (pass !== true) {
                    return "当前配置被组合 [" + pass + "] 引用";
                }
                source.splice(index, 1);
                index--;
                success = true;
            }
        }
        if (success) {
            return storeEditConfig(lang, source);
        }
        return "数据不存在, 请刷新页面";
    },
    // 查询所有组合
    listAllCombination: (lang) => {
        combinationCache[lang] = listCombination(lang);
        return combinationCache[lang];
    },
    // 根据 ID 查询组合
    queryCombinationById: (lang, id) => {
        return queryItemById(combinationCache[lang], id)
    },
    // 是否组合存在指定配置
    checkCombinationByConfig: (lang, configIdList) => {
        for (let item of EditService.listAllCombination(lang)) {
            if (item.combination) {
                for (let configId of item.combination) {
                    if (configIdList.indexOf(configId) >= 0) {
                        return item.name || "-";
                    }
                }
            }
        }
        return true;
    },
    // 添加组合
    addCombination: (lang, item) => {
        const source = combinationCache[lang];
        // 最大id加1作为新ID
        item.id = queryMaxId(listCombination, lang) + 1;
        source.push(item);
        return storeEditCombination(lang, source);
    },
    // 更新配置
    updateCombination: (lang, item) => {
        const source = combinationCache[lang];
        for (let index = 0; index < source.length; index++) {
            if (source[index].id === item.id) {
                source[index].name = item.name;
                source[index].description = item.description;
                source[index].combination = item.combination;
                return storeEditCombination(lang, source);
            }
        }
        return false;
    },
    // 删除配置
    deleteCombination: (lang, id) => {
        return EditService.batchDeleteCombination(lang, [id]);
    },
    // 批量删除配置
    batchDeleteCombination: (lang, idList) => {
        if (!(idList && idList.length && idList.length > 0)) {
            // 传入为空则代表删除成功
            return true;
        }
        let success = false;
        const source = combinationCache[lang];
        for (let index = 0; index < source.length; index++) {
            if (idList.indexOf(source[index].id) >= 0) {
                source.splice(index, 1);
                index--;
                success = true;
            }
        }
        if (success) {
            return storeEditCombination(lang, source);
        }
        return false;
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
        } else {
            reject(result)
        }
    })
}

export default EditService;