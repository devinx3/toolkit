import store  from './store'

const { createRepository, TYPE } = store;

// 数据源
// editConfig: [{id: 1, name: '名称', description: '描述', scriptContent: '脚本内容'}]
// editCombination: [{id: 1, name: '名称', description: '描述', combination: [1, 2, 3]}]

// 创建数据仓库
function createEditRepository (type) {
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

// 查询最大id
const queryMaxId = (baseRepository, category) => {
    const source = baseRepository.forceList(category);
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
    listAllConfig: (category) => configRepository.list(category),
    // 根据 ID 查询配置
    queryConfigById: (category, id) => queryItemById(configRepository, category, id),
    // 根据名称查询配置
    queryConfigByName: (category, name) => EditService.listAllConfig(category)?.filter(item => item.name === name) || [],
    // 添加配置
    addConfig: (category, item) => {
        // 最大id加1作为新ID
        item.id = queryMaxId(configRepository, category) + 1;
        const arr = EditService.listAllConfig(category);
        arr.push(item);
        return configRepository.store(category, arr);
    },
    // 更新配置
    updateConfig: (category, item) => {
        const source = EditService.listAllConfig(category);
        for (let index = 0; index < source.length; index++) {
            if (source[index].id === item.id) {
                source[index].name = item.name;
                source[index].description = item.description;
                source[index].scriptContent = item.scriptContent;
                return configRepository.store(category, source);
            }
        }
        return false;
    },
    // 删除配置
    deleteConfig: (category, id) => EditService.batchDeleteConfig(category, [id]),
    // 批量删除配置
    batchDeleteConfig: (category, idList) => {
        if (!(idList && idList.length && idList.length > 0)) {
            // 传入为空则代表删除成功
            return true;
        }
        const source = EditService.listAllConfig(category);
        let success = false;
        for (let index = 0; index < source.length; index++) {
            if (idList.indexOf(source[index].id) >= 0) {
                const pass = EditService.checkCombinationByConfig(category, [source[index].id]);
                if (pass !== true) {
                    return "当前配置被组合 [" + pass + "] 引用";
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
    // 查询所有组合
    listAllCombination: (category) => combinationRepository.list(category),
    // 根据 ID 查询组合
    queryCombinationById: (category, id) => queryItemById(combinationRepository, category, id),
    // 是否组合存在指定配置
    checkCombinationByConfig: (category, configIdList) => {
        for (let item of EditService.listAllCombination(category)) {
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
    addCombination: (category, item) => {
        const source = EditService.listAllCombination(category);
        // 最大id加1作为新ID
        item.id = queryMaxId(combinationRepository, category) + 1;
        source.push(item);
        return combinationRepository.store(category, source);
    },
    // 更新配置
    updateCombination: (category, item) => {
        const source = EditService.listAllCombination(category);
        for (let index = 0; index < source.length; index++) {
            if (source[index].id === item.id) {
                source[index].name = item.name;
                source[index].description = item.description;
                source[index].combination = item.combination;
                return combinationRepository.store(category, source);
            }
        }
        return false;
    },
    // 删除配置
    deleteCombination: (category, id) => EditService.batchDeleteCombination(category, [id]),
    // 批量删除配置
    batchDeleteCombination: (category, idList) => {
        if (!(idList && idList.length && idList.length > 0)) {
            // 传入为空则代表删除成功
            return true;
        }
        let success = false;
        const source = EditService.listAllCombination(category)
        for (let index = 0; index < source.length; index++) {
            if (idList.indexOf(source[index].id) >= 0) {
                source.splice(index, 1);
                index--;
                success = true;
            }
        }
        if (success) {
            return combinationRepository.store(category, source);
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