const versionStorageKey = "devinx3.toolkit.platform.version";
const upgrade1 = (v) => {
    const version = localStorage.getItem(versionStorageKey);
    if (version === v) {
        return false;
    }
    const currentTime = new Date().getTime();
    // 2024-06-01
    if (currentTime > 1717200000000) {
        alert("当前版本已过期, 已强制升级,");
        return true;
    }
    const prefix = parseInt(currentTime, 10).toString(16);
    const sufLen = 32 - prefix.length;
    const idConvertCode = id => prefix + ('' + id).padStart(sufLen, '0')
    const categories = ["json", 'txt'];
    categories.forEach(category => {
        const configKey = {
            source: `devinx3.toolkit.${category}EditOnfig`,
            target: `devinx3.toolkit.edit.config.${category}`
        };
        const historyConfigStr = localStorage.getItem(configKey.source);
        if (historyConfigStr) {
            const historyConfigArr = JSON.stringify(historyConfigStr);
            const newArr = historyConfigArr.map(item => {
                return {
                    code: idConvertCode(item.id),
                    name: item.name,
                    description: item.description,
                    scriptContent: item.scriptContent
                }
            });
            if (newArr.length > 0) localStorage.setItem(configKey.target, JSON.parse(newArr));
        }
        const combinationKey = {
            source: `devinx3.toolkit.${category}EditCombination`,
            target: `devinx3.toolkit.edit.combination.${category}`
        }
        const combinationStr = localStorage.getItem(combinationKey.source);
        if (historyConfigStr) {
            const combinationArr = JSON.stringify(combinationStr);
            const newArr = combinationArr.map(item => {
                return {
                    code: idConvertCode(item.id),
                    name: item.name,
                    description: item.description,
                    combination: item.combination?.map(id => idConvertCode(id)) || []
                }
            });
            if (newArr.length > 0) localStorage.setItem(combinationKey.target, JSON.parse(newArr));
        }
    })
    alert("已自动升级版本成功");
    return true;
}
  
const setVersion = (version) => {
    localStorage.setItem(versionStorageKey, version);
    return version;
}


const upgradeMap = { "1.0.0": upgrade1 }
const upgrade = (version) => {
    const callback = upgradeMap[version];
    try {
        if (callback ? callback(version) : true) setVersion(version)
    } catch (err) {
        console.error("系统版本升级失败", err);
        alert("系统版本升级失败, 将会刷新页面");
        window.location.reload();
    }
}


export default upgrade;