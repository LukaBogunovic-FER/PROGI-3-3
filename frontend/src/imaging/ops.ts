import { computeThreshold, Image, Mask } from 'image-js'
import { colorizeLabels, labelComponents } from './segmentation'

// Sve operacije obrade slike na jednom mjestu. Editor iz ove liste
// slaze panel s alatima, pa nova operacija = novi zapis u OPS + test.

export type Category = 'filter' | 'morphology' | 'geometric' | 'segmentation'

export type NumberParam = {
  key: string
  label: string
  type: 'number'
  min: number
  max: number
  step: number
  default: number
}

export type SelectParam = {
  key: string
  label: string
  type: 'select'
  options: { value: string; label: string }[]
  default: string
}

export type ParamDef = NumberParam | SelectParam

export type Params = Record<string, number | string>

export type OpResult = {
  image: Image
  // kratka poruka za korisnika, npr. broj pronadenih regija
  info?: string
}

export type OpDef = {
  id: string
  label: string
  category: Category
  // 'grey' = operacija radi samo nad sivom slikom, applyOp je sam pretvori
  input: 'any' | 'grey'
  params: ParamDef[]
  run: (image: Image, params: Params) => Image | Mask | OpResult
}

export const CATEGORY_LABELS: Record<Category, string> = {
  filter: 'Filters',
  morphology: 'Morphology',
  geometric: 'Geometry',
  segmentation: 'Segmentation',
}

const num = (p: Params, key: string) => Number(p[key])
const str = (p: Params, key: string) => String(p[key])

// kvadratni strukturni element size x size, sve jedinice
export function squareKernel(size: number): number[][] {
  const kernel: number[][] = []
  for (let i = 0; i < size; i++) kernel.push(new Array(size).fill(1))
  return kernel
}

const morphParams: ParamDef[] = [
  { key: 'size', label: 'Kernel size', type: 'number', min: 3, max: 15, step: 2, default: 3 },
  { key: 'iterations', label: 'Iterations', type: 'number', min: 1, max: 10, step: 1, default: 1 },
]

const morphOptions = (p: Params) => ({ kernel: squareKernel(num(p, 'size')), iterations: num(p, 'iterations') })

// image-js grey() radi samo za RGB/RGBA, pa sive slike treba posebno
function toGrey(img: Image, algorithm?: 'luma709' | 'average' | 'lightness' | 'max'): Image {
  if (img.colorModel === 'GREY') return img
  if (img.colorModel === 'GREYA') return img.convertColor('GREY')
  return img.grey({ algorithm })
}

export const OPS: OpDef[] = [
  // ---------- filteri ----------
  {
    id: 'invert',
    label: 'Invert',
    category: 'filter',
    input: 'any',
    params: [],
    run: (img) => img.invert(),
  },
  {
    id: 'grey',
    label: 'Greyscale',
    category: 'filter',
    input: 'any',
    params: [
      {
        key: 'algorithm',
        label: 'Method',
        type: 'select',
        default: 'luma709',
        options: [
          { value: 'luma709', label: 'Luma (BT.709)' },
          { value: 'average', label: 'Average' },
          { value: 'lightness', label: 'Lightness' },
          { value: 'max', label: 'Max channel' },
        ],
      },
    ],
    run: (img, p) => toGrey(img, str(p, 'algorithm') as 'luma709' | 'average' | 'lightness' | 'max'),
  },
  {
    id: 'pixelate',
    label: 'Pixelate',
    category: 'filter',
    input: 'any',
    params: [{ key: 'cellSize', label: 'Cell size (px)', type: 'number', min: 2, max: 64, step: 1, default: 8 }],
    run: (img, p) => img.pixelate({ cellSize: num(p, 'cellSize') }),
  },
  {
    id: 'blur',
    label: 'Box blur',
    category: 'filter',
    input: 'any',
    params: [{ key: 'size', label: 'Size (px)', type: 'number', min: 3, max: 31, step: 2, default: 5 }],
    run: (img, p) => img.blur({ width: num(p, 'size'), height: num(p, 'size') }),
  },
  {
    id: 'gaussianBlur',
    label: 'Gaussian blur',
    category: 'filter',
    input: 'any',
    params: [{ key: 'sigma', label: 'Sigma', type: 'number', min: 0.5, max: 10, step: 0.5, default: 2 }],
    run: (img, p) => img.gaussianBlur({ sigma: num(p, 'sigma') }),
  },
  {
    id: 'median',
    label: 'Median (denoise)',
    category: 'filter',
    input: 'any',
    params: [{ key: 'size', label: 'Window', type: 'number', min: 3, max: 9, step: 2, default: 3 }],
    run: (img, p) => img.medianFilter({ cellSize: num(p, 'size'), borderType: 'reflect101' }),
  },
  {
    id: 'edges',
    label: 'Edges',
    category: 'filter',
    input: 'grey',
    params: [
      {
        key: 'operator',
        label: 'Operator',
        type: 'select',
        default: 'sobel',
        options: [
          { value: 'sobel', label: 'Sobel' },
          { value: 'scharr', label: 'Scharr' },
          { value: 'prewitt', label: 'Prewitt' },
        ],
      },
    ],
    run: (img, p) => img.derivativeFilter({ filter: str(p, 'operator') as 'sobel' | 'scharr' | 'prewitt' }),
  },
  {
    id: 'contrast',
    label: 'Auto contrast',
    category: 'filter',
    input: 'any',
    params: [],
    run: (img) => img.increaseContrast(),
  },

  // ---------- morfologija (radi nad sivom slikom) ----------
  {
    id: 'erode',
    label: 'Erosion',
    category: 'morphology',
    input: 'grey',
    params: morphParams,
    run: (img, p) => img.erode(morphOptions(p)),
  },
  {
    id: 'dilate',
    label: 'Dilation',
    category: 'morphology',
    input: 'grey',
    params: morphParams,
    run: (img, p) => img.dilate(morphOptions(p)),
  },
  {
    id: 'open',
    label: 'Opening',
    category: 'morphology',
    input: 'grey',
    params: morphParams,
    run: (img, p) => img.open(morphOptions(p)),
  },
  {
    id: 'close',
    label: 'Closing',
    category: 'morphology',
    input: 'grey',
    params: morphParams,
    run: (img, p) => img.close(morphOptions(p)),
  },

  // ---------- geometrijske transformacije ----------
  {
    id: 'resize',
    label: 'Resize',
    category: 'geometric',
    input: 'any',
    params: [{ key: 'percent', label: 'Scale (%)', type: 'number', min: 5, max: 400, step: 5, default: 50 }],
    run: (img, p) => {
      const width = Math.max(1, Math.round((img.width * num(p, 'percent')) / 100))
      return img.resize({ width, preserveAspectRatio: true })
    },
  },
  {
    id: 'rotate',
    label: 'Rotate',
    category: 'geometric',
    input: 'any',
    params: [
      {
        key: 'angle',
        label: 'Angle',
        type: 'select',
        default: '90',
        options: [
          { value: '90', label: '90° right' },
          { value: '180', label: '180°' },
          { value: '270', label: '90° left' },
        ],
      },
    ],
    run: (img, p) => img.rotate(num(p, 'angle') as 90 | 180 | 270),
  },
  {
    id: 'rotateFree',
    label: 'Rotate (any angle)',
    category: 'geometric',
    input: 'any',
    params: [{ key: 'angle', label: 'Angle (°)', type: 'number', min: -180, max: 180, step: 1, default: 15 }],
    // fullImage: platno se poveca da se uglovi ne odrezu
    run: (img, p) => img.transformRotate(num(p, 'angle'), { fullImage: true }),
  },
  {
    id: 'flip',
    label: 'Flip',
    category: 'geometric',
    input: 'any',
    params: [
      {
        key: 'axis',
        label: 'Axis',
        type: 'select',
        default: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
          { value: 'both', label: 'Both' },
        ],
      },
    ],
    run: (img, p) => img.flip({ axis: str(p, 'axis') as 'horizontal' | 'vertical' | 'both' }),
  },
  {
    id: 'crop',
    label: 'Crop',
    category: 'geometric',
    input: 'any',
    // sve u postocima slike, da radi za bilo koju velicinu
    params: [
      { key: 'left', label: 'Left (%)', type: 'number', min: 0, max: 95, step: 1, default: 10 },
      { key: 'top', label: 'Top (%)', type: 'number', min: 0, max: 95, step: 1, default: 10 },
      { key: 'width', label: 'Width (%)', type: 'number', min: 5, max: 100, step: 1, default: 80 },
      { key: 'height', label: 'Height (%)', type: 'number', min: 5, max: 100, step: 1, default: 80 },
    ],
    run: (img, p) => {
      const column = Math.floor((img.width * num(p, 'left')) / 100)
      const row = Math.floor((img.height * num(p, 'top')) / 100)
      // ne smije izaci izvan slike
      const width = Math.max(1, Math.min(img.width - column, Math.round((img.width * num(p, 'width')) / 100)))
      const height = Math.max(1, Math.min(img.height - row, Math.round((img.height * num(p, 'height')) / 100)))
      return img.crop({ origin: { column, row }, width, height })
    },
  },

  // ---------- segmentacija ----------
  {
    id: 'threshold',
    label: 'Threshold (Otsu)',
    category: 'segmentation',
    input: 'grey',
    params: [],
    run: (img) => {
      // Otsu sam odabere prag iz histograma, vrijednost prikazujemo korisniku
      const value = computeThreshold(img, { algorithm: 'otsu' })
      const mask = img.threshold({ algorithm: 'otsu' })
      return { image: mask.convertColor('GREY'), info: `Otsu threshold: ${value}` }
    },
  },
  {
    id: 'regions',
    label: 'Region labelling',
    category: 'segmentation',
    input: 'grey',
    params: [
      {
        key: 'connectivity',
        label: 'Connectivity',
        type: 'select',
        default: '8',
        options: [
          { value: '8', label: '8 neighbours' },
          { value: '4', label: '4 neighbours' },
        ],
      },
      { key: 'minSize', label: 'Ignore regions smaller than (px)', type: 'number', min: 1, max: 500, step: 1, default: 20 },
      {
        key: 'objects',
        label: 'Objects are',
        type: 'select',
        default: 'bright',
        options: [
          { value: 'bright', label: 'Bright' },
          { value: 'dark', label: 'Dark' },
        ],
      },
    ],
    run: (img, p) => {
      // prvo Otsu da dobijemo objekte i pozadinu, onda oznacavanje podrucja
      let mask = img.threshold({ algorithm: 'otsu' })
      if (str(p, 'objects') === 'dark') mask = mask.invert()

      const { width, height } = mask
      const foreground = new Uint8Array(width * height)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) foreground[y * width + x] = mask.getBit(x, y)
      }

      const { labels, count } = labelComponents(
        foreground,
        width,
        height,
        num(p, 'connectivity') as 4 | 8,
        num(p, 'minSize'),
      )
      const image = new Image(width, height, { colorModel: 'RGB', data: colorizeLabels(labels) })
      return { image, info: `${count} ${count === 1 ? 'region' : 'regions'} found` }
    },
  },
]

export function getOp(id: string): OpDef {
  const op = OPS.find((o) => o.id === id)
  if (!op) throw new Error(`Unknown operation: ${id}`)
  return op
}

export function defaultParams(op: OpDef): Params {
  const params: Params = {}
  for (const p of op.params) params[p.key] = p.default
  return params
}

// Pokrece operaciju nad slikom. Ako operacija trazi sivu sliku, prvo je pretvori,
// a masku (rezultat praga) vraca kao sivu sliku da se na nju mogu nastaviti druge operacije.
export function applyOp(id: string, image: Image, params?: Params): OpResult {
  const op = getOp(id)
  const input = op.input === 'grey' ? toGrey(image) : image
  const out = op.run(input, { ...defaultParams(op), ...params })

  if (out instanceof Image) return { image: out }
  if (out instanceof Mask) return { image: out.convertColor('GREY') }
  return out
}

// Npr. "Gaussian blur (sigma 2)". Koristi se za povijest izmjena i opis objave.
export function describeStep(id: string, params: Params): string {
  const op = OPS.find((o) => o.id === id)
  if (!op) return id
  if (op.params.length === 0) return op.label

  const parts = op.params.map((def) => {
    const value = params[def.key] ?? def.default
    if (def.type === 'select') {
      return def.options.find((o) => o.value === String(value))?.label ?? String(value)
    }
    const name = def.label.replace(/\s*\(.*\)$/, '').toLowerCase()
    return `${name} ${value}`
  })
  return `${op.label} (${parts.join(', ')})`
}
