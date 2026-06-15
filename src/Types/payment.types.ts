export interface Payment {
  id: string;
  orderId: string;
  beneficiaryId: string;
  beneficiaryType: 'pharmacy' | 'deliverer';
  beneficiaryName: string;
  beneficiaryEmail: string;
  amount: number;
  status: 'pending' | 'paid';
  paymentDate: string;
  createdAt: string;
  paidAt?: string;
}

export interface ProcessResult {
  processed: number;
  failed: number;
}
