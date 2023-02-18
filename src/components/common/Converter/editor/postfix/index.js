
import defUtils from './utils';
import defTemplates from './templates';

const DEFAULT_TAB_SIZE = 4;
const DEFAULT_INSERT_SPACES = true;

// 自动补全提供者
const getCompletionPostfixProvider = (monaco, ts) => {
    const dependency = { monaco, ts }
    const utils = defUtils(dependency);
    const templates = defTemplates(dependency);

    class PostfixCompletionProvider {
        provideCompletionItems(model, position, context, token) {
            const line = model.getLineContent(position.lineNumber)
            const dotIdx = line.lastIndexOf('.', position.column - 1)
            const wordRange = model.getWordAtPosition(position)
            const isCursorOnWordAfterDot = (wordRange?.startColumn ?? position.column) - 1 === dotIdx + 1
            if (dotIdx === -1 || !isCursorOnWordAfterDot) {
                return []
            }
            const suggestions = []
            try {
                const currentNode = this._getNodeBeforeTheDot(model, position, dotIdx);
                if (currentNode) {
                    const indentInfo = this._getIndentInfo(model, currentNode)
                    const replacementNode = this._getNodeForReplacement(currentNode)
                    templates.forEach(template => {
                        if (template.canUse(ts.isNonNullExpression(currentNode) ? currentNode.expression : currentNode)) {
                            suggestions.push(template.buildCompletionItem(replacementNode, indentInfo))
                        }
                    })
                }
            } catch (err) {
                console.warn('Error while building postfix autocomplete items:', err)
            }
            return suggestions;
        }
        // 根据'.'之前的内容, 生成 node
        _getNodeBeforeTheDot(model, position, dotIdx) {
            const codeBeforeTheDot = model.getValueInRange({
                startLineNumber: 1,
                endLineNumber: position.lineNumber,
                startColumn: 1,
                endColumn: dotIdx + 1
            })
            const source = ts.createSourceFile('test.ts', codeBeforeTheDot, ts.ScriptTarget.ES5, true)
            const beforeTheDotPosition = ts.getPositionOfLineAndCharacter(source, position.lineNumber - 1, dotIdx - 1)
            const currentNode = utils.findNodeAtPosition(source, beforeTheDotPosition)
            if (ts.isIdentifier(currentNode) && ts.isPropertyAccessExpression(currentNode.parent)) {
                return currentNode.parent
            }
            return currentNode
        }
        // 待替换节点信息
        _getNodeForReplacement(node) {
            if (ts.isTemplateSpan(node)) {
                return node.parent
            }
            if (ts.isPrefixUnaryExpression(node.parent) || ts.isPropertyAccessExpression(node.parent)) {
                return node.parent
            }
            if (ts.isTypeReferenceNode(node.parent) || (node.parent.parent && ts.isTypeReferenceNode(node.parent.parent))) {
                return utils.findClosestParent(node, ts.SyntaxKind.TypeReference)
            }
            return node
        }
        // 获取缩进信息
        _getIndentInfo(model, node) {
            const tabSize = model.getOptions()?.tabSize || DEFAULT_TAB_SIZE;
            const insertSpaces = model.getOptions()?.insertSpaces || DEFAULT_INSERT_SPACES;
            const source = node.getSourceFile()
            const position = ts.getLineAndCharacterOfPosition(source, node.getStart(source))
            const line = model.getLineContent(position.line + 1);
            const whitespaces = line.substring(0, model.getLineFirstNonWhitespaceColumn(position.line + 1) - 1);
            let indentSize = 0
            if (utils.AllTabs.test(whitespaces)) {
                indentSize = whitespaces.length
            } else if (utils.AllSpaces.test(whitespaces)) {
                indentSize = whitespaces.length / tabSize;
            }
            return {
                tabSize,
                insertSpaces,
                indentSize,
                leadingWhitespace: whitespaces
            }
        }
    }
    // 实例化提供者
    const provider = new PostfixCompletionProvider();
    return {
        triggerCharacters: ['.'],
        provideCompletionItems: (model, position, context, token) => {
            return {
                suggestions: provider.provideCompletionItems(model, position, context, token) || []
            }
        }
    }
}

// 加载ts
const loadTs = () => {
    if (global.ts) {
        return Promise.resolve(global.ts);
    } else {
        // 引入ts
        return new Promise((resolve, reject) => {
            import('monaco-editor/esm/vs/language/typescript/ts.worker')
                .then(() => {
                    const ts = global.ts; // typescript/ts.worker 中定义 "globalThis.ts = typescript;"
                    if (!ts) {
                        reject(new Error("获取tsWorker失败"));
                    }
                    resolve(ts);
                }).then(reject)
        })
    }
}

// 自动对象
const registerPostfix = (monaco, registerProvider) => {
    // 引入ts
    loadTs()
        .then(ts => registerProvider(getCompletionPostfixProvider(monaco, ts)))
        .catch(error => console.log("register postfix error", error))
}

export default registerPostfix;