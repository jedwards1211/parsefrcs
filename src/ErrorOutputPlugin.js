import {repeat} from 'lodash'


export default class PrintErrorsAndWarningsPlugin {
  apply(program) {
    let errorCount = 0
    let warningCount = 0
    program.plugin('parser', parser => {
      let currentTrip
      function formatError(error) {
        const {file, severity, line, text, startColumn, endColumn, message} = error
        let surveyScan = currentTrip && currentTrip.surveyScan
        return [
          `${severity}: ${message} (${file}, ${line}:${startColumn}-${endColumn}) ${surveyScan || ''}`,
          text,
          repeat(' ', startColumn) + repeat('^', endColumn - startColumn),
        ].join('\n')
      }

      parser.plugin('trip', trip => currentTrip = trip)
      parser.plugin('error', error => {
        if (error.severity === 'error') {
          errorCount++
          console.error(formatError(error))
        } else {
          warningCount++
          console.warn(formatError(error))
        }
        return error
      })
    })
    program.plugin('beforeExit', () => {
      if (errorCount + warningCount > 0) {
        console[errorCount ? 'error' : 'warning'](
          `${errorCount} error${errorCount !== 1 ? 's' : ''}, ${warningCount} warning${warningCount !== 1 ? 's' : ''}`
        )
      }
    })
  }
}
