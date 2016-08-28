'use strict';

function OffsetCalculatedPlugin(options) {
  this.options = options || {};
}

OffsetCalculatedPlugin.prototype.apply = function(program) {
  var eastOffset = this.options.eastOffset || 0;
  var northOffset = this.options.northOffset || 0;
  var upOffset = this.options.upOffset || 0;

  if (eastOffset || northOffset || upOffset) {
    program.plugin('parser', function(parser) {
      parser.plugin('calculatedShot', function(shot) {
        shot.x += eastOffset;
        shot.y += northOffset;
        shot.z += upOffset;
        return shot;
      });
    });
  }
};

module.exports = OffsetCalculatedPlugin;
