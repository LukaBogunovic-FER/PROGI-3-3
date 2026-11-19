import { useState } from 'react'
import { Alert, Button, Group, Paper, Stack, Text, Textarea, TextInput, Title } from '@mantine/core'
import { useMe } from '../api/me'
import { getMyProfile, getPosts, saveMyProfile, savePosts } from '../api/social'

export default function SettingsPage() {
  const { data: me } = useMe()
  const [initial] = useState(() => getMyProfile())

  const [username, setUsername] = useState(initial.username)
  const [displayName, setDisplayName] = useState(initial.displayName || me?.name || '')
  const [bio, setBio] = useState(initial.bio)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    const cleanUsername = username.trim() || 'moj_profil'
    const cleanName = displayName.trim() || me?.name || 'Korisnik'

    saveMyProfile({
      username: cleanUsername,
      displayName: cleanName,
      bio,
      isFavorite: false,
      isOwn: true,
    })

    const updatedPosts = getPosts().map((p) =>
      p.isOwn ? { ...p, authorUsername: cleanUsername, authorName: cleanName } : p,
    )
    savePosts(updatedPosts)
    setSaved(true)
  }

  return (
    <Stack gap="md" maw={560} style={{ textAlign: 'left' }}>
      <div>
        <Title order={2}>Postavke javnog profila</Title>
        <Text size="sm" c="dimmed">
          Uredite podatke koji se prikazuju drugim prijavljenim korisnicima na vašoj javnoj stranici.
        </Text>
      </div>

      {saved && (
        <Alert color="teal" withCloseButton onClose={() => setSaved(false)}>
          Podaci javnog profila uspješno su spremljeni!
        </Alert>
      )}

      <Paper withBorder p="lg" radius="md">
        <Stack gap="md">
          {me?.email && (
            <Text size="sm" c="dimmed">
              Prijavljeni račun (OAuth 2.0): <strong>{me.email}</strong>
            </Text>
          )}

          <TextInput
            label="Korisničko ime (username)"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />

          <TextInput
            label="Prikazano ime"
            value={displayName}
            onChange={(e) => setDisplayName(e.currentTarget.value)}
          />

          <Textarea
            label="Kratki opis korisnika (biografija)"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.currentTarget.value)}
          />

          <Group justify="flex-end">
            <Button color="grape" onClick={handleSave}>
              Spremi postavke
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  )
}