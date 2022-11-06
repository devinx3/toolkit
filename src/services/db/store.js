const storeKey = {
    jsonEditConfig: 'devinx3.toolkit.jsonEditOnfig',
    jsonEditCombination: 'devinx3.toolkit.jsonEditCombination',
}

// 列表展示
const list = key => {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : [];
}

// 存储数组
const storeArr = (key, arr) => {
    localStorage.setItem(key, JSON.stringify(arr));
}

// 存储对象
const store = {
    jsonEditConfig: {
        list: () => list(storeKey.jsonEditConfig),
        store: (arr) => storeArr(storeKey.jsonEditConfig, arr),
    },
    jsonEditCombination: {
        list: () => list(storeKey.jsonEditCombination),
        store: (arr) => storeArr(storeKey.jsonEditCombination, arr),
    }
}


export default store;