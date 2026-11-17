import { useState } from 'react'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Image,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
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

export default function ExplorePage() {
  const [users, setUsers] = useState<UserProfile[]>(() => getOtherUsers())
  const [posts, setPosts] = useState<Post[]>(() => getPosts())
  const [search, setSearch] = useState('')
  const [viewedUser, setViewedUser] = useState<UserProfile | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const query = search.toLowerCase().trim()

  const visiblePosts = posts.filter(
    (p) =>
      p.isPublic &&
      (!query ||
        p.authorUsername.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.imageName.toLowerCase().includes(query)),
  )

  const visibleUsers = users.filter(
    (u) =>
      !query ||
      u.username.toLowerCase().includes(query) ||
      u.displayName.toLowerCase().includes(query) ||
      u.bio.toLowerCase().includes(query),
  )

  function handleToggleFavoritePost(postId: string) {
    const updated = posts.map((p) => (p.id === postId ? { ...p, isFavorite: !p.isFavorite } : p))
    setPosts(updated)
    savePosts(updated)
  }

  function handleToggleFavoriteUser(username: string) {
    const updated = users.map((u) =>
      u.username === username ? { ...u, isFavorite: !u.isFavorite } : u,
    )
    setUsers(updated)
    saveOtherUsers(updated)
    if (viewedUser && viewedUser.username === username) {
      setViewedUser({ ...viewedUser, isFavorite: !viewedUser.isFavorite })
    }
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

  function handleCopyToWorkspace(post: Post) {
    copyToWorkspaceList(post.imageName, post.imageUrl)
    setMessage(`Slika "${post.imageName}" kopirana je u vašu radnu okolinu!`)
  }

  return (
    <Stack gap="lg" style={{ textAlign: 'left' }}>
      <div>
        <Title order={2}>Istraži javne stranice i objave</Title>
        <Text size="sm" c="dimmed">
          Pregledajte javne profile drugih korisnika, spremite favorite ili preuzmite i kopirajte slike.
        </Text>
      </div>

      {message && (
        <Alert color="teal" withCloseButton onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      <TextInput
        placeholder="Pretraži po korisničkom imenu ili opisu slike..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <Title order={4}>Javni profili korisnika</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {visibleUsers.map((user) => (
          <Paper key={user.username} withBorder p="md" radius="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="sm">
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
                  </div>
                </Group>

                <Button
                  size="xs"
                  color="pink"
                  variant={user.isFavorite ? 'filled' : 'light'}
                  onClick={() => handleToggleFavoriteUser(user.username)}
                >
                  {user.isFavorite ? '★ U favoritima' : '☆ Favorit profil'}
                </Button>
              </Group>

              <Text size="sm" c="dimmed">
                {user.bio}
              </Text>

              <Button size="xs" variant="default" onClick={() => setViewedUser(user)}>
                Otvori javnu stranicu
              </Button>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>

      <Title order={4}>Javne objave</Title>
      {visiblePosts.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed">Nema pronađenih javnih objava.</Text>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {visiblePosts.map((post) => (
            <Card key={post.id} withBorder radius="md" padding="md">
              <Card.Section>
                <Image src={post.imageUrl} h={200} alt={post.imageName} fit="cover" />
              </Card.Section>

              <Stack gap="xs" mt="md">
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    @{post.authorUsername}
                  </Text>
                  <Badge variant="light" color="grape">
                    {post.imageName}
                  </Badge>
                </Group>

                <Text size="sm">{post.description}</Text>

                <Group justify="space-between" mt="xs">
                  <Button
                    size="xs"
                    color="pink"
                    variant={post.isFavorite ? 'filled' : 'light'}
                    onClick={() => handleToggleFavoritePost(post.id)}
                  >
                    {post.isFavorite ? '★ Favorit' : '☆ Favorit'}
                  </Button>

                  <Group gap="xs">
                    <Button size="xs" variant="default" onClick={() => handleDownload(post)}>
                      Preuzmi
                    </Button>
                    <Button size="xs" color="grape" onClick={() => handleCopyToWorkspace(post)}>
                      + U radnu okolinu
                    </Button>
                  </Group>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={Boolean(viewedUser)}
        onClose={() => setViewedUser(null)}
        title={viewedUser ? `Javna stranica: @${viewedUser.username}` : ''}
        size="lg"
      >
        {viewedUser && (
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={4}>{viewedUser.displayName}</Title>
                <Text size="sm" c="dimmed">
                  {viewedUser.bio}
                </Text>
              </div>
              <Button
                size="xs"
                color="pink"
                variant={viewedUser.isFavorite ? 'filled' : 'outline'}
                onClick={() => handleToggleFavoriteUser(viewedUser.username)}
              >
                {viewedUser.isFavorite ? '★ Profil u favoritima' : '☆ Dodaj profil u favorite'}
              </Button>
            </Group>

            <Title order={5}>Javne objave korisnika</Title>
            {posts
              .filter((p) => p.authorUsername === viewedUser.username && p.isPublic)
              .map((post) => (
                <Paper key={post.id} withBorder p="sm" radius="md">
                  <Group align="flex-start" wrap="nowrap">
                    <Image src={post.imageUrl} w={110} h={80} radius="sm" fit="cover" />
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Text fw={600} size="sm">
                        {post.imageName}
                      </Text>
                      <Text size="xs">{post.description}</Text>
                      <Group gap="xs" mt={4}>
                        <Button
                          size="compact-xs"
                          color="pink"
                          variant={post.isFavorite ? 'filled' : 'light'}
                          onClick={() => handleToggleFavoritePost(post.id)}
                        >
                          {post.isFavorite ? '★ Favorit' : '☆ Favorit'}
                        </Button>
                        <Button size="compact-xs" variant="default" onClick={() => handleDownload(post)}>
                          Preuzmi
                        </Button>
                        <Button
                          size="compact-xs"
                          color="grape"
                          onClick={() => handleCopyToWorkspace(post)}
                        >
                          Kopiraj u radnu okolinu
                        </Button>
                      </Group>
                    </Stack>
                  </Group>
                </Paper>
              ))}
          </Stack>
        )}
      </Modal>
    </Stack>
  )
}