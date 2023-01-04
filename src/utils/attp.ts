import { Encoder } from 'canvagif'

export const attp = (text: string) => {
  const lines = addLineBreaks(text).split('\n')
  const size = 500
  const colors: string[] = []

  for (let i = 0; i < 10; i++) {
    colors.push(`#${((Math.random() * 0xffffff) << 0).toString(16)}`)
  }

  const encoder = new Encoder(size, size).start()
  const context = encoder.getContext()

  const lineHeight = context.measureText('W').width * 4
  const totalHeight = lineHeight * lines.length
  const x = size / 2
  let y = x - totalHeight / 2

  context.font = '50px Arial'
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  colors.forEach((color) => {
    context.fillStyle = color
    lines.forEach((line) => {
      context.fillText(line, x, y, size)
      y += lineHeight
    })
    encoder.updateFrame()
    y = x - totalHeight / 2
  })

  return encoder.finish().toString('base64')
}

const addLineBreaks = (text: string, limit = 15) => {
  let newStr = ''
  let currentLineLength = 0
  const words = text.split(' ')
  for (const word of words) {
    if (currentLineLength + word.length > limit) {
      newStr += '\n'
      currentLineLength = 0
    }
    newStr += word + ' '
    currentLineLength += word.length + 1
  }
  return newStr
}