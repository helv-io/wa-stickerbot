import { Client } from '@open-wa/wa-automate'
import qs from 'qs'

import { getImgflipImage } from './imgflipHandler'
import { botOptions } from '../config'

export const paramSerializer = (p: any) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}

export const oneChanceIn = (odds: number) => {
  return Math.floor(Math.random() * odds) === 0
}
