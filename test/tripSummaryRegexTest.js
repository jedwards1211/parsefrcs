import {tripSummaryRegex} from '../src/regexes'
import {expect} from 'chai'

describe('tripSummaryRegex', () => {
  it('test 1', () => {
    let line = '  4   1/25/84   1306.10   48   D-survey canyon past Sand Room to downstream dead-end trunk beyond Sand Room (ReEXCLUDED:   0.00  0'
    const match = tripSummaryRegex.exec(line)
    expect(match.index).to.equal(0)
    expect([...match]).to.deep.equal([
      '  4   1/25/84   1306.10   48   D-survey canyon past Sand Room to downstream dead-end trunk beyond Sand Room (ReEXCLUDED:   0.00  0',
      '4',
      '1',
      '25',
      '84',
      '1306.10',
      '48',
      'D-survey canyon past Sand Room to downstream dead-end trunk beyond Sand Room (Re',
      '0.00',
      '0',
    ])
  })
  it('test 2', () => {
    let line = '  4   1/ 5/84   1306.10   48   D-survey canyon past Sand Room to downstream dead-end trunk beyond Sand Room (ReEXCLUDED:   0.00  0'
    const match = tripSummaryRegex.exec(line)
    expect(match.index).to.equal(0)
    expect([...match]).to.deep.equal([
      '  4   1/ 5/84   1306.10   48   D-survey canyon past Sand Room to downstream dead-end trunk beyond Sand Room (ReEXCLUDED:   0.00  0',
      '4',
      '1',
      ' 5',
      '84',
      '1306.10',
      '48',
      'D-survey canyon past Sand Room to downstream dead-end trunk beyond Sand Room (Re',
      '0.00',
      '0',
    ])
  })
  it('test 3', () => {
    let line = '  2   2/14/1981  1133.75   55  TRICKY TRAVERSE AND THEN FIRST SURVEY IN UPPER CROWLWAY                         EXCLUDED:   0.00  0'
    const match = tripSummaryRegex.exec(line)
    expect(match.index).to.equal(0)
    expect([...match]).to.deep.equal([
      '  2   2/14/1981  1133.75   55  TRICKY TRAVERSE AND THEN FIRST SURVEY IN UPPER CROWLWAY                         EXCLUDED:   0.00  0',
      '2',
      '2',
      '14',
      '1981',
      '1133.75',
      '55',
      'TRICKY TRAVERSE AND THEN FIRST SURVEY IN UPPER CROWLWAY                         ',
      '0.00',
      '0',
    ])
  })
})

