import { describe, expect, it } from 'vitest'
import { colorizeLabels, labelComponents } from './segmentation'

// binarna slika iz "ASCII crteza": '#' = objekt, '.' = pozadina
function grid(rows: string[]) {
  const width = rows[0].length
  const data: number[] = []
  for (const row of rows) for (const c of row) data.push(c === '#' ? 1 : 0)
  return { data, width, height: rows.length }
}

describe('labelComponents', () => {
  it('counts three separate blobs and their sizes', () => {
    const g = grid([
      '##....#',
      '##....#',
      '.......',
      '..###..',
      '..###..',
    ])
    const r = labelComponents(g.data, g.width, g.height, 4)
    expect(r.count).toBe(3)
    expect(r.sizes.slice(1).sort((a, b) => a - b)).toEqual([2, 4, 6])
  })

  it('diagonal pixels are one region only with 8-connectivity', () => {
    const g = grid([
      '#..',
      '.#.',
      '..#',
    ])
    expect(labelComponents(g.data, g.width, g.height, 4).count).toBe(3)
    expect(labelComponents(g.data, g.width, g.height, 8).count).toBe(1)
  })

  it('merges a U shape whose arms first get different labels', () => {
    const g = grid([
      '#...#',
      '#...#',
      '#####',
    ])
    const r = labelComponents(g.data, g.width, g.height, 4)
    expect(r.count).toBe(1)
    expect(r.sizes[1]).toBe(9)
  })

  it('drops regions smaller than minSize', () => {
    const g = grid([
      '#....',
      '...##',
      '...##',
    ])
    const r = labelComponents(g.data, g.width, g.height, 8, 2)
    expect(r.count).toBe(1)
    expect(r.labels[0]).toBe(0)
  })

  it('empty image has no regions', () => {
    const g = grid(['....', '....'])
    expect(labelComponents(g.data, g.width, g.height).count).toBe(0)
  })

  it('every pixel of a region has the same label', () => {
    const g = grid([
      '##..',
      '##..',
      '...#',
    ])
    const { labels } = labelComponents(g.data, g.width, g.height, 4)
    expect(labels[0]).toBe(labels[1])
    expect(labels[0]).toBe(labels[4])
    expect(labels[0]).toBe(labels[5])
    expect(labels[11]).not.toBe(labels[0])
  })
})

describe('colorizeLabels', () => {
  it('background is black, regions get different colours', () => {
    const out = colorizeLabels(new Int32Array([0, 1, 2]))
    expect([...out.slice(0, 3)]).toEqual([0, 0, 0])
    expect([...out.slice(3, 6)]).not.toEqual([...out.slice(6, 9)])
    expect([...out.slice(3, 6)]).not.toEqual([0, 0, 0])
  })
})
