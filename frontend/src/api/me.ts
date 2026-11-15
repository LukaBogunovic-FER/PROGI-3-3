import { useQuery } from '@tanstack/react-query'

export type Me = { id: number; name: string; email: string }

async function fetchMe(): Promise<Me | null> {
  const res = await fetch('/api/me')
  if (res.status === 401) return null
  if (!res.ok) throw new Error('Failed to load user')
  return res.json()
}

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: fetchMe, retry: false })
}