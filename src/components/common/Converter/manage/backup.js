import { dynamicConfig, SIMPLE_SECRET_STRATEGY } from './handler';
import lzString from 'lz-string'

const CONFIG_VERSION = 101
// 密钥
export const SECRET_KEY_NAME = 'secretKey';
// 备份数据key
const BACKUP_DATA_NAME = 'd';
const BACKUP_CONFIG_NAME = 'c';
const BACKUP_SECRET_STRATEGY_NAME = 'ss';

/**
 * 备份共享数据(一般都是单个数据)
 * @param {JSON} originData 原始数据
 * @returns {string} 备份的字符串
 */
export function backup2ShareData(originData) {
    return lzString.compressToEncodedURIComponent(JSON.stringify(originData));
}

/**
 * 恢复共享数据(一般都是单个数据)
 * @param {string} shareData 备份的字符串
 * @returns {JSON} 原始数据
 */
export function restoreByShareData(shareData) {
    shareData = lzString.decompressFromEncodedURIComponent(shareData);
    try {
        shareData = JSON.parse(shareData);
    } catch (e) {
        throw new Error("数据格式异常");
    }
    return shareData;
}

/**
 * 备份导入数据(一般都是多个数据)
 * @param {JSON & Array} originData 原始数据
 * @param {{
 *  secretKey: string
 * }} options 选项
 * @returns {string} 备份的字符串
 */
export function backup2ImportData(originData, options) {
    const secretStrategy = options.secretKey ? SIMPLE_SECRET_STRATEGY : undefined;
    const data = dynamicConfig.convertBackupData(JSON.stringify(originData), CONFIG_VERSION, secretStrategy, options.secretKey);
    const config = {};
    if (secretStrategy) config[BACKUP_SECRET_STRATEGY_NAME] = secretStrategy;
    let backupData = {};
    backupData[BACKUP_DATA_NAME] = data;
    if (Object.keys(config).length > 0) {
        backupData[BACKUP_CONFIG_NAME] = config;
    }
    return JSON.stringify(backupData);
}

/**
 * 恢复导入数据(一般都是单个数据)
 * @param {string} importData 备份的字符串
 * @param {string} secretKey
 * @returns {JSON} 原始数据
 */
export function restoreByImportData(importData, secretKey) {
    const importObj = JSON.parse(importData);
    let dataSource = importObj[BACKUP_DATA_NAME];
    if (!(typeof (dataSource) === 'string')) {
        throw new Error("数据格式异常");
    }
    let dataConfig = importObj[BACKUP_CONFIG_NAME];
    if (dataConfig) {
        if (!(typeof (dataConfig) === 'object')) throw new Error("数据格式异常");
        dataConfig.secretKey = secretKey;
    }
    try {
        let obj = JSON.parse(dataSource);
        dataSource = obj[BACKUP_DATA_NAME];
        dataConfig = obj[BACKUP_CONFIG_NAME];
    } catch (e) {
    }
    if (!dataConfig) {
        dataConfig = {};
    }
    return JSON.parse(dynamicConfig.convertOriginData(dataSource, dataConfig[BACKUP_SECRET_STRATEGY_NAME], dataConfig.secretKey || secretKey));
}