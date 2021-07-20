#!/usr/bin/env node
import ParseProgram from './ParseProgram'
import FindFrcsFilesPlugin from './FindFrcsFilesPlugin'
import FindSurveyScansPlugin from './FindSurveyScansPlugin'
import StandardParsePlugin from './StandardParsePlugin'
import DetectMultiDirectoryPlugin from './DetectMultiDirectoryPlugin'
import PrintFilesFoundPlugin from './PrintFilesFoundPlugin'
import ResourceFileGetoptPlugin from './ResourceFileGetoptPlugin'
import AssociateTripSummariesPlugin from './AssociateTripSummariesPlugin'
import ErrorSuppressingCommentsPlugin from './ErrorSuppressingCommentsPlugin'
import ErrorOutputPlugin from './ErrorOutputPlugin'
import ErrorCodeGetoptPlugin from './ErrorCodeGetoptPlugin'
import BacksightMismatchErrorsGetoptPlugin from './BacksightMismatchErrorsGetoptPlugin'
import UntildifyArgvPlugin from './UntildifyArgvPlugin'

var program = new ParseProgram({
  getopt: {
    help: [
      'Usage: node frcslint.js <file/dir>... [OPTION]',
      'Checks frcs data for mistakes',
      '',
      'If you pass directories, they will be searched for FRCS format files.',
      'The type of each file is determined automatically.  For example:',
      '',
      '    node frcslint.js C:/FRCS/data',
      '',
      'Will check all files in C:/FRCS/data and subfolders.',
      '',
      '[[OPTIONS]]',
      '',
    ].join('\n'),
  },
})

program.apply(
  new UntildifyArgvPlugin(),
  new FindFrcsFilesPlugin(),
  new DetectMultiDirectoryPlugin(),
  new PrintFilesFoundPlugin(),
  new StandardParsePlugin(),
  new ResourceFileGetoptPlugin(),
  new FindSurveyScansPlugin(),
  new AssociateTripSummariesPlugin(),
  new ErrorSuppressingCommentsPlugin(),
  new ErrorOutputPlugin(),
  new ErrorCodeGetoptPlugin(),
  new BacksightMismatchErrorsGetoptPlugin()
)

program.run()
