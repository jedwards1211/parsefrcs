export default class ErrorCodePlugin {
  constructor(options = {}) {
    this.options = options
  }
  apply(program) {
    let errorCount = 0
    let warningCount = 0
    program.plugin('parser', parser => {
      parser.plugin('error', error => {
        errorCount++
      })
      parser.plugin('warning', warning => {
        warningCount++
      })
    })
    program.plugin('exit', () => {
      if (errorCount > 0) process.exit(1)
      if (warningCount > 0 && this.options.werror) process.exit(1)
      console.warn('No errors!')
    })
  }
}
