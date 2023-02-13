import pluralize from 'pluralize'

// 工具类
const defUtils = ({ ts }) => {
  // 获取缩进字符串
  const getIndentCharacters = (indentInfo) => {
    if (!indentInfo) {
      return "";
    }
    if (indentInfo.insertSpaces) {
      return ' '.repeat(indentInfo.tabSize)
    } else {
      return '\t'
    }
  }
  // 构造可选择变量名称格式
  const getPlaceholderWithOptions = (options, placeholderNumber = 1) => {
    if (options.length > 1) {
      return `\${${placeholderNumber}|${options.join(',')}|}`
    }
    return `\${${placeholderNumber}:${options[0]}}`
  }
  // 多行表达式
  const multiline = (() => {
    const AllTabs = /^\t+$/
    const AllSpaces = /^ +$/
    function adjustMultilineIndentation(code, indentSize, tabSize) {
      if (!indentSize) {
        return code
      }
      const reNewLine = /\r?\n/
      const lines = code.split(reNewLine)
      if (lines.length === 1) {
        return code
      }
      const newLine = reNewLine.exec(code)[0]
      return lines.map((line, i) => i > 0 ? stripLineIndent(line, indentSize, tabSize) : line).join(newLine);
    }
    function stripLineIndent(line, indentSize, tabSize) {
      const whitespacesMatch = /^[\t ]+/.exec(line)
      if (!whitespacesMatch) {
        return line
      }
      const whitespaces = whitespacesMatch[0]
      if (AllTabs.test(whitespaces) && indentSize <= whitespaces.length) {
        return line.substring(indentSize)
      }
      if (AllSpaces.test(whitespaces) && indentSize <= (whitespaces.length / tabSize)) {
        return line.substring(indentSize * tabSize)
      }
      return line
    }
    function adjustLeadingWhitespace(content, leadingWhitespace = '') {
      return content.split(/\r?\n/).map((line, i) => !i ? line : leadingWhitespace + line).join('\n')
    }
    return {
      AllTabs: AllTabs,
      AllSpaces: AllSpaces,
      adjustMultilineIndentation: adjustMultilineIndentation,
      adjustLeadingWhitespace: adjustLeadingWhitespace
    }
  })();

  // ts 工具类
  const typescript = (() => {
    const findNodeAtPosition = (source, character) => {
      const matchingNodes = []
      source.statements.forEach(visitNode)
      const sortedNodes = matchingNodes.sort((obj, other) => {
        // width => asc, depth => desc
        return obj.width === other.width ? other.depth - obj.depth : obj.width - other.width;
      })
      return sortedNodes.length > 0 && sortedNodes[0].node
      function visitNode(node, depth = 0) {
        const start = node.getStart(source)
        const end = node.getEnd()
        const isToken = ts.isToken(node) && !ts.isIdentifier(node) && !ts.isTypeNode(node)

        if (!isToken && start <= character && character < end) {
          matchingNodes.push({
            depth,
            node,
            width: end - start
          })
        }

        node.getChildren(source).forEach(n => visitNode(n, depth + 1))
      }
    }
    const findClosestParent = (node, kind) => {
      while (node && node.kind !== kind) {
        node = node.parent
      }
      return node
    }
    const isAssignmentBinaryExpression = (node) => {
      return [
        ts.SyntaxKind.EqualsToken,
        ts.SyntaxKind.PlusEqualsToken,
        ts.SyntaxKind.MinusEqualsToken,
        ts.SyntaxKind.SlashEqualsToken,
        ts.SyntaxKind.AsteriskEqualsToken,
        ts.SyntaxKind.AsteriskAsteriskEqualsToken,
        ts.SyntaxKind.AmpersandEqualsToken,
        // Bitwise assignments
        ts.SyntaxKind.BarEqualsToken,
        ts.SyntaxKind.BarBarEqualsToken,
        ts.SyntaxKind.CaretEqualsToken,
        ts.SyntaxKind.LessThanLessThanToken,
        ts.SyntaxKind.LessThanLessThanEqualsToken,
        ts.SyntaxKind.GreaterThanEqualsToken,
        ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
        ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
        // relatively new
        ts.SyntaxKind.AmpersandAmpersandEqualsToken,
        ts.SyntaxKind.QuestionQuestionToken,
        ts.SyntaxKind.BarBarEqualsToken,
      ].includes(node.operatorToken.kind)
    }
    return {
      findNodeAtPosition: findNodeAtPosition,
      findClosestParent: findClosestParent,
      isAssignmentBinaryExpression: isAssignmentBinaryExpression
    }
  })()

  // 推断工具类
  const infer = (() => {
    const MethodCallRegex = /^(get|read|create|retrieve|select|modify|update|use|find)(?<name>[A-Z].+?)?$/
    const CleanNameRegex = /((By|With|From).*$)|(Sync$)|.*(?=Items|Lines$)/
    const lowerFirst = (name) => name && (name.charAt(0).toLowerCase() + name.slice(1));
    const inferVarTemplateName = (node) => {
      if (ts.isNewExpression(node)) {
        return [lowerFirst(inferNewExpressionVar(node))]
      } else if (ts.isCallExpression(node)) {
        const methodName = getMethodName(node)
        const name = beautifyMethodName(methodName)
        if (!name) {
          return
        }
        return getUniqueVariants(name).map(lowerFirst)
      }
    }
    const inferForVarTemplate = (node) => {
      const subjectName = getForExpressionName(node)
      if (!subjectName) {
        return
      }
      const clean = ts.isCallExpression(node)
        ? beautifyMethodName(subjectName)
        : subjectName.replace(/^(?:all)?(.+?)(?:List)?$/, "$1")
      return getUniqueVariants(clean)
        .map(pluralize.singular) // 将复数单词转成单数
        .filter(x => x !== clean)
        .map(lowerFirst)
    }
    function getUniqueVariants(name) {
      const cleanerVariant = name?.replace(CleanNameRegex, '')
      const uniqueValues = [...new Set([cleanerVariant, name])]
      return uniqueValues.filter(x => x)
    }
    function beautifyMethodName(name) {
      return MethodCallRegex.exec(name)?.groups?.name
    }
    function getForExpressionName(node) {
      if (ts.isIdentifier(node)) {
        return node.text
      } else if (ts.isPropertyAccessExpression(node)) {
        return node.name.text
      } else if (ts.isCallExpression(node)) {
        return getMethodName(node)
      }
    }
    function getMethodName(node) {
      if (ts.isIdentifier(node.expression)) {
        return node.expression.text
      } else if (ts.isPropertyAccessExpression(node.expression)) {
        return node.expression.name.text
      }
    }
    function inferNewExpressionVar(node) {
      if (ts.isIdentifier(node.expression)) {
        return node.expression.text
      } else if (ts.isPropertyAccessExpression(node.expression)) {
        return node.expression.name.text
      }
    }
    return {
      inferVarTemplateName: inferVarTemplateName,
      inferForVarTemplate: inferForVarTemplate
    }
  })();

  // 导出外部使用
  return {
    getIndentCharacters: getIndentCharacters,
    getPlaceholderWithOptions: getPlaceholderWithOptions,
    AllTabs: multiline.AllTabs,
    AllSpaces: multiline.AllSpaces,
    adjustMultilineIndentation: multiline.adjustMultilineIndentation,
    adjustLeadingWhitespace: multiline.adjustLeadingWhitespace,
    findNodeAtPosition: typescript.findNodeAtPosition,
    findClosestParent: typescript.findClosestParent,
    isAssignmentBinaryExpression: typescript.isAssignmentBinaryExpression,
    inferVarTemplateName: infer.inferVarTemplateName,
    inferForVarTemplate: infer.inferForVarTemplate,
  }
}
export default defUtils;