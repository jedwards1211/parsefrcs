import parseTripSummaries from '../src/parseTripSummaries'
import {expect} from 'chai'

describe('parseTripSummaries', () => {
  it('test 1', () => {
    const text = `
  2   2/14/1981  1133.75   55  TRICKY TRAVERSE AND THEN FIRST SURVEY IN UPPER CROWLWAY                         EXCLUDED:   0.00  0
                               Dan Crowl  Keith Ortiz  Chip Hopper  Peter Quick  Larry Bean
                                 A1-A56

  1   2/15/1981   258.60   17  ENTRANCE DROPS, JOE'S "I LOVE MY WIFE TRAVERSE", TRICKY TRAVERSE                EXCLUDED:   0.00  0
                               Peter Quick  Keith Ortiz
                                 A1           AD1-AD3      AE1          AE1 SIDE
                                 AE9 SIDE     AE10-AE9     AE13 SIDE    AE15 SIDE
                                 AE20-AE11
                                 
  3   3/06/81  2371.20   61  DOUG'S DEMISE (50 FT DROP), CHRIS CROSS, CRAWL ABOVE DROP                       EXCLUDED:   0.00  0
                               Peter Quick  Chris Gerace  Phil Oden  Chip Hopper
                                 A13 SIDE     B1-B5        B2 SIDE      B3 SIDE
                                 B6-B18       B17 SIDE     B19-B38      B32 SIDE
                                 BS1-BS5      C1-C18

  4   3/21/107  1320.10   51  CHRIS CROSS CONTINUED, FRIENDLY PASSAGE TO FISHER RIVER (VIA CLIMB DOWN)        EXCLUDED:  27.60  1
                               Peter Quick  Keith Ortiz  Dan Crowl  Larry Bean  Chip Hopper
                                 C18-C48      C46 SIDE     D1-D21

`
    const summaries = parseTripSummaries(text)

    expect(summaries).to.deep.equal([ // eslint-disable-line no-sparse-arrays
      /* undefined */,
      {
        "tripNum": 1,
        "date": new Date(1981, 1, 15),
        "footage": 258.6,
        "numShots": 17,
        "name": "ENTRANCE DROPS, JOE'S \"I LOVE MY WIFE TRAVERSE\", TRICKY TRAVERSE",
        "excludedFootage": 0,
        "numExcludedShots": 0,
        "surveyors": [
          "Peter Quick",
          "Keith Ortiz"
        ],
        "shots": [
          "A1",
          "AD1-AD3",
          "AE1",
          "AE1 SIDE",
          "AE9 SIDE",
          "AE10-AE9",
          "AE13 SIDE",
          "AE15 SIDE",
          "AE20-AE11"
        ]
      },
      {
        "tripNum": 2,
        "date": new Date(1981, 1, 14),
        "footage": 1133.75,
        "numShots": 55,
        "name": "TRICKY TRAVERSE AND THEN FIRST SURVEY IN UPPER CROWLWAY",
        "excludedFootage": 0,
        "numExcludedShots": 0,
        "surveyors": [
          "Dan Crowl",
          "Keith Ortiz",
          "Chip Hopper",
          "Peter Quick",
          "Larry Bean",
        ],
        "shots": [
          "A1-A56",
        ]
      },
      {
        "tripNum": 3,
        "date": new Date(1981, 2, 6),
        "footage": 2371.2,
        "numShots": 61,
        "name": "DOUG'S DEMISE (50 FT DROP), CHRIS CROSS, CRAWL ABOVE DROP",
        "excludedFootage": 0,
        "numExcludedShots": 0,
        "surveyors": [
          "Peter Quick",
          "Chris Gerace",
          "Phil Oden",
          "Chip Hopper"
        ],
        "shots": [
          "A13 SIDE",
          "B1-B5",
          "B2 SIDE",
          "B3 SIDE",
          "B6-B18",
          "B17 SIDE",
          "B19-B38",
          "B32 SIDE",
          "BS1-BS5",
          "C1-C18"
        ]
      },
      {
        "tripNum": 4,
        "date": new Date(2007, 2, 21),
        "footage": 1320.1,
        "numShots": 51,
        "name": "CHRIS CROSS CONTINUED, FRIENDLY PASSAGE TO FISHER RIVER (VIA CLIMB DOWN)",
        "excludedFootage": 27.6,
        "numExcludedShots": 1,
        "surveyors": [
          "Peter Quick",
          "Keith Ortiz",
          "Dan Crowl",
          "Larry Bean",
          "Chip Hopper",
        ],
        "shots": [
          "C18-C48",
          "C46 SIDE",
          "D1-D21",
        ]
      },
    ])
  })
})

