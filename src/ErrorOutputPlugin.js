import {repeat} from 'lodash'

function formatError(error) {
  const {file, severity, line, text, startColumn, endColumn, message} = error
  return `${severity}: ${message} (${file}, ${line}:${startColumn})
${text}
${repeat(' ', startColumn)}${repeat('^', endColumn - startColumn)}`
}

export default class PrintErrorsAndWarningsPlugin {
  apply(program) {
    program.plugin('parser', parser => {
      parser.plugin('error', error => {
        console.error(formatError(error))
      })
      parser.plugin('warning', warning => {
        console.warn(formatError(warning))
      })
    })
  }
}
