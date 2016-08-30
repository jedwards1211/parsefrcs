#!/usr/bin/env babel-node

import ParseProgram from './ParseProgram'
import FindFrcsFilesPlugin from './FindFrcsFilesPlugin'
import StandardParsePlugin from './StandardParsePlugin'
import DetectMultiDirectoryPlugin from './DetectMultiDirectoryPlugin'
import PrintFilesFoundPlugin from './PrintFilesFoundPlugin'
import AssociateTripSummariesPlugin from './AssociateTripSummariesPlugin'
import ErrorOutputPlugin from './ErrorOutputPlugin'
import ErrorCodeGetoptPlugin from './ErrorCodeGetoptPlugin'

var program = new ParseProgram({
  getopt: {
    help: [
      "Usage: node frcslint.js <file/dir>... [OPTION]",
      "Checks frcs data for mistakes",
      "",
      "If you pass directories, they will be searched for FRCS format files.",
      "The type of each file is determined automatically.  For example:",
      "",
      "    node frcslint.js C:/FRCS/data",
      "",
      "Will check all files in C:/FRCS/data and subfolders.",
      "",
      "[[OPTIONS]]",
      "",
    ].join('\n'),
  },
})

program.apply(
  new FindFrcsFilesPlugin(),
  new DetectMultiDirectoryPlugin(),
  new PrintFilesFoundPlugin(),
  new StandardParsePlugin(),
  new AssociateTripSummariesPlugin(),
  new ErrorOutputPlugin(),
  new ErrorCodeGetoptPlugin(),
)

program.run()