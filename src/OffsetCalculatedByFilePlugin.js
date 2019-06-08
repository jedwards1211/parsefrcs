import path from 'path'

export default class OffsetCalculatedByFilePlugin {
  apply(program) {
    program.plugin('parser', function (parser) {
      var currentOffset
      parser.plugin('beforeCalculatedSurveyFile', function (file) {
        const currentResources = program.getResources(path.dirname(file))
        if (currentResources) currentOffset = currentResources.offsetCalculated
      })
      parser.plugin('calculatedShot', function (shot) {
        if (currentOffset) {
          shot.x += currentOffset.east || 0
          shot.y += currentOffset.north || 0
          shot.z += currentOffset.up || 0
        }
        return shot
      })
    })
  }
}
