import { Button, Center, Paper, Stack, Text, Title } from '@mantine/core'

export default function LoginPage() {
  return (
    <Center h="100vh">
      <Paper withBorder shadow="md" p="xl" radius="md">
        <Stack align="center">
          <Title order={2}>Imagic</Title>
          <Text c="dimmed">Sign in to continue</Text>
          <Button component="a" href="/oauth2/authorization/google">
            Sign in with Google
          </Button>
        </Stack>
      </Paper>
    </Center>
  )
}