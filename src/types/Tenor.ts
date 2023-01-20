export interface TenorSearch {
  key: string
  q: string
  client_key?: string
  searchfilter?: 'sticker' | 'static' | '-static' | 'sticker,-static'
  locale?: string
  media_filter?: string
  limit?: number
  type?: 'featured' | 'trending'
  random?: boolean
}

export interface TenorResponse {
  next: string
  results: TenorObject[]
}

export interface TenorObject {
  id: string
  title: string
  media_formats: TenorMediaObject
  created: number
  content_description: string
  itemurl: string
  url: string
  tags: string[]
  flags: string[]
  hasaudio: boolean
}

export interface TenorMediaObject {
  webp_transparent: {
    url: string
    duration: number
    preview: string
    dims: number[]
    size: number
  }
}
