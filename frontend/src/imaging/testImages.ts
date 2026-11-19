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

// crna slika s jednim bijelim pikselom u sredini
export function dot(): Image {
  const img = solid(11, 11, [0])
  img.setPixel(5, 5, [255])
  return img
}

// crna slika s bijelim kvadratom 5x5 (od 8 do 12)
export function whiteSquare(): Image {
  const img = solid(21, 21, [0])
  for (let y = 8; y <= 12; y++) {
    for (let x = 8; x <= 12; x++) img.setPixel(x, y, [255])
  }
  return img
}

// bijeli kvadrat 7x7 s crnom rupom od jednog piksela u sredini
export function squareWithHole(): Image {
  const img = solid(15, 15, [0])
  for (let y = 4; y <= 10; y++) {
    for (let x = 4; x <= 10; x++) img.setPixel(x, y, [255])
  }
  img.setPixel(7, 7, [0])
  return img
}

// svaki piksel ima drugu vrijednost, da se vidi kamo se pomaknuo
export function numbered(width = 4, height = 3): Image {
  const img = new Image(width, height, { colorModel: 'GREY' })
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) img.setPixel(x, y, [y * width + x])
  }
  return img
}

// dvije razine sivoga: lijevo 40, desno 200
export function bimodal(width = 20, height = 10): Image {
  const img = new Image(width, height, { colorModel: 'GREY' })
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) img.setPixel(x, y, [x < width / 2 ? 40 : 200])
  }
  return img
}
