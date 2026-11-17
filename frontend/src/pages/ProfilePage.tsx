import { useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Image,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { useMe } from '../api/me'
import { getMyProfile, getPosts, SAMPLE_IMAGES, savePosts } from '../api/social'
import type { Post } from '../api/social'

export default function ProfilePage() {
  const { data: me } = useMe()
  const navigate = useNavigate()

  const [profile] = useState(() => getMyProfile())
  const displayName = profile.displayName || me?.name || 'Korisnik'

  const [posts, setPosts] = useState<Post[]>(() => getPosts())

  const [newOpen, setNewOpen] = useState(false)
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_IMAGES[0].id)
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editDescription, setEditDescription] = useState('')

  const myPosts = posts.filter((p) => p.isOwn)

  function handleCreatePost() {
    const sample = SAMPLE_IMAGES.find((s) => s.id === selectedSampleId) ?? SAMPLE_IMAGES[0]
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorUsername: profile.username,
      authorName: displayName,
      imageUrl: sample.url,
      imageName: sample.name,
      description: description.trim() || 'Slika uređena u aplikaciji Pictora.',
      isPublic,
      isFavorite: false,
      isOwn: true,
    }
    const updated = [newPost, ...posts]
    setPosts(updated)
    savePosts(updated)

    setNewOpen(false)
    setDescription('')
    setIsPublic(true)
  }

  function handleToggleVisibility(postId: string, nextPublic: boolean) {
    const updated = posts.map((p) => (p.id === postId ? { ...p, isPublic: nextPublic } : p))
    setPosts(updated)
    savePosts(updated)
  }

  function handleDeletePost(postId: string) {
    const updated = posts.filter((p) => p.id !== postId)
    setPosts(updated)
    savePosts(updated)
  }

  function handleSaveEdit() {
    if (!editingPost) return
    const updated = posts.map((p) =>
      p.id === editingPost.id ? { ...p, description: editDescription } : p,
    )
    setPosts(updated)
    savePosts(updated)
    setEditingPost(null)
  }

  return (
    <Stack gap="lg" style={{ textAlign: 'left' }}>
      <Paper withBorder p="lg" radius="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="md">
            <Avatar color="grape" radius="xl" size={72}>
              {displayName.slice(0, 2).toUpperCase()}
            </Avatar>
            <Stack gap={4}>
              <Group gap="xs">
                <Title order={3}>{displayName}</Title>
                <Badge variant="light" color="grape">
                  @{profile.username}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {profile.bio}
              </Text>
              <Text size="xs" c="dimmed">
                Moje objave: {myPosts.length} (Javne: {myPosts.filter((p) => p.isPublic).length}, Privatne:{' '}
                {myPosts.filter((p) => !p.isPublic).length})
              </Text>
            </Stack>
          </Group>

          <Group>
            <Button variant="default" onClick={() => navigate('/settings')}>
              Uredi profil
            </Button>
            <Button color="grape" onClick={() => setNewOpen(true)}>
              + Nova objava
            </Button>
          </Group>
        </Group>
      </Paper>

      <Title order={4}>Moje objave</Title>

      {myPosts.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed">Još nemate objava. Kliknite na "+ Nova objava" za dodavanje prve slike.</Text>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {myPosts.map((post) => (
            <Card key={post.id} withBorder radius="md" padding="md">
              <Card.Section>
                <Image src={post.imageUrl} h={200} alt={post.imageName} fit="cover" />
              </Card.Section>

              <Stack gap="xs" mt="md">
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    {post.imageName}
                  </Text>
                  <Badge color={post.isPublic ? 'teal' : 'gray'} variant="light">
                    {post.isPublic ? 'Javno' : 'Privatno'}
                  </Badge>
                </Group>

                <Text size="sm">{post.description}</Text>

                <Group justify="space-between" mt="xs">
                  <Switch
                    size="xs"
                    color="teal"
                    label="Javna objava"
                    checked={post.isPublic}
                    onChange={(e) => handleToggleVisibility(post.id, e.currentTarget.checked)}
                  />

                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        setEditingPost(post)
                        setEditDescription(post.description)
                      }}
                    >
                      Uredi opis
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Obriši
                    </Button>
                  </Group>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal opened={newOpen} onClose={() => setNewOpen(false)} title="Nova objava na profilu">
        <Stack>
          <Select
            label="Odaberi sliku iz radne okoline"
            data={SAMPLE_IMAGES.map((img) => ({ value: img.id, label: img.name }))}
            value={selectedSampleId}
            onChange={(val) => {
              if (val) setSelectedSampleId(val)
            }}
          />

          <Textarea
            label="Tekstualni opis slike"
            placeholder="Opišite kako je slika nastala ili koji su filtri primijenjeni..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />

          <Switch
            label="Javna objava (vidljiva drugim prijavljenim korisnicima)"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.currentTarget.checked)}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setNewOpen(false)}>
              Odustani
            </Button>
            <Button color="grape" onClick={handleCreatePost}>
              Objavi
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={Boolean(editingPost)}
        onClose={() => setEditingPost(null)}
        title="Uredi opis objave"
      >
        <Stack>
          <Textarea
            label="Tekstualni opis"
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setEditingPost(null)}>
              Odustani
            </Button>
            <Button color="grape" onClick={handleSaveEdit}>
              Spremi
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}