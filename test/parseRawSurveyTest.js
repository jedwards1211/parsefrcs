import {expect} from 'chai'
import EventEmitter from 'events'
import parseRawSurvey from '../src/parseRawSurvey'

describe('parseRawSurvey', () => {
  it("works when line ends before all LRUD columns", () => {
    const emitter = new EventEmitter()
    const parseLine = parseRawSurvey(emitter, 'blah.txt')

    const shots = []
    const errors = []
    emitter.on('shot', shot => shots.push(shot))
    emitter.on('error', error => errors.push(error))

    parseLine('     Fisher Ridge Cave System')
    parseLine('Test Trip')
    parseLine(' *')
    parseLine('FT CC DD')
    const line = ' NT49 NT48  95.8     154 154.5    3  3.5 20 12'
    parseLine(line)

    expect(shots).to.deep.equal([
      {
        file: 'blah.txt',
        line: 5,
        text: line,
        to: 'NT49',
        from: 'NT48',
        dist: 95.8,
        azmFs: 154,
        azmBs: 154.5,
        incFs: 3,
        incBs: 3.5,
        flag: null,
        exclude: false,
        l: 20,
        r: 12,
      },
    ])
    expect(errors).to.have.lengthOf(2)
    expect(errors[0].type).to.equal('missing-up')
    expect(errors[1].type).to.equal('missing-down')
  })
  it(`tolerates invalid character after F`, function () {
    const emitter = new EventEmitter()
    const parseLine = parseRawSurvey(emitter, 'blah.txt')

    const trips = []
    const errors = []
    emitter.on('trip', trip => trips.push(trip))
    emitter.on('error', error => errors.push(error))

    parseLine('     Fisher Ridge Cave System')
    parseLine('Test Trip')
    parseLine(' *')
    parseLine('F* CC DD')

    expect(trips).to.have.lengthOf(1)
    expect(trips[0].distUnit).to.equal('F*')
    expect(errors).to.have.lengthOf(1)
    expect(errors[0].type).to.equal('invalid-distance-unit')
  })
})
