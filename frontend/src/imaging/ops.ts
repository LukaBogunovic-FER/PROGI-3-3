import { Image, Mask } from 'image-js'

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
