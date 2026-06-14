import { useState } from 'react';
import {
  Alert,
  Anchor,
  Button,
  Card,
  Container,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconLock, IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../Hooks/useAuth';

export function LoginPage() {
  const { signInWithEmail, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    let valid = true;
    if (!email.trim()) {
      setEmailError('L\'email est requis.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Email invalide.');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError('Le mot de passe est requis.');
      valid = false;
    } else {
      setPasswordError('');
    }
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } finally {
      setSubmitting(false);
    }
  }

  const loading = isLoading || submitting;

  return (
    <Container size={420} mt={40}>
      <Title ta="center" fw={700} c="myColor">
        MédiLiv
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={4} mb="xl">
        Espace administrateur
      </Text>

      <Card withBorder shadow="sm" radius="md" p={30}>
        <Title order={2} mb="md">
          Connexion
        </Title>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb="md"
            withCloseButton
            onClose={clearError}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
          <TextInput
            label="Email"
            placeholder="votre@email.com"
            leftSection={<IconMail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            error={emailError}
            mb="sm"
            required
          />

          <PasswordInput
            label="Mot de passe"
            placeholder="••••••••"
            leftSection={<IconLock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            error={passwordError}
            mb="md"
            required
          />

          <Anchor component={Link} to="/forgot-password" size="sm" c="myColor" display="block" mb="md">
            Mot de passe oublié ?
          </Anchor>

          <Button type="submit" fullWidth color="myColor" loading={loading}>
            Se connecter
          </Button>
        </form>
      </Card>
    </Container>
  );
}
