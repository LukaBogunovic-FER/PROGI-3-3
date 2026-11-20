
function getCookie(name: string): string | null {
  const prefix = `${name}=`

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(prefix))

  if (!cookie) {
    return null
  }

  return decodeURIComponent(cookie.substring(prefix.length))
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {

  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)

  const safeMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE']

  if (!safeMethods.includes(method)) {

    // spring security -> CSRF
    await fetch('/api/csrf', {
      credentials: 'include',
    })

    const csrfToken = getCookie('XSRF-TOKEN')

    if (!csrfToken) {
      throw new Error('CSRF token not found')
    }

    headers.set('X-XSRF-TOKEN', csrfToken)
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  })
}
