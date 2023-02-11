const Util = {
    // 下划线转小驼峰
    underlineToHump: (name) => { 
        return name.replace(/_(\w)/g, function(all, letter){
            return letter.toUpperCase(); 
        }); 
    },
    // 小驼峰转下划线
    humpToUnderline: (name) => { 
        return name.replace(/([A-Z])/g,"_$1").toLowerCase(); 
    },
    // 是否是字符串
    isStr: (input) => {
        return typeof(input) === 'string';
    },
    // 是否是空字符串
    isBlank: input => {
        return input === undefined || input === null || input === '';
    },
    // 拷贝字符串
    copyToClipboard : (inputValue) => {
		const inputEle = document.createElement('input')
		inputEle.value = inputValue
		document.body.appendChild(inputEle)
		inputEle.select() // 选取文本域内容;
		// 执行浏览器复制命令
		const result = document.execCommand('copy');
		inputEle.remove();
		return result;
	}

}

export default Util;