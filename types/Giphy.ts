export interface GiphySearch {
  api_key: string
  lang?: string
  limit: number
  q: string
  type?: string
}

export interface GiphyResponse {
  data: GiphyGif[]
}

export interface GiphyGif {
  type: string
  id: string
  slug: string
  url: string
  bitly_url: string
  embed_url: string
  username: string
  source: string
  rating: string
  content_url: string
  source_tld: string
  source_post_url: string
  update_datetime: string
  create_datetime: string
  import_datetime: string
  trending_datetime: string
  title: string
  images: GiphyImages
}

export interface GiphyImages {
  original: GiphyImageDefinition
  fixed_width: GiphyImageDefinition
}

export interface GiphyImageDefinition {
  webp: string
  webp_size: string
}
