
import {
  Button,
  Center,
  Container,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core'

import { Navigate } from 'react-router-dom'
import { useMe } from '../api/me'
import { loginWithGoogle } from '../api/auth'

export default function LoginPage() {

  const { data: me, isLoading, isError } = useMe()

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  // Already logged in? Go to the workspace.
  if (me) {
    return <Navigate to="/workspace" replace />
  }

  return (
    <Center h="100vh" bg="gray.0">
      <Container size={420}>
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack>

            <Title order={2} ta="center">
              Welcome to Pictora
            </Title>

            <Text c="dimmed" ta="center" size="sm">
              Sign in to access your workspace and images.
            </Text>

            {isError && (
              <Text c="red" size="sm">
                Could not connect to the server.
              </Text>
            )}

            <Button
              fullWidth
              onClick={loginWithGoogle}
            >
              Sign in with Google
            </Button>

          </Stack>
        </Paper>
      </Container>
    </Center>
  )
}
