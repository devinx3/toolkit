const Util = {
    // 读取文件内容(默认以UTF8格式读取)
    readAsText: (file, setFileContent, charset) => {
        if (!charset) {
            charset = 'utf8';
        }
        const reader = new FileReader();
        reader.onload = () =>{
            setFileContent(reader.result)
        }
        reader.readAsText(file, charset);
    },
    // 下载文件
    download : (data, fileName) => {
        if (!fileName) {
            fileName = 'download';
        }
        let url = URL.createObjectURL(new Blob([data]))
        const aEle = document.createElement('a')
        aEle.href = url
        aEle.setAttribute('download', fileName)
        document.body.appendChild(aEle)
        // 模拟点击下载
        aEle.click()
        // 移除改下载标签
        document.body.removeChild(aEle);
    }
}

export default Util;