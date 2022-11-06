import store from './db/store'

// 读取配置
const listJsonEditConfig = () => {
    return store.jsonEditConfig.list();
}

// 读取配置组合
const listJsonEditCombination = () => {
    return store.jsonEditCombination.list();
}

// eg: [{id: 1, name: '名称', description: '描述', scriptContent: '脚本内容'}]
// 数据源
let dataSource = listJsonEditConfig();

// eg: [{id: 1, name: '名称', description: '描述', combination: [1, 2, 3]}]
let combinationData = listJsonEditCombination();

// 写入配置
const storeJsonEditConfig = (arr) => {
    try {
        store.jsonEditConfig.store(arr);
        dataSource = listJsonEditConfig();
    } catch (e) {
        console.log("storeJsonEditConfig error", e);
        return e.message;
    }
    return true;
}

// 写入配置
const storeJsonEditCombination = (arr) => {
    try {
        store.jsonEditCombination.store(arr);
        combinationData = listJsonEditCombination();
    } catch (e) {
        console.log("storeJsonEditCombination error", e);
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
const queryMaxId = (source) => {
    let maxId = 0;
    for (let item of source) {
        if (item.id > maxId) {
            maxId = item.id;
        }
    }
    return maxId;
}

// 数据方法存储方法
const JsonEditService = {
    // 查询所有配置
    listAllConfig: () => {
        dataSource = listJsonEditConfig();
        return dataSource;
    },
    // 根据 ID 查询配置
    queryConfigById: id => {
        return queryItemById(dataSource, id)
    },
    // 添加配置
    addConfig: item => {
        // 最大id加1作为新ID
        item.id = queryMaxId(dataSource) + 1;
        dataSource.push(item);
        return storeJsonEditConfig(dataSource);
    },
    // 更新配置
    updateConfig: item => {
        for (let index = 0; index < dataSource.length; index++) {
            if (dataSource[index].id === item.id) {
                dataSource[index].name = item.name;
                dataSource[index].description = item.description;
                dataSource[index].scriptContent = item.scriptContent;
                return storeJsonEditConfig(dataSource);
            }
        }
        return false;
    },
    // 删除配置
    deleteConfig: id => {
        for (let index = 0; index < dataSource.length; index++) {
            if (dataSource[index].id === id) {
                const pass = JsonEditService.checkCombinationByConfig([id]);
                if (pass !== true) {
                    return "当前配置被组合[" + pass + "]引用";
                }
                dataSource.splice(index, 1);
                return storeJsonEditConfig(dataSource);
            }
        }
        return false;
    },
    // 批量删除配置
    batchDeleteConfig: idList => {
        if (!(idList && idList.length && idList.length > 0)) {
            // 传入为空则代表删除成功
            return true;
        }
        let success = false;
        for (let index = 0; index < dataSource.length; index++) {
            if (idList.indexOf(dataSource[index].id) >= 0) {
                const pass = JsonEditService.checkCombinationByConfig([dataSource[index].id]);
                if (pass !== true) {
                    return "当前配置被组合 [" + pass + "] 引用";
                }
                dataSource.splice(index, 1);
                index--;
                success = true;
            }
        }
        if (success) {
            return storeJsonEditConfig(dataSource);
        }
        return false;
    },
    // 查询所有组合
    listAllCombination: () => {
        combinationData = listJsonEditCombination();
        return combinationData;
    },
    // 根据 ID 查询组合
    queryCombinationById: id => {
        return queryItemById(combinationData, id)
    },
    // 是否组合存在指定配置
    checkCombinationByConfig: configIdList => {
        for (let item of combinationData) {
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
    addCombination: item => {
        // 最大id加1作为新ID
        item.id = queryMaxId(combinationData) + 1;
        combinationData.push(item);
        return storeJsonEditCombination(combinationData);
    },
    // 更新配置
    updateCombination: item => {
        for (let index = 0; index < combinationData.length; index++) {
            if (combinationData[index].id === item.id) {
                combinationData[index].name = item.name;
                combinationData[index].description = item.description;
                combinationData[index].combination = item.combination;
                return storeJsonEditCombination(combinationData);
            }
        }
        return false;
    },
    // 删除配置
    deleteCombination: id => {
        for (let index = 0; index < combinationData.length; index++) {
            if (combinationData[index].id === id) {
                combinationData.splice(index, 1);
                return storeJsonEditCombination(combinationData);
            }
        }
        return false;
    },
    // 批量删除配置
    batchDeleteCombination: idList => {
        if (!(idList && idList.length && idList.length > 0)) {
            // 传入为空则代表删除成功
            return true;
        }
        let success = false;
        for (let index = 0; index < combinationData.length; index++) {
            if (idList.indexOf(combinationData[index].id) >= 0) {
                combinationData.splice(index, 1);
                index--;
                success = true;
            }
        }
        if (success) {
            return storeJsonEditConfig(combinationData);
        }
        return false;
    },
};

export default JsonEditService;