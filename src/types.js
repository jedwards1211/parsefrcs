// @flow

export type TripSummary = {
  tripNum: number,
  date: Date,
  footage: number,
  numShots: number,
  name: string,
  excludedFootage: number,
  numExcludedShots: number,
  surveyors: Array<string>,
  shots: Array<string>,
}

export type Cave = {
  name: string,
  location?: string,
}

export type Trip = {
  cave: Cave,
  file: string,
  startLine: number,
  endLine: number,
  name: string,
  distUnit: 'FT' | 'FI' | 'M ',
  backAzmType: 'C' | 'B' | ' ',
  backIncType: 'C' | 'B' | ' ',
  azmCorrected: boolean,
  incCorrected: boolean,
  azmUnit: 'D' | 'G' | 'M',
  incUnit: 'D' | 'G' | 'M',
  comment: ?string,
  section?: string,
  surveyScan?: string,
}

export type TripWithSummary = Trip & TripSummary

export type Shot = {
  file: string,
  line: number,
  text: string,
  from: string,
  to: string,
  dist: number,
  distInches?: number,
  vertDist?: number,
  flag?: 'H' | 'D',
  exclude?: boolean,
  azmFs: number,
  azmBs: number,
  incFs: number,
  incBs: number,
  l: number,
  r: number,
  u: number,
  d: number,
}

export type CalculatedShot = {
  toName: string,
  surface: boolean,
  fromNum: number,
  toNum: number,
  x: number,
  y: number,
  z: number,
  lx: number,
  ly: number,
  rx: number,
  ry: number,
  u: number,
  d: number,
  tripNum: number,
}
