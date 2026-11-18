import { useState } from 'react'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core'
import {
  copyToWorkspaceList,
  getOtherUsers,
  getPosts,
  saveOtherUsers,
  savePosts,
} from '../api/social'
import type { Post, UserProfile } from '../api/social'

export default function FavoritesPage() {
  const [posts, setPosts] = useState<Post[]>(() => getPosts())
  const [users, setUsers] = useState<UserProfile[]>(() => getOtherUsers())
  const [message, setMessage] = useState<string | null>(null)

  const favoritePosts = posts.filter((p) => p.isFavorite && p.isPublic)
  const favoriteUsers = users.filter((u) => u.isFavorite)

  function removeFavoritePost(postId: string) {
    const updated = posts.map((p) => (p.id === postId ? { ...p, isFavorite: false } : p))
    setPosts(updated)
    savePosts(updated)
  }

  function removeFavoriteUser(username: string) {
    const updated = users.map((u) => (u.username === username ? { ...u, isFavorite: false } : u))
    setUsers(updated)
    saveOtherUsers(updated)
  }

  function handleDownload(post: Post) {
    const link = document.createElement('a')
    link.href = post.imageUrl
    link.download = post.imageName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setMessage(`Slika "${post.imageName}" preuzeta je lokalno na računalo.`)
  }

  function handleCopy(post: Post) {
    copyToWorkspaceList(post.imageName, post.imageUrl)
    setMessage(`Slika "${post.imageName}" kopirana je u vašu radnu okolinu!`)
  }

  return (
    <Stack gap="lg" style={{ textAlign: 'left' }}>
      <div>
        <Title order={2}>Favoriti</Title>
        <Text size="sm" c="dimmed">
          Vaše spremljene objave i javne stranice drugih korisnika.
        </Text>
      </div>

      {message && (
        <Alert color="teal" withCloseButton onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      <Tabs defaultValue="posts">
        <Tabs.List>
          <Tabs.Tab value="posts">Omiljene objave ({favoritePosts.length})</Tabs.Tab>
          <Tabs.Tab value="profiles">Omiljene javne stranice ({favoriteUsers.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="posts" pt="md">
          {favoritePosts.length === 0 ? (
            <Paper withBorder p="xl" radius="md">
              <Text c="dimmed">Nemate spremljenih objava u favoritima.</Text>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {favoritePosts.map((post) => (
                <Card key={post.id} withBorder radius="md" padding="md">
                  <Card.Section>
                    <Image src={post.imageUrl} h={200} alt={post.imageName} fit="cover" />
                  </Card.Section>

                  <Stack gap="xs" mt="md">
                    <Group justify="space-between">
                      <Text fw={600} size="sm">
                        @{post.authorUsername}
                      </Text>
                      <Badge variant="light">{post.imageName}</Badge>
                    </Group>
                    <Text size="sm">{post.description}</Text>

                    <Group justify="space-between" mt="xs">
                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={() => removeFavoritePost(post.id)}
                      >
                        Ukloni iz favorita
                      </Button>
                      <Group gap="xs">
                        <Button size="xs" variant="default" onClick={() => handleDownload(post)}>
                          Preuzmi
                        </Button>
                        <Button size="xs" color="grape" onClick={() => handleCopy(post)}>
                          + U radnu okolinu
                        </Button>
                      </Group>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="profiles" pt="md">
          {favoriteUsers.length === 0 ? (
            <Paper withBorder p="xl" radius="md">
              <Text c="dimmed">Nemate spremljenih javnih stranica u favoritima.</Text>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {favoriteUsers.map((user) => (
                <Paper key={user.username} withBorder p="md" radius="md">
                  <Group justify="space-between" align="flex-start">
                    <Group>
                      <Avatar color="grape" radius="xl">
                        {user.displayName.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <div>
                        <Text fw={600} size="sm">
                          {user.displayName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          @{user.username}
                        </Text>
                        <Text size="sm" mt={4}>
                          {user.bio}
                        </Text>
                      </div>
                    </Group>
                    <Button
                      size="xs"
                      color="red"
                      variant="subtle"
                      onClick={() => removeFavoriteUser(user.username)}
                    >
                      Ukloni
                    </Button>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}