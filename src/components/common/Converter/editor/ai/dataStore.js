import CryptoJS from 'crypto-js';

const modelStorage = "devinx3.toolkit.ai.setting.model";
const favoriteModelStorage = "devinx3.toolkit.ai.setting.model.favorite";

// 加密
function encrypt(str) {
    return CryptoJS.AES.encrypt(str, "devinx3").toString();
}
// 解密
function decrypt(str) {
    return CryptoJS.AES.decrypt(str, "devinx3").toString(CryptoJS.enc.Utf8);
}

// 数据存储对象
class DataStore {
    getFavoriteModel() {
        return window.localStorage.getItem(favoriteModelStorage);
    }
    updateFavoriteModel(favoriteModel) {
        window.localStorage.setItem(favoriteModelStorage, favoriteModel);
    }
    setModelStore(models) {
        window.localStorage.setItem(modelStorage, JSON.stringify(models));
    }
    listModelStore() {
        const data = window.localStorage.getItem(modelStorage);
        return data ? JSON.parse(data) : [];
    }
    setModel(models) {
        this.setModelStore(models);
    }
    listModel() {
        return this.listModelStore();
    }
    getModel(model, needDencrypt) {
        for (const modelData of this.listModel()) {
            if (modelData.model === model) {
                if (needDencrypt) {
                    modelData.secretKey = decrypt(modelData.secretKey);
                }
                return modelData;
            }
        }
        return null;
    }
    createModel(modelData) {
        let data = this.getModel(modelData.model);
        if (data) {
            throw new Error("模型" + modelData.model + "已存在");
        }
        if (modelData.secretKey) {
            modelData.secretKey = encrypt(modelData.secretKey);
        }
        this.setModel([...this.listModel(), modelData]);
    }
    updateModel(modelData) {
        const modelList = [];
        for (const dbModel of this.listModel()) {
            if (dbModel.model === modelData.model) {
                if (modelData.secretKey) {
                    modelData.secretKey = encrypt(modelData.secretKey);
                } else {
                    modelData.secretKey = dbModel.secretKey;
                }
                modelList.push(modelData);
            } else {
                modelList.push(dbModel);
            }
        }
        this.setModel(modelList);
    }
    deleteModel(model) {
        const modelList = [];
        for (const dbModel of this.listModel()) {
            if (dbModel.model !== model) {
                modelList.push(dbModel);
            }
        }
        this.setModel(modelList);
    }
}

export default DataStore;