'use strict';

function IncludeCalculatedPlugin() {
}

IncludeCalculatedPlugin.prototype.apply = function(program) {
  program.plugin('parser', function(parser) {
    parser.plugin('beforeParseRawSurvey', function() {
      parser.parseCalculatedSurvey();
    });
  });
};

module.exports = IncludeCalculatedPlugin;
