// Pohrana drustvenog dijela (profil, objave, favoriti) u localStorage preglednika
// dok se u 2. ciklusu ne dodaju tablice posts i favorites na backendu.

export type Post = {
  id: string
  authorUsername: string
  authorName: string
  imageUrl: string
  imageName: string
  description: string
  isPublic: boolean
  isFavorite: boolean
  isOwn: boolean
}

export type UserProfile = {
  username: string
  displayName: string
  bio: string
  isFavorite: boolean
  isOwn: boolean
}

const MY_PROFILE_KEY = 'pictora_my_profile_v1'
const OTHER_USERS_KEY = 'pictora_other_users_v1'
const POSTS_KEY = 'pictora_posts_v1'
const COPIED_KEY = 'pictora_copied_images_v1'

const FALLBACK_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

// Pomocna funkcija koja na canvasu crta pravu rastersku PNG sliku za pocetne primjere
function makeSamplePng(bg1: string, bg2: string, accent: string, variant: number): string {
  if (typeof document === 'undefined') return FALLBACK_PNG
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 280
  const ctx = canvas.getContext('2d')
  if (!ctx) return FALLBACK_PNG

  const grad = ctx.createLinearGradient(0, 0, 480, 280)
  grad.addColorStop(0, bg1)
  grad.addColorStop(1, bg2)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 480, 280)

  ctx.fillStyle = accent
  if (variant === 1) {
    ctx.beginPath()
    ctx.arc(370, 75, 36, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.moveTo(0, 280)
    ctx.lineTo(140, 170)
    ctx.lineTo(290, 240)
    ctx.lineTo(400, 150)
    ctx.lineTo(480, 220)
    ctx.lineTo(480, 280)
    ctx.closePath()
    ctx.fill()
  } else if (variant === 2) {
    ctx.strokeStyle = accent
    ctx.lineWidth = 6
    ctx.strokeRect(60, 50, 150, 150)
    ctx.beginPath()
    ctx.arc(330, 140, 75, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(40, 280)
    ctx.lineTo(190, 95)
    ctx.lineTo(340, 280)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#27272a'
    ctx.beginPath()
    ctx.moveTo(200, 280)
    ctx.lineTo(355, 80)
    ctx.lineTo(465, 280)
    ctx.closePath()
    ctx.fill()
  }

  return canvas.toDataURL('image/png')
}

export const SAMPLE_IMAGES = [
  {
    id: 'sample-1',
    name: 'zvjezdana_noc_blur.png',
    url: makeSamplePng('#1e3a8a', '#7c3aed', '#fde047', 1),
  },
  {
    id: 'sample-2',
    name: 'geometrija_sobel.png',
    url: makeSamplePng('#18181b', '#27272a', '#22d3ee', 2),
  },
  {
    id: 'sample-3',
    name: 'planine_grayscale.png',
    url: makeSamplePng('#d4d4d8', '#a1a1aa', '#52525b', 3),
  },
]

const DEFAULT_MY_PROFILE: UserProfile = {
  username: 'moj_profil',
  displayName: '',
  bio: 'Korisnik platforme Pictora. Ovdje objavljujem slike obrađene u radnoj okolini.',
  isFavorite: false,
  isOwn: true,
}

const DEFAULT_OTHER_USERS: UserProfile[] = [
  {
    username: 'ana_art',
    displayName: 'Ana Kovačić',
    bio: 'Volim crno-bijelu fotografiju, Sobel detekciju rubova i morfološke operatore.',
    isFavorite: true,
    isOwn: false,
  },
  {
    username: 'marko_foto',
    displayName: 'Marko Horvat',
    bio: 'Eksperimentiram s pikselizacijom, Gaussovim zamućenjem i rotacijama slika.',
    isFavorite: false,
    isOwn: false,
  },
]

const DEFAULT_POSTS: Post[] = [
  {
    id: 'post-1',
    authorUsername: 'moj_profil',
    authorName: 'Moj Profil',
    imageUrl: SAMPLE_IMAGES[0].url,
    imageName: SAMPLE_IMAGES[0].name,
    description: 'Početna slika obrađena Gaussovim zamućenjem (sigma 2) i automatskim kontrastom.',
    isPublic: true,
    isFavorite: false,
    isOwn: true,
  },
  {
    id: 'post-2',
    authorUsername: 'ana_art',
    authorName: 'Ana Kovačić',
    imageUrl: SAMPLE_IMAGES[1].url,
    imageName: SAMPLE_IMAGES[1].name,
    description: 'Primijenjen filtar detekcije rubova (Sobel) na geometrijske oblike.',
    isPublic: true,
    isFavorite: true,
    isOwn: false,
  },
  {
    id: 'post-3',
    authorUsername: 'marko_foto',
    authorName: 'Marko Horvat',
    imageUrl: SAMPLE_IMAGES[2].url,
    imageName: SAMPLE_IMAGES[2].name,
    description: 'Pretvorba u sive tonove (Luma BT.709) uz uklanjanje šuma medijan filtrom.',
    isPublic: true,
    isFavorite: false,
    isOwn: false,
  },
]

export function getMyProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(MY_PROFILE_KEY)
    return raw ? (JSON.parse(raw) as UserProfile) : DEFAULT_MY_PROFILE
  } catch {
    return DEFAULT_MY_PROFILE
  }
}

export function saveMyProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(MY_PROFILE_KEY, JSON.stringify(profile))
  } catch {
    // Ako je localStorage pun, zadrzi promjenu u memoriji bez rusenja aplikacije
  }
}

export function getOtherUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(OTHER_USERS_KEY)
    return raw ? (JSON.parse(raw) as UserProfile[]) : DEFAULT_OTHER_USERS
  } catch {
    return DEFAULT_OTHER_USERS
  }
}

export function saveOtherUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(OTHER_USERS_KEY, JSON.stringify(users))
  } catch {
    // Ignoriraj gresku kvote
  }
}

export function getPosts(): Post[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY)
    return raw ? (JSON.parse(raw) as Post[]) : DEFAULT_POSTS
  } catch {
    return DEFAULT_POSTS
  }
}

export function savePosts(posts: Post[]): void {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
  } catch {
    // Ako je ucitana slika prevelika za localStorage, ostaje aktivna u trenutnoj sesiji
  }
}

export function copyToWorkspaceList(imageName: string, imageUrl: string): void {
  try {
    const raw = localStorage.getItem(COPIED_KEY)
    const list = raw ? (JSON.parse(raw) as { name: string; url: string }[]) : []
    list.push({ name: `kopija_${imageName}`, url: imageUrl })
    localStorage.setItem(COPIED_KEY, JSON.stringify(list))
  } catch {
    // Ignoriraj ako je storage pun
  }
}