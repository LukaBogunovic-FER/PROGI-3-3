// Oznacavanje povezanih podrucja (connected component labelling).
// Ovo nije iz image-js nego vlastita implementacija, algoritam s dva prolaza.

// Union-find: pamti koje su privremene oznake zapravo isto podrucje.
class UnionFind {
  parent: number[] = []

  add(): number {
    this.parent.push(this.parent.length)
    return this.parent.length - 1
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      // skracivanje puta: svaki drugi cvor pokazuje na djeda
      this.parent[x] = this.parent[this.parent[x]]
      x = this.parent[x]
    }
    return x
  }

  union(a: number, b: number) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra !== rb) this.parent[Math.max(ra, rb)] = Math.min(ra, rb)
  }
}

export type Components = {
  // oznaka za svaki piksel: 0 = pozadina, 1..count = podrucje
  labels: Int32Array
  count: number
  // sizes[oznaka] = broj piksela u podrucju (sizes[0] se ne koristi)
  sizes: number[]
}

// foreground: jedna vrijednost po pikselu, sve != 0 je objekt
export function labelComponents(
  foreground: ArrayLike<number>,
  width: number,
  height: number,
  connectivity: 4 | 8 = 8,
  minSize = 1,
): Components {
  const provisional = new Int32Array(width * height)
  const uf = new UnionFind()
  uf.add() // oznaka 0 je pozadina

  // 1. prolaz: svaki piksel objekta dobije oznaku od vec obidenih susjeda
  // (lijevo i gore, za 8-povezanost jos gore-lijevo i gore-desno)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (!foreground[i]) continue

      const neighbours: number[] = []
      if (x > 0 && provisional[i - 1]) neighbours.push(provisional[i - 1])
      if (y > 0 && provisional[i - width]) neighbours.push(provisional[i - width])
      if (connectivity === 8 && y > 0) {
        if (x > 0 && provisional[i - width - 1]) neighbours.push(provisional[i - width - 1])
        if (x < width - 1 && provisional[i - width + 1]) neighbours.push(provisional[i - width + 1])
      }

      if (neighbours.length === 0) {
        provisional[i] = uf.add()
      } else {
        const smallest = Math.min(...neighbours)
        provisional[i] = smallest
        // svi susjedi pripadaju istom podrucju
        for (const n of neighbours) uf.union(smallest, n)
      }
    }
  }

  // 2. prolaz: zamijeni oznake predstavnikom skupa i prebroji velicine
  const rootSize = new Map<number, number>()
  for (let i = 0; i < provisional.length; i++) {
    if (!provisional[i]) continue
    const root = uf.find(provisional[i])
    provisional[i] = root
    rootSize.set(root, (rootSize.get(root) ?? 0) + 1)
  }

  // ponovno numeriraj 1..count, premala podrucja postaju pozadina
  const labels = new Int32Array(width * height)
  const newLabel = new Map<number, number>()
  const sizes = [0]
  for (let i = 0; i < provisional.length; i++) {
    const root = provisional[i]
    if (!root || rootSize.get(root)! < minSize) continue

    let label = newLabel.get(root)
    if (label === undefined) {
      label = sizes.length
      newLabel.set(root, label)
      sizes.push(0)
    }
    labels[i] = label
    sizes[label]++
  }

  return { labels, count: sizes.length - 1, sizes }
}

// boja za podrucje: nijanse se pomicu za "zlatni kut" pa su susjedne oznake jako razlicite
export function labelColor(label: number): [number, number, number] {
  const h = (label * 137.5) % 360
  const s = 0.7
  const l = 0.55
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let rgb: [number, number, number]
  if (h < 60) rgb = [c, x, 0]
  else if (h < 120) rgb = [x, c, 0]
  else if (h < 180) rgb = [0, c, x]
  else if (h < 240) rgb = [0, x, c]
  else if (h < 300) rgb = [x, 0, c]
  else rgb = [c, 0, x]
  return [Math.round((rgb[0] + m) * 255), Math.round((rgb[1] + m) * 255), Math.round((rgb[2] + m) * 255)]
}

// RGB podaci (3 bajta po pikselu): svako podrucje svoja boja, pozadina crna
export function colorizeLabels(labels: Int32Array): Uint8Array {
  const out = new Uint8Array(labels.length * 3)
  for (let i = 0; i < labels.length; i++) {
    if (!labels[i]) continue
    const [r, g, b] = labelColor(labels[i])
    out[i * 3] = r
    out[i * 3 + 1] = g
    out[i * 3 + 2] = b
  }
  return out
}
