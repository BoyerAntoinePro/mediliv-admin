import { AppShell, Button, Group, NavLink, Text } from '@mantine/core';
import { IconCreditCard, IconLogout } from '@tabler/icons-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';

export function AppLayout() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 220, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Text fw={700} size="lg" c="myColor">
            MédiLiv Admin
          </Text>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconLogout size={16} />}
            onClick={() => { void signOut(); }}
          >
            Déconnexion
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <NavLink
          component={Link}
          to="/payments"
          label="Paiements"
          leftSection={<IconCreditCard size={16} />}
          active={location.pathname === '/payments'}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
