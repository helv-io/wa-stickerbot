export interface TenorSearch {
  key: string
  locale?: string
  media_filter?: string
  limit?: number
  q: string
  type?: string
}

export interface TenorResponse {
  next: string
  results: TenorGifObject[]
}

export interface TenorGifObject {
  created: number
  hasaudio: boolean
  id: string
  media: TenorMediaObject[]
  tags: string[]
  title: string
  itemurl: string
  hascaption: boolean
  url: string
}

export interface TenorMediaObject {
  gif: {
    preview: string
    url: string
    dims: number[]
    size: number
  }
  tinygif: {
    preview: string
    url: string
    dims: number[]
    size: number
  }
}
