'use strict';

var ParseProgram = require('./ParseProgram');
var FindFrcsFilesPlugin = require('./FindFrcsFilesPlugin');
var StandardParsePlugin = require('./StandardParsePlugin');
var IncludeCalculatedGetoptPlugin = require('./IncludeCalculatedGetoptPlugin');
var OffsetCalculatedGetoptPlugin = require('./OffsetCalculatedGetoptPlugin');
var OffsetCalculatedByFilePlugin = require('./OffsetCalculatedByFilePlugin');
var ResourceFileGetoptPlugin = require('./ResourceFileGetoptPlugin');
var WallsOutputGetoptPlugin = require('./WallsOutputGetoptPlugin');
var DetectMultiDirectoryPlugin = require('./DetectMultiDirectoryPlugin');
var PrintFilesFoundPlugin = require('./PrintFilesFoundPlugin');
var AssociateTripSummariesPlugin = require('./AssociateTripSummariesPlugin');

var program = new ParseProgram({
  getopt: {
    help: "Usage: node frcs2walls.js <file/dir>... [OPTION]\n" +
          "Converts data from FRCS format to Walls .SRV files and .WPJ projects.\n" +
          "\n" +
          "If you pass directories, they will be searched for FRCS format files.\n" +
          "The type of each file is determined automatically.\n" +
          "Trip summary files will only be associated with raw survey in the same\n" +
          "directory.  If trip summary files are found in multiple directories, the\n" +
          "directory names will be used as #PREFIXes in the Walls output.\n" +
          "\n" +
          "[[OPTIONS]]\n" +
          "\n",
  },
});

program.apply(
  new ResourceFileGetoptPlugin(),
  new FindFrcsFilesPlugin(),
  new DetectMultiDirectoryPlugin(),
  new PrintFilesFoundPlugin(),
  new StandardParsePlugin(),
  new AssociateTripSummariesPlugin(),
  new IncludeCalculatedGetoptPlugin(),
  new OffsetCalculatedGetoptPlugin(),
  new OffsetCalculatedByFilePlugin(),
  new WallsOutputGetoptPlugin()
);

program.run();
