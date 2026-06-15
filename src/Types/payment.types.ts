export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface Payment {
  id: string;
  orderId: string;
  beneficiaryId: string;
  beneficiaryType: 'pharmacy' | 'deliverer';
  beneficiaryName: string;
  beneficiaryEmail: string;
  amount: number;
  status: 'pending' | 'paid';
  paymentDate: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  paidAt?: FirestoreTimestamp;
}

export interface ProcessResult {
  processed: number;
  failed: number;
}
