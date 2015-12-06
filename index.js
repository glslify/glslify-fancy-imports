const string = require('glsl-token-string')
const tokenize = require('glsl-tokenizer')

module.exports = fancyImportsTransform
module.exports.tokens = fancyImports

function fancyImportsTransform (file, src, opts, next) {
  try {
    src = string(fancyImports(tokenize(src)))
  } catch (e) {
    return next(e)
  }

  next(null, src)
}

function fancyImports (tokens) {
  //
  // Rewrite import statements to glslify-friendly syntax, e.g.
  //
  //    import b from 'lorems'
  //    import a from 'module' where { map = b }
  //
  // Becomes:
  //
  //    #pragma glslify: b = require('lorems')
  //    #pragma glslify: a = require('module', map = b)
  //
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    if (token.type !== 'ident') continue
    if (token.data !== 'import') continue

    var nameIndex = skipWhitespace(i)
    if (!tokens[nameIndex]) continue
    if (tokens[nameIndex].type !== 'ident') {
      throw new Error('Expected variable identifier after "import" keyword.')
    }

    var fromIndex = skipWhitespace(nameIndex)
    if (!tokens[fromIndex]) continue
    if (tokens[fromIndex].data !== 'from') {
      throw new Error('Expected "from" keyword in "import" statement.')
    }

    var pathIndex = skipWhitespace(fromIndex)
    if (!tokens[pathIndex]) continue
    var pathStart = tokens[pathIndex].data
    if (pathStart !== '"' && pathStart !== "'") {
      throw new Error('"import" statements must use a quoted string for the import path.')
    }

    var pathFinish = skipTillMatching(pathIndex) + 1
    var nextIndex = skipWhitespace(pathFinish)
    var whereToken = tokens[nextIndex]

    var varName = tokens[nameIndex].data
    var srcFile = string(tokens.slice(pathIndex, pathFinish))

    if (whereToken.data !== 'where') {
      i = replaceImportWithPragma(i, pathFinish)
      continue
    }

    var curlyIndex = skipWhitespace(nextIndex)
    if (!tokens[curlyIndex]) continue
    var closeCurly = findOppositeCurly(curlyIndex)
    var mappings = string(tokens.slice(curlyIndex + 1, closeCurly))

    i = replaceImportWithPragma(i, closeCurly + 1, mappings)
  }

  //
  // Does the same for export statements, e.g.
  //
  //    export hello
  //
  // Becomes:
  //
  //    #pragma glslify: export(hello)
  //
  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].data !== 'export') continue

    var token = tokens[i]
    var symbolIndex = skipWhitespace(i)
    var symbolToken = tokens[symbolIndex]
    var nextIndex = skipWhitespace(symbolIndex)
    var remainingWhitespace = string(tokens.slice(symbolIndex + 1, nextIndex))
    var exportName = symbolToken.data

    if (!/\n|\r/.test(remainingWhitespace)) {
      throw new Error('"export" statements must finish with a newline, and can only export a single value')
    }

    i = replaceExportWithPragma(i, symbolIndex + 1)
  }

  return tokens

  function replaceImportWithPragma (start, end, mappings) {
    var data = '#pragma glslify: ' + varName + ' = require(' + srcFile

    if (mappings) {
      data = data + ', ' + mappings.replace(/\s+/g, ' ').trim()
    }

    tokens.splice(start, end - start, {
      type: 'preprocessor',
      data: data + ')'
    })

    return start + 1
  }

  function replaceExportWithPragma (start, end) {
    tokens.splice(start, end - start, {
      type: 'preprocessor',
      data: '#pragma glslify: export(' + exportName + ')'
    })

    return start + 1
  }

  function skipWhitespace (i) {
    for (i++; i < tokens.length; i++) {
      if (tokens[i].type !== 'whitespace') {
        return i
      }
    }
  }

  function skipTillMatching (i) {
    var char = tokens[i].data
    for (i++; i < tokens.length; i++) {
      if (tokens[i].data === char) {
        return i
      }
    }
  }

  function findOppositeCurly (i) {
    var depth = 1
    for (i++; i < tokens.length; i++) {
      var char = tokens[i].data
      if (char === '{') depth++; else
      if (char === '}') depth--
      if (!depth) return i
    }
  }
}
