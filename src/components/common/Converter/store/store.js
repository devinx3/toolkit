const generateEditConfigKey = lang => {
    return `devinx3.toolkit.${lang}EditOnfig`
}
const generateEditCombinationKey = lang => {
    return `devinx3.toolkit.${lang}EditCombination`
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
    editConfig: {
        list: (lang) => list(generateEditConfigKey(lang)),
        store: (lang, arr) => storeArr(generateEditConfigKey(lang), arr),
    },
    editCombination: {
        list: (lang) => list(generateEditCombinationKey(lang)),
        store: (lang, arr) => storeArr(generateEditCombinationKey(lang), arr),
    }
}


export default store;