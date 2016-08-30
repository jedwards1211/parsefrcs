import untildify from 'untildify'

export default class UntildifyArgvPlugin {
  apply(program) {
    program.plugin('gotopt', opt => {
      opt.argv = opt.argv.map(untildify)
    })
  }
}
