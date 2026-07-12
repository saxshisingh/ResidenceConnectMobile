import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

export interface BillItem {
  id: string;
  billType: string;
  amount: number;
  notes?: string;
  billFilePath: string;
  status: 'PAID' | 'UNPAID';
  createdOn: string;
  paidOn?: string;
}

interface BillsResponse {
  status: boolean;
  message: string;
  data: BillItem[];
}

export interface DuesSummary {
  totalDueAmount: number;
  dueBillCount: number;
  paidBillCount: number;
  overdueBillCount: number;
}

interface DuesSummaryResponse {
  status?: boolean;
  message?: string;
  data?: unknown;
}

type AnyRecord = Record<string, any>;

const unwrapData = (json: unknown) => {
  if (json && typeof json === 'object' && 'data' in (json as AnyRecord)) {
    return (json as AnyRecord).data;
  }
  return json;
};

const readNumber = (source: AnyRecord, keys: string[]): number => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== '') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return 0;
};

const toDuesSummary = (payload: unknown): DuesSummary => {
  const raw = (unwrapData(payload) || {}) as AnyRecord;

  return {
    totalDueAmount: readNumber(raw, [
      'totalDueAmount',
      'totalDues',
      'totalDue',
      'dueAmount',
      'outstandingAmount',
      'pendingAmount',
      'amount',
    ]),
    dueBillCount: readNumber(raw, [
      'dueBillCount',
      'duesCount',
      'pendingBillCount',
      'pendingBillsCount',
      'unpaidBillCount',
      'totalBillsDue',
      'count',
    ]),
    paidBillCount: readNumber(raw, [
      'paidBillCount',
      'paidBillsCount',
      'settledBillCount',
    ]),
    overdueBillCount: readNumber(raw, [
      'overdueBillCount',
      'overdueBillsCount',
      'lateBillCount',
    ]),
  };
};

export const fetchBillsByResident = async (
  residentId: string
): Promise<BillItem[]> => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/bills/resident/${residentId}`,
    { method: 'GET' }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch bills');
  }

  const json: BillsResponse = await res.json();
  return json.data || [];
};

export const fetchDuesSummaryByResident = async (
  residentId: string,
): Promise<DuesSummary> => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/bills/resident/${residentId}/dues/summary`,
    { method: 'GET' },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch dues summary');
  }

  const json: DuesSummaryResponse = await res.json();
  return toDuesSummary(json);
};

export const getBillPdfUrl = (path: string) => {
  return `${API_BASE_URL}/${path}`;
};
