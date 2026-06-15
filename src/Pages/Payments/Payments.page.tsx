import { useCallback, useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Menu,
  Modal,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconDotsVertical,
  IconRefresh,
  IconSend,
  IconTrash,
} from '@tabler/icons-react';
import type { Payment } from '../../Types/payment.types';
import {
  deletePayment,
  getPayments,
  markPaymentAsPaid,
  processAllPayments,
  processPayment,
} from '../../Services/payments.service';

function formatDate(value: { _seconds: number } | undefined): string {
  if (!value) return '—';
  const date = new Date(value._seconds * 1000);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

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
        title: 'Paiement réglé',
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
        message: `${result.processed} réglé(s), ${result.failed} échoué(s).`,
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

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePayment(deleteTarget);
      setPayments((prev) => prev.filter((p) => p.id !== deleteTarget));
      setDeleteTarget(null);
      notifications.show({
        title: 'Paiement supprimé',
        message: 'Le paiement a été supprimé.',
        color: 'accentGreen',
        icon: <IconCheck size={16} />,
      });
    } catch (err) {
      notifications.show({
        title: 'Erreur',
        message: (err as Error).message,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setDeleting(false);
    }
  }

  async function handleMarkAsPaid(id: string) {
    setMarkingPaidId(id);
    try {
      await markPaymentAsPaid(id);
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: 'paid', paidAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 } }
            : p
        )
      );
      notifications.show({
        title: 'Paiement marqué comme payé',
        message: 'Le statut a été mis à jour.',
        color: 'accentGreen',
        icon: <IconCheck size={16} />,
      });
    } catch (err) {
      notifications.show({
        title: 'Erreur',
        message: (err as Error).message,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setMarkingPaidId(null);
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
            Régler toutes les commandes en attente
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
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {payments.map((payment) => (
                <Table.Tr key={payment.id}>
                  <Table.Td>{formatDate(payment.createdAt)}</Table.Td>
                  <Table.Td>{payment.orderId}</Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm" fw={500}>{payment.beneficiaryName}</Text>
                      <Group gap="xs">
                        <Badge
                          variant="light"
                          color={payment.beneficiaryType === 'pharmacy' ? 'myColor' : 'blue'}
                          size="xs"
                        >
                          {payment.beneficiaryType === 'pharmacy' ? 'Pharmacie' : 'Livreur'}
                        </Badge>
                        <Text size="xs" c="dimmed">{payment.beneficiaryEmail}</Text>
                      </Group>
                    </Stack>
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
                        Régler
                      </Button>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Menu shadow="md" position="bottom-end" withinPortal>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconCheck size={14} />}
                          disabled={payment.status === 'paid' || markingPaidId === payment.id}
                          onClick={() => { void handleMarkAsPaid(payment.id); }}
                        >
                          Marquer comme payé
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => setDeleteTarget(payment.id)}
                        >
                          Supprimer
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Modal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le paiement"
        centered
        size="sm"
      >
        <Text mb="lg">Cette action est irréversible. Confirmer la suppression ?</Text>
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={() => setDeleteTarget(null)}>
            Annuler
          </Button>
          <Button color="red" loading={deleting} onClick={() => { void handleDeleteConfirm(); }}>
            Supprimer
          </Button>
        </Group>
      </Modal>
    </>
  );
}
