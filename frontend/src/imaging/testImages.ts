import { Image } from 'image-js'

// Male umjetne slike za testove, rezultat je unaprijed poznat.

export function solid(width: number, height: number, color: number[]): Image {
  const colorModel = color.length === 1 ? 'GREY' : color.length === 3 ? 'RGB' : 'RGBA'
  const img = new Image(width, height, { colorModel })
  img.fill(color)
  return img
}

// sivi gradijent slijeva nadesno, od 0 do 255
export function gradient(width = 32, height = 16): Image {
  const img = new Image(width, height, { colorModel: 'GREY' })
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      img.setPixel(x, y, [Math.round((x * 255) / (width - 1))])
    }
  }
  return img
}

// slaba razlika svjetline, 100..160
export function lowContrast(width = 32, height = 16): Image {
  const img = new Image(width, height, { colorModel: 'GREY' })
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      img.setPixel(x, y, [100 + Math.round((x * 60) / (width - 1))])
    }
  }
  return img
}

// narancasta pozadina i dva plava kvadrata (RGBA)
export function twoSquares(): Image {
  const img = solid(40, 30, [240, 150, 40, 255])
  for (let y = 5; y < 12; y++) {
    for (let x = 5; x < 12; x++) img.setPixel(x, y, [30, 60, 220, 255])
  }
  for (let y = 15; y < 23; y++) {
    for (let x = 25; x < 33; x++) img.setPixel(x, y, [30, 60, 220, 255])
  }
  return img
}

// lijeva polovica crna, desna bijela -> jedan okomiti rub
export function verticalEdge(width = 20, height = 10): Image {
  const img = new Image(width, height, { colorModel: 'GREY' })
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) img.setPixel(x, y, [x < width / 2 ? 0 : 255])
  }
  return img
}

// siva pozadina (128) s nekoliko bijelih piksela suma
export function saltNoise(): Image {
  const img = solid(20, 20, [128])
  for (const [x, y] of [[3, 3], [10, 7], [15, 15], [6, 14]]) img.setPixel(x, y, [255])
  return img
}
