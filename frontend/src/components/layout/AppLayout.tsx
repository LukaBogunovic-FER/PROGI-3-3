


import {AppShell,Center,Group,Loader,NavLink,Text,Title,Button,} from '@mantine/core'

import {Navigate,NavLink as RouterNavLink,Outlet,useNavigate,} from 'react-router-dom'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { useMe } from '../../api/me'
import { logout } from '../../api/auth'

export default function AppLayout() {

  const { data: me, isLoading, isError } = useMe()

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [logoutError, setLogoutError] = useState(false)

  async function handleLogout() {

    setLogoutError(false)

    try {
      await logout()

      queryClient.clear()

      navigate('/login', { replace: true })

    } catch (error) {

      console.error('Logout failed:', error)
      setLogoutError(true)
    }
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  if (isError) {
    return (
      <Text p="md">
        Could not reach the server.
      </Text>
    )
  }

  if (!me) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 220, breakpoint: 'sm' }}
      padding="md"
    >

      <AppShell.Header p="md">
        <Group justify="space-between">

          <Title order={3}>
            Pictora
          </Title>

          <Group>
            <Text>{me.name}</Text>

            <Button
              variant="light"
              color="red"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Group>

        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">

        <NavLink
          component={RouterNavLink}
          to="/workspace"
          label="Workspace"
        />

        <NavLink
          component={RouterNavLink}
          to="/editor"
          label="Editor"
        />

        <NavLink
          component={RouterNavLink}
          to="/explore"
          label="Explore"
        />

        <NavLink
          component={RouterNavLink}
          to="/favorites"
          label="Favorites"
        />

        <NavLink
          component={RouterNavLink}
          to="/profile"
          label="My profile"
        />

        <NavLink
          component={RouterNavLink}
          to="/settings"
          label="Settings"
        />

      </AppShell.Navbar>

      <AppShell.Main>

        {logoutError && (
          <Text c="red" mb="md">
            Logout failed. Please try again.
          </Text>
        )}

        <Outlet />

      </AppShell.Main>

    </AppShell>
  )
}
