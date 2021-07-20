import { padEnd, repeat } from 'lodash'
import chalk from 'chalk'

export default class ErrorOutputPlugin {
  apply(program) {
    let errorCount = 0
    let warningCount = 0
    program.plugin('parser', (parser) => {
      let currentTrip
      let lastLoggedFile
      let lastLoggedTrip
      function formatError(error) {
        const {
          severity,
          line,
          text,
          startColumn,
          endColumn,
          message,
          type,
        } = error
        const coloredSeverity =
          severity === 'error'
            ? chalk.red.bold('error  ')
            : chalk.yellow.bold('warning')

        const result = [
          chalk`    {bold ${line}}: ${coloredSeverity}  ${padEnd(
            message,
            50
          )}  {gray ${type}}`,
          chalk`      ${text.substring(0, startColumn)}{${
            severity === 'error' ? 'bgRed' : 'bgYellow'
          }.${
            severity === 'error' ? 'whiteBright' : 'black'
          }.bold ${text.substring(startColumn, endColumn)}}${text.substring(
            endColumn
          )}`,
        ]
        if (process.env.CI)
          result.push(
            `      ${repeat(' ', startColumn)}${repeat(
              '^',
              endColumn - startColumn
            )}`
          )
        return result.join('\n')
      }

      parser.plugin('trip', (trip) => (currentTrip = trip))
      parser.plugin('error', (error) => {
        if (error.file !== lastLoggedFile) {
          lastLoggedFile = error.file
          console.error(chalk.bold.underline(error.file))
        }
        if (currentTrip !== lastLoggedTrip) {
          lastLoggedTrip = currentTrip
          const { surveyScan, tripNum, name } = currentTrip
          console.error(
            chalk`  {bold.underline Trip #${tripNum || '?'}: ${name} (${
              surveyScan || 'scanned notes file unknown'
            })}`
          )
        }
        if (error.severity === 'error') {
          errorCount++
          console.error(formatError(error))
        } else {
          warningCount++
          console.warn(formatError(error))
        }
      })
    })
    program.plugin('beforeExit', () => {
      if (errorCount + warningCount > 0) {
        console[errorCount ? 'error' : 'warning'](
          `${errorCount} error${
            errorCount !== 1 ? 's' : ''
          }, ${warningCount} warning${warningCount !== 1 ? 's' : ''}`
        )
      }
    })
  }
}
