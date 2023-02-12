// eslint-disable-next-line
import * as MonacoType from 'monaco-editor/esm/vs/editor/editor.api';

const converterDTS =
`declare const inputData: (string | Object | File[]);
declare const inputObj: (Object | null)
declare const Util: ({
    _: object;
    dayjs: object,
    cryptoJS: object,
    XLSX: object,
    message: {
        info(content: string, duration?: number): void;
        success(content: string, duration?: number): void;
        error(content: string, duration?: number): void;
        warning(content: string, duration?: number): void;
        loading(content: string, duration?: number): void;
    }
});`;

// 添加扩展库
const addMonacoExtraLibs = (monaco, libSource, libUri) => {
    monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
    monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));
}

/**
 * 加载编辑器
 * @param {MonacoType} monaco 
 */
 function loadMonaco(monaco) {
    if (!monaco) {
        return;
    }
    const extraLibs = monaco.languages.typescript.javascriptDefaults.getExtraLibs() || {};
    const converterUri = 'ts:inner/converter.d.ts';
    if (extraLibs[converterUri] === undefined) {
        addMonacoExtraLibs(monaco, converterDTS, converterUri);
    }
}

export default loadMonaco;