import path from 'path'

export default class OffsetCalculatedByFilePlugin {
  apply(program) {
    program.plugin('parser', function (parser) {
      var currentResources
      parser.plugin('beforeCalculatedSurveyFile', function (file) {
        currentResources = program.getResources(path.dirname(file))
      })
      parser.plugin('calculatedShot', function (shot) {
        var offset = currentResources && currentResources.offsetCalculated
        if (offset) {
          shot.x += offset.east || 0
          shot.y += offset.north || 0
          shot.z += offset.up || 0
        }
        return shot
      })
    })
  }
}
