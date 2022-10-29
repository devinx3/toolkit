const storeKey = {
    jsonEditConfig: 'devinx3.toolkit.jsonEditOnfig'
}

const store = {
    jsonEditConfig: {
        list: () => {
            const json = localStorage.getItem(storeKey.jsonEditConfig);
            return json ? JSON.parse(json) : [];
        },
        store: (arr) => {
            localStorage.setItem(storeKey.jsonEditConfig, JSON.stringify(arr));
        }
    }
}


export default store;