export interface Imgflip {
  template_id: string
  username: string
  password: string
  boxes: ImgflipBox[]
}

export interface ImgflipBox {
  text: string
  x?: number
  y?: number
  width?: number
  heigth?: number
  color?: string
  outline_color?: string
}

export interface ImgflipResponse {
  success: boolean
  error_message?: string
  data: ImgflipData
}

export interface ImgflipData {
  url?: string
  page_url?: string
  memes: ImgflipMeme[]
}

export interface ImgflipMeme {
  id: string
  name: string
  url: string
  width: number
  heigth: number
  box_count: number
}
