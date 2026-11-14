import { AppShell, NavLink, Title } from "@mantine/core";
import { NavLink as RouterNavLink, Outlet } from "react-router-dom";

export default function AppLayout(){
    return (
    <AppShell header={{ height: 56 }} navbar={{ width: 220, breakpoint: 'sm' }} padding="md">
      <AppShell.Header p="md">
        <Title order={3}>Imagic</Title>
      </AppShell.Header>

    <AppShell.Navbar p="xs">
      <NavLink component={RouterNavLink} to="/workspace" label="Workspace" />
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