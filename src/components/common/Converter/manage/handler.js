import CryptoJS from 'crypto-js';
import { SCRIPT_CODE_PREFIX } from '../constants'

export const SIMPLE_SECRET_STRATEGY = 1;
const secretContext = (() => {
    const defaultStrategy = {
        encrypt: (str) => str,
        decrypt: (str) => str,
    }
    const _context = {}
    const register = (strategyType, strategyCallback) => _context[strategyType] = strategyCallback;
    register(SIMPLE_SECRET_STRATEGY, {
        encrypt: (str, secret) => CryptoJS.AES.encrypt(str, secret).toString(),
        decrypt: (str, secret) => CryptoJS.AES.decrypt(str, secret).toString(CryptoJS.enc.Utf8),
    })
    return (strategyType) => _context[strategyType] || defaultStrategy;
})();

class DynamicConfig {
    constructor() {
        // 特征前缀
        this.featurePrefix = 'devinx3';
        // 秘钥前缀(前缀长度固定3位)
        this.verionPrefix = 'ver';
        // 固定版本(版本长度固定3位)
        this.fixVersion = '000';
        // 固定秘钥(秘钥长度固定6位)
        this.fixSecret = 'ver000';
        // 转换秘钥(秘钥长度固定6位)
    }
    // 加密
    encrypt(str, secret) {
        return CryptoJS.AES.encrypt(str, secret).toString();
    }
    // 解密
    decrypt(str, secret) {
        return CryptoJS.AES.decrypt(str, secret).toString(CryptoJS.enc.Utf8);
    }
    convertSecret(verion) {
        if (verion >= 100 && verion <= 999) {
            return this.verionPrefix + verion;
        }
        return this.fixSecret;
    }
    // 转换特征(secret: 秘钥)
    getFeatureSuffix(secret) {
        return secret === this.fixSecret ? 'S' : 'l';
    }
    // 获取特征秘钥索引(索引顺序从小到大)
    getFeatureSecretIndex(processLen) {
        if (processLen < 100) {
            return -1;
        }
        const start = 10;
        // 结尾长度10也不用
        const useLength = processLen - 10 - start;
        const result = [];
        const prime = [17, 27, 23, 3, 19, 11];
        for (let i = 0; i < 6; i++) {
            // 索引 = 开始位置 + (使用长度 * 质数 / 30)
            result.push(start + ((useLength * prime[i] / 30) ^ 0));
        }
        return result;
    }
    // 指定索引添加值
    addSecret(str, index, value) {
        return str.slice(0, index) + value + str.slice(index);
    }
    // 删除指定索引的值
    removeSecret(str, index) {
        return str.slice(0, index) + str.slice(index + 1);
    }
    // 转换备份数据
    convertBackupData(originData, verion, secretStrategy, dynamicSecretKey) {
        const str = secretContext(secretStrategy).encrypt(originData, dynamicSecretKey);
        // 秘钥组成
        // 以 devinx3 开头
        // 后面接长度以l/S结束(仅仅当默认密码时为S, 否则为l)(这里的值不要和特征前缀存在相同字符)
        // 当密文长度小于100时, 使用默认秘钥重新加密
        // 当密文长度大于等于100时, 根据秘钥长度获取索引位置, 从而将秘钥保存到字符串中
        // 即: processPrefix(特征前缀) + processLen(数据长度) + processSuffix(特征后缀) + encryptData(可能包含秘钥的加密字符串)

        // 秘钥
        let secret = this.convertSecret(verion);
        // 加密字符串
        let encryptData = this.encrypt(str, secret);
        // secret 将分布在 encryptData 字符串中
        if (encryptData.length < 100) {
            // 固定字符串
            secret = this.fixSecret;
            encryptData = this.encrypt(str, secret);
        }
        // 特征前缀
        const processPrefix = this.featurePrefix;
        // 数据长度
        const processLen = encryptData.length;
        // 特征后缀
        const processSuffix = this.getFeatureSuffix(secret);
        if (secret === this.fixSecret) {
            // 返回结果
            return processPrefix + processLen + processSuffix + encryptData;
        }
        // 秘钥索引位置
        const secretIndex = this.getFeatureSecretIndex(processLen);
        let newEncryptData = encryptData;
        for (let i = secretIndex.length - 1; i >= 0; i--) {
            // 指定位置添加秘钥
            newEncryptData = this.addSecret(newEncryptData, secretIndex[i], secret[i]);
        }
        return processPrefix + processLen + processSuffix + newEncryptData;
    }
    // 转换为原始数据
    convertOriginData(backupData, secretStrategy, dynamicSecretKey) {
        if (!backupData) {
            throw new Error('数据不能为空');
        }
        // 匹配特征前缀
        const processPrefix = backupData.slice(0, this.featurePrefix.length);
        if (processPrefix !== this.featurePrefix) {
            // 匹配特征前缀异常
            throw new Error('匹配特征前缀异常');
        }
        // 特征后缀
        const maxfeatureSuffixIndex = processPrefix.length + 10;
        let processSuffix = 'l';
        let processSuffixIndex = backupData.indexOf(processSuffix);
        if (processSuffixIndex < 0 || processSuffixIndex >= maxfeatureSuffixIndex) {
            processSuffix = 'S';
            processSuffixIndex = backupData.indexOf(processSuffix);
            if (processSuffixIndex < 0 || processSuffixIndex >= maxfeatureSuffixIndex) {
                // 匹配特征后缀异常
                throw new Error('匹配特征后缀异常');
            }
        }
        // 批量长度
        let processLen = Number(backupData.slice(processPrefix.length, processSuffixIndex));
        if (!processLen) {
            // 匹配数据长度异常
            throw new Error('匹配数据长度异常');
        }
        const secretIndex = this.getFeatureSecretIndex(processLen);
        const encryptData = backupData.slice(processSuffixIndex + 1);
        let exportStr = '';
        if (secretIndex === -1) {
            exportStr = this.encrypt(backupData, encryptData);
        } else {
            let newEncryptData = encryptData;
            let secret = '';
            for (let i = 0; i < secretIndex.length; i++) {
                // 指定位置
                secret = secret + newEncryptData[secretIndex[i]];
                newEncryptData = this.removeSecret(newEncryptData, secretIndex[i]);
            }
            exportStr = this.decrypt(newEncryptData, secret);
        }
        try {
            return secretContext(secretStrategy).decrypt(exportStr, dynamicSecretKey);
        } catch (e) {
            console.error(e)
            throw new Error('密钥错误');
        }
    }
}
export const dynamicConfig = new DynamicConfig();


// 生成编码
const generateCode = (input) => {
    return CryptoJS.MD5(input || '0').toString(CryptoJS.enc.Hex);
}

// 生成平台编码
const generatePlatformCode = (input) => {
    return SCRIPT_CODE_PREFIX.PLATFORM + generateCode(input);
}
// 判断是否是平台编码
const isPlatformCode = (code) => {
    return code?.startsWith && code.startsWith(SCRIPT_CODE_PREFIX.PLATFORM);
}

// 2024-01-01 00:00:00
const START_TIME = 1704038400000;
// 设置版本
const generateVersion = () => {
    return parseInt(Math.floor((new Date().getTime() - START_TIME) / 1000), 10).toString(16);
}
// 根据版本判断是否可更新
const canUpdate = (sourceVersion, targetVersion) => {
    // 不存在报错, 可直接更新
    if (!sourceVersion) return true;
    if (!targetVersion) return false;
    const sourceNum = parseInt(sourceVersion, 16);
    const targetNum = parseInt(targetVersion, 16);
    return targetNum > sourceNum;
}

export const ScriptUtil = {
    generateCode,
    generateVersion,
    canUpdate,
    // 转换基本按钮
    convertBasicButtons: (basicButtons) => {
        const dataSource = [];
        basicButtons && basicButtons.forEach((basicButton, i) => {
            const item = { ...basicButton };
            item.code = generatePlatformCode(basicButton.code || i);
            dataSource.push(item);
        })
        return dataSource;
    },
    isBasic: (config) => {
        return config?.code ? isPlatformCode(config.code) : isPlatformCode(config);
    }
}