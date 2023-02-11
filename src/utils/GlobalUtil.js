// 缓存
const cache = {};

// 工具
const Util = {
    // 从缓存获取数据
    getFromCache: key => {
        return cache[key];
    },
    // 设置到缓存
    setToCache: (key, val) => {
        return cache[key] = val;
    },
    getAdvanceKey: () => {
        return 'active=adv';
    },
    // 使用高级功能
    enableAdvance: () => {
        if (cache['adv'] === null || cache['adv'] === undefined) {
            cache['adv'] = window.localStorage.getItem(Util.getAdvanceKey()) === '1';
        }
        return cache['adv'] === true;
    },
    // 设置高级功能
    setAdvance: () => {
        cache['adv'] = true;
        window.localStorage.setItem(Util.getAdvanceKey(), '1');
    },
    // 剔除未使用的对象
    omit: (obj, fields) => {
        // eslint-disable-next-line prefer-object-spread
        const shallowCopy = Object.assign({}, obj);
        for (let i = 0; i < fields.length; i += 1) {
            const key = fields[i];
            delete shallowCopy[key];
        }
        return shallowCopy;
    }
};

export default Util;