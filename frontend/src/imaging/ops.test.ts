import { Image } from 'image-js'
import { describe, expect, it } from 'vitest'
import { applyOp, defaultParams, describeStep, getOp, OPS } from './ops'
import { gradient, lowContrast, saltNoise, solid, twoSquares, verticalEdge } from './testImages'

describe('registry', () => {
  it('has unique ids', () => {
    const ids = OPS.map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('default values are inside min/max and in the option list', () => {
    for (const op of OPS) {
      for (const p of op.params) {
        if (p.type === 'number') {
          expect(p.default).toBeGreaterThanOrEqual(p.min)
          expect(p.default).toBeLessThanOrEqual(p.max)
        } else {
          expect(p.options.map((o) => o.value)).toContain(p.default)
        }
      }
    }
  })

  it('every op runs with default params on a colour and on a grey image', () => {
    for (const op of OPS) {
      for (const img of [twoSquares(), gradient()]) {
        const { image } = applyOp(op.id, img, defaultParams(op))
        expect(image.width).toBeGreaterThan(0)
        expect(image.height).toBeGreaterThan(0)
      }
    }
  })

  it('has at least 5 filters', () => {
    expect(OPS.filter((o) => o.category === 'filter').length).toBeGreaterThanOrEqual(5)
  })

  it('throws for an unknown op', () => {
    expect(() => getOp('nope')).toThrow('Unknown operation')
  })

  it('describes a step', () => {
    expect(describeStep('invert', {})).toBe('Invert')
    expect(describeStep('gaussianBlur', { sigma: 2 })).toBe('Gaussian blur (sigma 2)')
    expect(describeStep('edges', { operator: 'scharr' })).toBe('Edges (Scharr)')
    expect(describeStep('pixelate', { cellSize: 4 })).toBe('Pixelate (cell size 4)')
  })
})

describe('filters', () => {
  it('invert: v -> 255 - v, twice gives the original', () => {
    const img = twoSquares()
    const once = applyOp('invert', img).image
    expect(once.getPixel(0, 0)).toEqual([15, 105, 215, 255])
    const twice = applyOp('invert', once).image
    expect(twice.getRawImage().data).toEqual(img.getRawImage().data)
  })

  it('greyscale: one channel, pure red is 54 with luma709', () => {
    const out = applyOp('grey', solid(4, 4, [255, 0, 0, 255]), { algorithm: 'luma709' }).image
    expect(out.colorModel).toBe('GREY')
    expect(out.getPixel(0, 0)).toEqual([54])
  })

  it('pixelate: every cell has one value', () => {
    const out = applyOp('pixelate', gradient(32, 16), { cellSize: 8 }).image
    for (let cy = 0; cy < 16; cy += 8) {
      for (let cx = 0; cx < 32; cx += 8) {
        const first = out.getPixel(cx, cy)[0]
        for (let y = cy; y < cy + 8; y++) {
          for (let x = cx; x < cx + 8; x++) expect(out.getPixel(x, y)[0]).toBe(first)
        }
      }
    }
  })

  it('box and gaussian blur keep a solid image the same', () => {
    const img = solid(20, 20, [90])
    expect(applyOp('blur', img, { size: 5 }).image.getPixel(10, 10)).toEqual([90])
    expect(applyOp('gaussianBlur', img, { sigma: 2 }).image.getPixel(10, 10)).toEqual([90])
  })

  it('box and gaussian blur soften an edge', () => {
    const img = verticalEdge()
    for (const id of ['blur', 'gaussianBlur']) {
      const out = applyOp(id, img).image
      const left = out.getPixel(9, 5)[0]
      const right = out.getPixel(10, 5)[0]
      expect(left).toBeGreaterThan(0)
      expect(right).toBeLessThan(255)
    }
  })

  it('median removes salt noise', () => {
    const out = applyOp('median', saltNoise(), { size: 3 }).image
    expect(out.getPixel(10, 7)).toEqual([128])
    expect(out.getPixel(15, 15)).toEqual([128])
  })

  it('edges: flat image gives 0, vertical edge gives a strong response', () => {
    const flat = applyOp('edges', solid(20, 10, [80])).image
    expect(flat.getPixel(10, 5)).toEqual([0])

    const out = applyOp('edges', verticalEdge(), { operator: 'sobel' }).image
    expect(out.getPixel(10, 5)[0]).toBeGreaterThan(200)
    expect(out.getPixel(2, 5)[0]).toBe(0)
  })

  it('edges converts a colour image to grey first', () => {
    const out = applyOp('edges', twoSquares()).image
    expect(out.colorModel).toBe('GREY')
  })

  it('auto contrast stretches values to 0..255', () => {
    const out = applyOp('contrast', lowContrast()).image
    expect(out.getPixel(0, 0)).toEqual([0])
    expect(out.getPixel(31, 0)).toEqual([255])
  })

  it('does not change the input image', () => {
    const img = twoSquares()
    const before = new Uint8Array(img.getRawImage().data)
    for (const op of OPS) applyOp(op.id, img)
    expect(new Uint8Array(img.getRawImage().data)).toEqual(before)
  })

  it('applyOp fills in missing params with defaults', () => {
    const img = new Image(16, 16, { colorModel: 'GREY' })
    expect(() => applyOp('pixelate', img)).not.toThrow()
  })
})
