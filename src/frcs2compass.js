#!/usr/bin/env node
import ParseProgram from './ParseProgram'
import FindFrcsFilesPlugin from './FindFrcsFilesPlugin'
import StandardParsePlugin from './StandardParsePlugin'
import CompassOutputPlugin from './CompassOutputPlugin'
import DetectMultiDirectoryPlugin from './DetectMultiDirectoryPlugin'
import ResourceFileGetoptPlugin from './ResourceFileGetoptPlugin'
import PrintFilesFoundPlugin from './PrintFilesFoundPlugin'
import AssociateTripSummariesPlugin from './AssociateTripSummariesPlugin'
import UntildifyArgvPlugin from './UntildifyArgvPlugin'

var program = new ParseProgram({
  getopt: {
    help: [
      'Usage: node frcs2compass.js <file/dir>... [OPTION]',
      'Converts data from FRCS format to Compass format.',
      '',
      'If you pass directories, they will be searched for FRCS format files.',
      'The type of each file is determined automatically.  For example:',
      '',
      '    node frcs2compass.js C:/FRCS/data > frcs.dat',
      '',
      'Will process all files in C:/FRCS/data and subfolders and output to frcs.dat.',
      '',
      'To get correct output, make sure that you make a separate directory for',
      'each cave containing:',
      '  * One (and only one) raw survey data file (typically named cdata.<cave>)',
      '  * One (and only one) trip summary file    (typically named STAT_sum.txt)',
      '',
      'For example, you could use the following folder structure:',
      '',
      '  C:/FRCS/data/',
      '               fr/',
      '                  cdata.fr',
      '                  STAT_sum.txt',
      '                  FOR008.fr',
      '               cr/',
      '                  cdata.cr',
      '                  STAT_sum.txt',
      '                  FOR008.cr',
      '               vr/',
      '                  cdata.vr',
      '                  STAT_sum.txt',
      '                  FOR008.vr',
      '',
      'And then export using the command above.',
      '',
      'BUT, Compass seems to barf on multi-cave files output by this program.',
      "I'm not yet sure if this program or Compass is at fault.",
      '[[OPTIONS]]',
      '',
    ].join('\n'),
  },
})

program.apply(
  new UntildifyArgvPlugin(),
  new FindFrcsFilesPlugin(),
  new DetectMultiDirectoryPlugin(),
  new ResourceFileGetoptPlugin(),
  new PrintFilesFoundPlugin(),
  new StandardParsePlugin(),
  new AssociateTripSummariesPlugin(),
  new CompassOutputPlugin()
)

program.run()
