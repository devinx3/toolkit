// 默认配置项
const defaultOptions = {
    timeout: 60000,
    callbackParamName: 'callback',
};

// 生成默认的回调方法名
function generateFunctionName() {
    return `jsonp_${Date.now()}_${Math.ceil(Math.random() * 100000)}`;
}

// 调用完成事件
function complete(requestOptions, context) {
    // 设置完成标志位
    context.completed = true;
    // 清理资源
    if (context.scriptElement?.parentNode) context.scriptElement.parentNode.removeChild(context.scriptElement);
    if (context.timerId) clearTimeout(context.timerId);
    try {
        if (context.overwritten === undefined) {
            delete window[requestOptions.functionName];
        } else {
            window[requestOptions.functionName] = context.overwritten;
        }
    } catch (e) {
        window[requestOptions.functionName] = undefined;
    }
}

// 创建 script 标签
function createScriptElement(requestOptions, context) {
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('src', `${requestOptions.url}${requestOptions.callbackParamName}=${requestOptions.functionName}`);
    scriptElement.id = context.scriptId;
    return scriptElement;
}

// jsonp 调用
function jsonp(_url, options = {}) {
    // 用户请求配置
    const requestOptions = {
        url: _url,
        callbackParamName: options.callback || options.callbackParamName,
        functionName: options.name || generateFunctionName(),
        timeout: options.timeout || defaultOptions.timeout,
    }
    requestOptions.url = `${requestOptions.url}${(requestOptions.url.indexOf('?') === -1) ? '?' : '&'}${requestOptions.functionName}`;
    // 上下文环境
    const context = {
        scriptId: `script_${requestOptions.functionName}`,
        timerId: null,
        scriptElement: null,
        completed: false,
        overwritten: undefined,
    }
    return new Promise((resolve, reject) => {
        context.overwritten = window[requestOptions.functionName];
        window[requestOptions.functionName] = (response) => {
            resolve(response);
            complete(requestOptions, context);
        };
        context.scriptElement = createScriptElement(requestOptions, context);
        // 加载完成后执行
        context.scriptElement.onload = (e) => {
            if (!context.completed) {
                // 没有执行完成
                reject(new Error(`JSONP parse ${_url} response failed`));
                complete(requestOptions, context);
            }
        }
        // catch 404/500
        context.scriptElement.onerror = () => {
            reject(new Error(`JSONP request to ${_url} failed`));
            complete(requestOptions, context);
        };
        // 添加到文件中
        document.head.appendChild(context.scriptElement);
        // 设置定时器
        context.timerId = setTimeout(() => {
            reject(new Error(`JSONP request to ${_url} timed out`));
            complete(requestOptions, context);
        }, requestOptions.timeout);
    });
}

export default jsonp;