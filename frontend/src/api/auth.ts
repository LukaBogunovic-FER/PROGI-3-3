
import { apiFetch } from './http'

export function loginWithGoogle() {
  window.location.href =
    'http://localhost:8080/oauth2/authorization/google'
}
/*
google callback obradjuje spring backend na portu 8080
a backend vraca korisnika na react aplikaciju na port 5173

*/

export async function logout() {
  const response = await apiFetch('/api/logout', {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Logout failed')
  }
}
