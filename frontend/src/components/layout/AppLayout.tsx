import { AppShell, Center, Group, Loader, NavLink, Text, Title } from '@mantine/core'
import { Navigate, NavLink as RouterNavLink, Outlet } from 'react-router-dom'
import { useMe } from '../../api/me'

export default function AppLayout() {
  const { data: me, isLoading, isError } = useMe()

    if (isLoading) {
      return (
          <Center h="100vh">
          <Loader />
        </Center>
      )
    }

      if (isError) {
        return <Text p="md">Could not reach the server.</Text>
      }

      if (me === null) {
        return <Navigate to="/login" replace />
      }
  return (
    <AppShell header={{ height: 56 }} navbar={{ width: 220, breakpoint: 'sm' }} padding="md">
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Title order={3}>Pictora</Title>
          <Text>{me?.name}</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <NavLink component={RouterNavLink} to="/workspace" label="Workspace" />
        <NavLink component={RouterNavLink} to="/editor" label="Editor" />
        <NavLink component={RouterNavLink} to="/explore" label="Explore" />
        <NavLink component={RouterNavLink} to="/favorites" label="Favorites" />
        <NavLink component={RouterNavLink} to="/profile" label="My profile" />
        <NavLink component={RouterNavLink} to="/settings" label="Settings" />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}