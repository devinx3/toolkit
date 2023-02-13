import defUtils from './utils'
import defBuilder from './builder'

// 导出外部使用
const defTemplates = dependency => {
    const { ts } = dependency;
    const utils = defUtils(dependency);
    const createBuilder = defBuilder(dependency)

    // 后置自动补全提示基础类
    class BasePostfixTemplate {
        /**
         * @param {string} keyword 关键字
         */
        constructor(keyword) {
            this.keyword = keyword;
        }
        isSimpleExpression = (node) => ts.isExpressionStatement(node) && !this.isStringLiteral(node)
        isPropertyAccessExpression = (node) => node.kind === ts.SyntaxKind.PropertyAccessExpression
        isElementAccessExpression = (node) => node.kind === ts.SyntaxKind.ElementAccessExpression
        isExpression = (node) => this.isSimpleExpression(node) || this.isPropertyAccessExpression(node) || this.isElementAccessExpression(node)
        isIdentifier = (node) => ts.isIdentifier(node) && !this.inTypeReference(node.parent)

        isUnaryExpression = (node) => node.kind === ts.SyntaxKind.PostfixUnaryExpression || node.kind === ts.SyntaxKind.PrefixUnaryExpression
        isCallExpression = (node) => node.kind === ts.SyntaxKind.CallExpression
        isNewExpression = (node) => node.kind === ts.SyntaxKind.NewExpression
        inFunctionArgument = (node) => ts.isCallExpression(node.parent) && node.parent.arguments.includes(node)
        isObjectLiteral = (node) => ts.isBlock(node) && (node.statements.length === 0 || node.statements.some(x => ts.isLabeledStatement(x)));
        isStringLiteral = (node) => ts.isTemplateSpan(node) || (ts.isExpressionStatement(node) && (ts.isStringLiteral(node.expression) || ts.isNoSubstitutionTemplateLiteral(node.expression)));

        isTypeNode = (node) => {
            if (ts.isTypeNode(node)) { // built-in types
                return true
            }
            // Custom types (including namespaces) are encapsulated in TypeReferenceNode
            return node.parent && this.inTypeReference(node.parent)
        }

        inAwaitedExpression = (node) => {
            if (this.isAnyFunction(node)) {
                return false
            }
            return node.kind === ts.SyntaxKind.AwaitExpression || (node.parent && this.inAwaitedExpression(node.parent))
        }

        inReturnStatement = (node) => {
            if (this.isAnyFunction(node)) {
                return false
            }
            return node.kind === ts.SyntaxKind.ReturnStatement || (node.parent && this.inReturnStatement(node.parent))
        }

        inVariableDeclaration = (node) => {
            if (this.isAnyFunction(node)) {
                return false
            }

            return node.kind === ts.SyntaxKind.VariableDeclaration || (node.parent && this.inVariableDeclaration(node.parent))
        }

        isBinaryExpression = (node) => {
            if (ts.isBinaryExpression(node)) {
                return true
            }

            return (ts.isParenthesizedExpression(node) && ts.isBinaryExpression(node.expression))
                || (node.parent && this.isBinaryExpression(node.parent))
        }

        unwindBinaryExpression = (node, removeParens = true) => {
            let binaryExpression = removeParens && ts.isParenthesizedExpression(node) && ts.isBinaryExpression(node.expression)
                ? node.expression
                : utils.findClosestParent(node, ts.SyntaxKind.BinaryExpression);

            while (binaryExpression && ts.isBinaryExpression(binaryExpression.parent)) {
                binaryExpression = binaryExpression.parent
            }

            if (binaryExpression && !utils.isAssignmentBinaryExpression(binaryExpression)) {
                return binaryExpression
            }

            return node
        }

        isAnyFunction = (node) => {
            return ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)
        }

        inAssignmentStatement = (node) => {
            if (this.isAnyFunction(node)) {
                return false
            }

            if (ts.isBinaryExpression(node)) {
                return utils.isAssignmentBinaryExpression(node)
            }

            return node.parent && this.inAssignmentStatement(node.parent)
        }

        inIfStatement = (node, expressionNode) => {
            if (ts.isIfStatement(node)) {
                return !expressionNode || node.expression === expressionNode
            }
            return node.parent && this.inIfStatement(node.parent, node)
        }

        inTypeReference = (node) => {
            if (ts.isTypeReferenceNode(node)) {
                return true
            }
            return node.parent && this.inTypeReference(node.parent)
        }
    }

    // 表达式基础类
    class BaseExpressionTemplate extends BasePostfixTemplate {
        canUse(node) {
            return !this.inIfStatement(node) && !this.isTypeNode(node) && !this.inAssignmentStatement(node) &&
                (this.isIdentifier(node) ||
                    this.isExpression(node) ||
                    this.isUnaryExpression(node) ||
                    this.isBinaryExpression(node) ||
                    this.isCallExpression(node))
        }
    }

    // var 变量实现类
    class VarTemplate extends BaseExpressionTemplate {
        constructor(keyword = 'var') {
            super(keyword);
        }
        // 构造对象
        buildCompletionItem(node, indentInfo) {
            node = this.unwindBinaryExpression(node)
            const suggestedVarNames = utils.inferVarTemplateName(node) ?? ['name']
            return createBuilder(this.keyword, node, indentInfo)
                .description(`${this.keyword} name = expr`)
                .replace(`${this.keyword} ${utils.getPlaceholderWithOptions(suggestedVarNames)} = {{expr}}$0`)
                .build()
        }
        canUse(node) {
            return (super.canUse(node) || this.isNewExpression(node) || this.isObjectLiteral(node) || this.isStringLiteral(node))
                && !this.inReturnStatement(node)
                && !this.inFunctionArgument(node)
                && !this.inVariableDeclaration(node)
                && !this.inAssignmentStatement(node)
        }
    }

    // for 循环基础类
    class BaseForTemplate extends BasePostfixTemplate {
        canUse(node) {
            return !this.inReturnStatement(node) &&
                !this.inIfStatement(node) &&
                !this.inFunctionArgument(node) &&
                !this.inVariableDeclaration(node) &&
                !this.inAssignmentStatement(node) &&
                !this.isTypeNode(node) &&
                !this.isBinaryExpression(node) &&
                (this.isIdentifier(node) ||
                    this.isPropertyAccessExpression(node) ||
                    this.isElementAccessExpression(node) ||
                    this.isCallExpression(node) ||
                    this.isArrayLiteral(node))
        }
        isArrayLiteral(node) {
            return node.kind === ts.SyntaxKind.ArrayLiteralExpression;
        }
        isObjectLiteral
        // 数据元素字段名
        getArrayItemNames(node) {
            const suggestedNames = utils.inferForVarTemplate(node);
            return suggestedNames?.length > 0 ? suggestedNames : ['item']
        }
    }

    class ForTemplate extends BaseForTemplate {
        buildCompletionItem(node, indentInfo) {
            const isAwaited = node.parent && ts.isAwaitExpression(node.parent)
            const prefix = isAwaited ? '(' : ''
            const suffix = isAwaited ? ')' : ''
            if (this.keyword === 'forr') {
                return createBuilder('forr', node, indentInfo)
                    .description("for (let i = expr.length - 1; i >= 0; i--)")
                    .replace(`for (let \${1:i} = ${prefix}{{expr}}${suffix}.length - 1; \${1} >= 0; \${1}--) {\n${utils.getIndentCharacters(indentInfo)}\${0}\n}`)
                    .build()
            }
            return createBuilder('fori', node, indentInfo)
                .description("for (let i = 0; i < expr.length; i++)")
                .replace(`for (let \${1:i} = 0; \${1} < ${prefix}{{expr}}${suffix}.length; \${1}++) {\n${utils.getIndentCharacters(indentInfo)}\${0}\n}`)
                .build()
        }

        canUse(node) {
            return super.canUse(node)
                && !this.isArrayLiteral(node)
                && !this.isCallExpression(node)
        }
    }

    class ForOfTemplate extends BaseForTemplate {
        buildCompletionItem(node, indentInfo) {
            const itemNames = super.getArrayItemNames(node)
            return createBuilder('forof', node, indentInfo)
                .description("for (let item of expr)")
                .replace(`for (let ${utils.getPlaceholderWithOptions(itemNames)} of {{expr}}) {\n${utils.getIndentCharacters(indentInfo)}\${0}\n}`)
                .build()
        }
    }

    class ForEachTemplate extends BaseForTemplate {
        buildCompletionItem(node, indentInfo) {
            const isAwaited = node.parent && ts.isAwaitExpression(node.parent)
            const prefix = isAwaited ? '(' : ''
            const suffix = isAwaited ? ')' : ''
            const itemNames = super.getArrayItemNames(node)
            return createBuilder('foreach', node, indentInfo)
                .description("expr.forEach(item => )")
                .replace(`${prefix}{{expr}}${suffix}.forEach(${utils.getPlaceholderWithOptions(itemNames)} => {\n${utils.getIndentCharacters(indentInfo)}\${0}\n})`)
                .build()
        }
    }


    return [
        // 变量
        new VarTemplate(),
        new VarTemplate('let'),
        new VarTemplate('const'),
        // 循环
        new ForTemplate('fori'),
        new ForTemplate('forr'),
        new ForOfTemplate('forof'),
        new ForEachTemplate('foreach'),
    ]
}

export default defTemplates;