import { Client } from '@open-wa/wa-automate'
import qs from 'qs'

import { botOptions } from '../config'
import { getImgflipImage } from './imgflipHandler'

export const paramSerializer = (p: any) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}

export const oneChanceIn = (odds: number) => {
  return Math.floor(Math.random() * odds) === 0
}