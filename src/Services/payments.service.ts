import type { Payment, ProcessResult } from '../Types/payment.types';
import { adminFetch } from './api.service';

export async function getPayments(): Promise<Payment[]> {
  const response = await adminFetch('/admin/payments');
  return response.json() as Promise<Payment[]>;
}

export async function processPayment(id: string): Promise<void> {
  await adminFetch(`/admin/payments/${id}/process`, { method: 'POST' });
}

export async function processAllPayments(): Promise<ProcessResult> {
  const response = await adminFetch('/admin/payments/process', { method: 'POST' });
  return response.json() as Promise<ProcessResult>;
}
