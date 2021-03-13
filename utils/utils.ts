import qs from 'qs'

export const paramSerializer = (p: any) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}
