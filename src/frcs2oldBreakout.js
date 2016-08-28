'use strict'

var ParseProgram = require('./ParseProgram')
var FindFrcsFilesPlugin = require('./FindFrcsFilesPlugin')
var StandardParsePlugin = require('./StandardParsePlugin')
var IncludeCalculatedGetoptPlugin = require('./IncludeCalculatedGetoptPlugin')
var OffsetCalculatedGetoptPlugin = require('./OffsetCalculatedGetoptPlugin')
var OffsetCalculatedByFilePlugin = require('./OffsetCalculatedByFilePlugin')
var ResourceFileGetoptPlugin = require('./ResourceFileGetoptPlugin')
var OldBreakoutOutputGetoptPlugin = require('./OldBreakoutOutputGetoptPlugin')
var DetectMultiDirectoryPlugin = require('./DetectMultiDirectoryPlugin')
var FindSurveyScansPlugin = require('./FindSurveyScansPlugin')
var PrintFilesFoundPlugin = require('./PrintFilesFoundPlugin')
var AssociateTripSummariesPlugin = require('./AssociateTripSummariesPlugin')

var program = new ParseProgram({
  getopt: {
    help: "Usage: node frcs2oldBreakout.js <file/dir>... [OPTION]\n" +
          "Converts data from FRCS format to old Breakout files.\n" +
          "\n" +
          "If you pass directories, they will be searched for FRCS format files.\n" +
          "The type of each file is determined automatically.\n" +
          "Trip summary files will only be associated with raw survey in the same\n" +
          "directory.  If trip summary files are found in multiple directories, the\n" +
          "directory names will be used as prefixes in the output.\n" +
          "\n" +
          "[[OPTIONS]]\n" +
          "\n",
  },
})

program.apply(
  new ResourceFileGetoptPlugin(),
  new DetectMultiDirectoryPlugin(),
  new FindFrcsFilesPlugin(),
  new PrintFilesFoundPlugin(),
  new StandardParsePlugin(),
  new AssociateTripSummariesPlugin(),
  new FindSurveyScansPlugin(),
  new IncludeCalculatedGetoptPlugin(),
  new OffsetCalculatedGetoptPlugin(),
  new OffsetCalculatedByFilePlugin(),
  new OldBreakoutOutputGetoptPlugin()
)

program.run()
