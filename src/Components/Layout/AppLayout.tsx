import { AppShell, Button, Group, Text } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';

export function AppLayout() {
  const { signOut } = useAuth();

  return (
    <AppShell header={{ height: 60 }} padding="md">
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

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
