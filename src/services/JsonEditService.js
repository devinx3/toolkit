import store from './db/store'

// 写入配置
const storeJsonEditConfig = (arr) => {
    try {
        store.jsonEditConfig.store(arr);
    } catch (e) {
        console.log("storeJsonEditConfig error", e);
        return e.message;
    }
    return true;
}

// 读取配置
const listJsonEditConfig = () => {
    return store.jsonEditConfig.list();
}

// eg: [{id: 1, name: '名称', describe: '描述', scriptContent: '脚本内容'}]
// 数据源
const dataSource = listJsonEditConfig();


// 数据方法存储方法
const JsonEditService = {
    // 查询所有配置
    listAll: () => dataSource,
    // 根据 ID 查询配置
    queryById: id => {
        for (let item of dataSource) {
            if (item.id === id) {
                return item;
            }
        }
        return null;
    },
    // 添加配置
    addConfig: item => {
        let maxId = 0;
        for (let item of dataSource) {
            if (item.id > maxId) {
                maxId = item.id;
            }
        }
        // 最大id加1作为新ID
        item.id = maxId + 1;
        dataSource.push(item);
        return storeJsonEditConfig(dataSource);
    },
    // 更新配置
    updateConfig: item => {
        for (let index = 0; index < dataSource.length; index++) {
            if (dataSource[index].id === item.id) {
                dataSource[index].name = item.name;
                dataSource[index].describe = item.describe;
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
                dataSource.splice(index, 1);
                return storeJsonEditConfig(dataSource);
            }
        }
        return false;
    }
};

export default JsonEditService;