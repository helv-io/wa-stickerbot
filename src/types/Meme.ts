export interface Meme {
  id: string
  name: string
  lines: number
  overlays: number
  styles: string[]
  blank: string
  example: {
    text: string[]
    url: string
  }
  source: string
  _self: string
}
