import defUtils from './utils'

// CompletionItem 构造器
const RegexExpression = '{{expr(?::(upper|lower|capitalize))?}}'
const convert = {
    'upper': x => x.toUpperCase(), // 转大写
    'lower': x => x.toLowerCase(), // 转小写
    'capitalize': x => x.substring(0, 1).toUpperCase() + x.substring(1), // 首字母大写
}
// 导出外部使用
const defBuilder = dependency => {
    const { monaco, ts } = dependency
    const utils = defUtils(dependency)

    class PostfixCompletionBuilder {
        constructor(keyword, node, indentInfo) {
            if (ts.isAwaitExpression(node.parent)) {
                node = node.parent
            }
            this.node = node
            this.item = {
                label: {
                    label: keyword,
                },
                kind: monaco.languages.CompletionItemKind.Snippet,
            }
            this.code = utils.adjustMultilineIndentation(node.getText(), indentInfo?.indentSize, indentInfo?.tabSize)
            this.indentInfo = indentInfo
        }
        // 返回 CompletionItem 对象
        build() {
            return this.item
        }
        // 设置提示
        description(desc) {
            this.item.label.description = desc
            return this;
        }
        // 替换待插入内容
        replace(replacement) {
            const src = this.node.getSourceFile()
            const nodeStart = ts.getLineAndCharacterOfPosition(src, this.node.getStart(src))
            const nodeEnd = ts.getLineAndCharacterOfPosition(src, this.node.getEnd())
            // nodeStart, nodeEnd 获取的是索引, 但是 monaco 却使用的行号
            const rangeToDelete = {
                startLineNumber: nodeStart.line + 1,
                startColumn: nodeStart.character + 1,
                endLineNumber: nodeEnd.line + 1,
                endColumn: nodeEnd.character + 2, // accomodate 1 character for the dot
            }

            const useSnippets = /(?<!\\)\$/.test(replacement)
            if (useSnippets) {
                const escapedCode = this.code
                    .replace(/\\/g, '\\\\')
                    .replace(/\$/g, '\\$')
                this.item.insertText = this._replaceExpression(replacement, escapedCode)
                // 支持 Snippet 替换符
                this.item.insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                // 删除文本
                this.item.additionalTextEdits = [{
                    range: rangeToDelete,
                    text: null,
                }]
                // align with insert text behavior below
                this.item.keepWhitespace = true
            } else {
                this.item.insertText = ''
                // 替换文本
                this.item.additionalTextEdits = [{
                    range: rangeToDelete,
                    text: this._replaceExpression(replacement.replace(/\\\$/g, '$$'), this.code)
                }]
            }
            return this
        }
        // 替换表达式
        _replaceExpression(replacement, code, customRegex) {
            // e.g: replacement 中包含 {{expr:upper}}, 变量code值将会被转大写
            const re = new RegExp(customRegex || RegexExpression, 'g')
            return replacement.replace(re, (_match, p1) => {
                if (p1 && convert[p1]) {
                    return convert[p1](code)
                }
                return code;
            })
        }
    }
    return (keyword, node, indentInfo) => new PostfixCompletionBuilder(keyword, node, indentInfo);
};


export default defBuilder;
