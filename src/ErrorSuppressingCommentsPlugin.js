const disableNextLineRegex = /^\s*frcslint-ignore-next-line\s+(.*)/

export default class ErrorOutputPlugin {
  apply(program) {
    program.plugin('parser', parser => {
      let disableNextFile
      let disableNextLine = NaN
      let disableNextLineRules = new Set()

      parser.plugin('comment', ({file, line, text}) => {
        const match = disableNextLineRegex.exec(text)
        if (match) {
          disableNextFile = file
          disableNextLine = line
          disableNextLineRules = new Set(match[1].split(/\s*,\s*/g))
        }
      })

      parser.plugin('error', ({type, file, line}) => {
        if (file === disableNextFile && line === disableNextLine + 1 && disableNextLineRules.has(type)) return false
      })
    })
  }
}

