const tableInfo = {
    getEditConfigKey: category => `devinx3.toolkit.edit.config.${category}`,
    getEditCombinationKey: category => `devinx3.toolkit.edit.combination.${category}`
}

// 查询数据
const query = key => {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : null;
}

// 列表展示
const list = key => {
    return query(key) || [];
}

// 存储对象
const storeObj = (key, obj) => {
    localStorage.setItem(key, JSON.stringify(obj));
}

const TYPE = { editConfig: 'editConfig', editCombination: 'editCombination' };
// 存储
const mapperContext = (() => {
    const _mapper = {};
    const _generateMapper = (getTableKey) => {
        return {
            query: (category) => query(getTableKey(category)),
            list: (category) => list(getTableKey(category)),
            store: (category, obj) => storeObj(getTableKey(category), obj),
        }
    }
    return {
        registerMapper: (type, getTableKey) => _mapper[type] = _generateMapper(getTableKey),
        getMapper: type => _mapper[type],
    }
})();
// 缓存
const cacheDataSource = {};
const clearCache = (key) => cacheDataSource[key] = undefined;
const getCacheKey = (type, category) => type + "|" + category;
// 创建仓库
function createRepository(type) {
    const baseMapper = mapperContext.getMapper(type);
    const forceList = (category) => {
        return baseMapper.list(category) || [];
    }
    const list = (category) => {
        const key = getCacheKey(type, category);
        let arr = cacheDataSource[key];
        if (arr === undefined) {
            arr = forceList(category);
            cacheDataSource[key] = arr;
        }
        return [...arr];
    };
    const store = (category, arr) => {
        baseMapper.store(category, arr);
        clearCache(getCacheKey(type, category))
        return true;
    }
    return { forceList, list, store };
}

// 导出对象
const exports = {
    createRepository,
    TYPE
};
// 加载
(() => {
    mapperContext.registerMapper(TYPE.editConfig, tableInfo.getEditConfigKey);
    mapperContext.registerMapper(TYPE.editCombination, tableInfo.getEditCombinationKey)
})()
export default exports;