import qs from 'qs'

import { GiphySearch } from '../types/Giphy'
import { TenorSearch } from '../types/Tenor'

export const paramSerializer = (p: TenorSearch | GiphySearch) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}

// Random true based on 1:odds
export const oneChanceIn = (odds: number) => {
  return Math.floor(Math.random() * odds) === 0
}

// Clones an object o, preserving type T
export const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o))
