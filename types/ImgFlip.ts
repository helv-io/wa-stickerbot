/* eslint-disable @typescript-eslint/naming-convention */
export interface ImgFlip {
  template_id: string;
  username: string;
  password: string;
  boxes: ImgFlipBox[];
}

export interface ImgFlipBox {
  text: string;
  x?: number;
  y?: number;
  width?: number;
  heigth?: number;
  color?: string;
  outline_color?: string;
}

export interface ImgFlipResponse {
  success: boolean;
  error_message?: string;
  data: ImgFlipData;
}

export interface ImgFlipData {
  url?: string;
  page_url?: string;
  memes: ImgFlipMeme[];
}

export interface ImgFlipMeme {
  id: string;
  name: string;
  url: string;
  width: number;
  heigth: number;
  box_count: number;
}
