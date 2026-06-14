import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconRefresh,
  IconSend,
} from '@tabler/icons-react';
import type { Payment } from '../../Types/payment.types';
import { getPayments, processAllPayments, processPayment } from '../../Services/payments.service';

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAll, setProcessingAll] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  async function handleProcessOne(id: string) {
    setProcessingId(id);
    try {
      await processPayment(id);
      notifications.show({
        title: 'Paiement traité',
        message: 'Le virement a été effectué avec succès.',
        color: 'accentGreen',
        icon: <IconCheck size={16} />,
      });
      await fetchPayments();
    } catch (err) {
      notifications.show({
        title: 'Erreur',
        message: (err as Error).message,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleProcessAll() {
    setProcessingAll(true);
    try {
      const result = await processAllPayments();
      notifications.show({
        title: 'Traitement terminé',
        message: `${result.processed} traité(s), ${result.failed} échoué(s).`,
        color: result.failed > 0 ? 'yellow' : 'accentGreen',
        icon: <IconCheck size={16} />,
      });
      await fetchPayments();
    } catch (err) {
      notifications.show({
        title: 'Erreur',
        message: (err as Error).message,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setProcessingAll(false);
    }
  }

  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  return (
    <>
      <Group justify="space-between" mb="md" align="center">
        <Group gap="sm" align="center">
          <Title order={2}>Paiements</Title>
          {pendingCount > 0 && (
            <Badge color="myColor" size="lg" circle>
              {pendingCount}
            </Badge>
          )}
        </Group>
        <Group gap="sm">
          <Button
            variant="light"
            color="myColor"
            leftSection={<IconRefresh size={16} />}
            onClick={() => { void fetchPayments(); }}
            loading={loading}
          >
            Actualiser
          </Button>
          <Button
            color="myColor"
            leftSection={<IconSend size={16} />}
            onClick={() => { void handleProcessAll(); }}
            loading={processingAll}
            disabled={pendingCount === 0}
          >
            Traiter tous les pending
          </Button>
        </Group>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card withBorder shadow="sm" radius="md" p={0}>
        {loading ? (
          <Group justify="center" p="xl">
            <Loader color="myColor" />
          </Group>
        ) : payments.length === 0 ? (
          <Text ta="center" c="dimmed" p="xl">
            Aucun paiement trouvé.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Commande</Table.Th>
                <Table.Th>Bénéficiaire</Table.Th>
                <Table.Th>Montant</Table.Th>
                <Table.Th>Virement prévu</Table.Th>
                <Table.Th>Payé le</Table.Th>
                <Table.Th>Statut</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {payments.map((payment) => (
                <Table.Tr key={payment.id}>
                  <Table.Td>{formatDate(payment.createdAt)}</Table.Td>
                  <Table.Td>{payment.orderId}</Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={payment.beneficiaryType === 'pharmacy' ? 'myColor' : 'blue'}
                      size="sm"
                    >
                      {payment.beneficiaryType === 'pharmacy' ? 'Pharmacie' : 'Livreur'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatAmount(payment.amount)}</Table.Td>
                  <Table.Td>{formatDate(payment.paymentDate)}</Table.Td>
                  <Table.Td>{formatDate(payment.paidAt)}</Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={payment.status === 'paid' ? 'accentGreen' : 'yellow'}
                      size="sm"
                    >
                      {payment.status === 'paid' ? 'Payé' : 'En attente'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {payment.status === 'pending' && (
                      <Button
                        size="xs"
                        color="myColor"
                        variant="light"
                        loading={processingId === payment.id}
                        onClick={() => { void handleProcessOne(payment.id); }}
                      >
                        Traiter
                      </Button>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
