import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

export type MaintenanceStatus = 'Pending' | 'In Progress' | 'Completed';
export type UrgencyLevel = 'Low' | 'Medium' | 'High';

export type ServiceKey =
  | 'electrician'
  | 'housekeeping'
  | 'support'
  | 'plumber'
  | 'air'
  | 'boiler'
  | 'multi';

export interface TechnicianInfo {
  id: string;
  residenceId?: string;
  name: string;
  role: string;
  phone: string;
  profilePhoto?: string;
  email?: string;
  gender?: string;
  skillLevel?: string;
  availabilityStatus?: string;
  experience: string;
  skills: string[];
  address: string;
  schedule: string;
  serviceCategoryId?: string;
  govtIdProof?: string;
}

export interface MaintenanceCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface MaintenanceRequestItem {
  id: string;
  requestCode?: string;
  categoryId?: string;
  serviceKey: ServiceKey;
  serviceLabel: string;
  description: string;
  preferredDateTime: string;
  apartmentDetails: string;
  contactNumber: string;
  urgencyLevel: UrgencyLevel;
  status: MaintenanceStatus;
  requestedOn: string;
  residentId?: string;
  residentName?: string;
  notes?: string;
  serviceCategoryId?: string;
  technicianId?: string;
  technician?: TechnicianInfo;
}

export interface CreateMaintenancePayload {
  category: string;
  issueSummary: string;
  residentId: string;
  unitNo: string;
  contact: string;
  notes: string;
  createdBy: string;
}

type AnyRecord = Record<string, any>;
type TranslationFn = (key: string, fallback?: string) => string;
type LanguageCode = 'en' | 'fr' | 'ar';

const normalizeServiceName = (value?: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const unwrapData = (json: any) => {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
};

const resolveMaintenanceId = (raw: AnyRecord): string => {
  const directCandidates = [
    raw.maintenanceRequestId,
    raw.maintenanceRequestID,
    raw.maintenanceId,
    raw.requestId,
    raw.ticketId,
    raw.id,
  ];

  for (const candidate of directCandidates) {
    if (candidate !== undefined && candidate !== null && String(candidate).trim()) {
      return String(candidate).trim();
    }
  }

  const key = Object.keys(raw).find(k =>
    /(maintenance.*id|request.*id|ticket.*id|^id$)/i.test(k),
  );
  const fallback = key ? raw[key] : '';
  return fallback ? String(fallback).trim() : '';
};

const toServiceKey = (value?: string): ServiceKey => {
  const v = normalizeServiceName(value);
  if (v.includes('electric')) return 'electrician';
  if (v.includes('house')) return 'housekeeping';
  if (v.includes('support') || v.includes('general')) return 'support';
  if (v.includes('plumb')) return 'plumber';
  if (v.includes('air')) return 'air';
  if (v.includes('boiler') || v.includes('heat')) return 'boiler';
  if (v.includes('multi')) return 'multi';
  return 'support';
};

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

export const getMaintenanceServiceLabel = (
  language: LanguageCode,
  t: TranslationFn,
  serviceKey: ServiceKey,
  fallback?: string,
) => {
  const fallbackLabel = String(fallback || '').trim();
  const normalizedFallback = normalizeServiceName(fallbackLabel);
  const fallbackLooksCustom =
    Boolean(fallbackLabel) &&
    !(
      normalizedFallback.includes('support') ||
      normalizedFallback.includes('general support') ||
      normalizedFallback.includes('electric') ||
      normalizedFallback.includes('house') ||
      normalizedFallback.includes('plumb') ||
      normalizedFallback.includes('air') ||
      normalizedFallback.includes('boiler') ||
      normalizedFallback.includes('heat') ||
      normalizedFallback.includes('multi')
    );

  if (language === 'ar') {
    const arLabels: Record<ServiceKey, string> = {
      electrician: 'فني كهرباء',
      housekeeping: 'النظافة',
      support: 'دعم عام',
      plumber: 'سباك',
      air: 'تكييف',
      boiler: 'غلاية / تدفئة',
      multi: 'فني متعدد المهارات',
    };
    if (fallbackLooksCustom) {
      return fallbackLabel;
    }
    return arLabels[serviceKey] || fallbackLabel || arLabels.support;
  }

  const labels: Record<ServiceKey, string> = {
    electrician: t('maintenance.mobile.labels.services.electrician', 'Electrician'),
    housekeeping: t('maintenance.mobile.labels.services.housekeeping', 'Housekeeping'),
    support: t('maintenance.mobile.labels.services.support', 'General Support'),
    plumber: t('maintenance.mobile.labels.services.plumber', 'Plumber'),
    air: t('maintenance.mobile.labels.services.air', 'Air Conditioning'),
    boiler: t('maintenance.mobile.labels.services.boiler', 'Boiler / Heating'),
    multi: t('maintenance.mobile.labels.services.multi', 'Multi-Skill Technician'),
  };

  if (fallbackLooksCustom) {
    return fallbackLabel;
  }

  return labels[serviceKey] || fallbackLabel || labels.support;
};

export const getMaintenanceStatusLabel = (
  language: LanguageCode,
  t: TranslationFn,
  status?: MaintenanceStatus | string,
) => {
  const normalized = String(status || '').trim().toLowerCase();
  const isCompleted =
    normalized === '3' ||
    normalized === 'completed' ||
    normalized.includes('complete') ||
    normalized.includes('close') ||
    normalized.includes('resolve');
  const isInProgress =
    normalized === '2' ||
    normalized === 'in progress' ||
    normalized.includes('progress') ||
    normalized.includes('assign') ||
    normalized.includes('accepted') ||
    normalized.includes('working') ||
    normalized.includes('started');

  if (language === 'ar') {
    if (isCompleted) return 'مكتمل';
    if (isInProgress) return 'قيد التنفيذ';
    return 'قيد الانتظار';
  }

  if (language === 'fr') {
    if (isCompleted) return 'Termine';
    if (isInProgress) return 'En cours';
    return 'En attente';
  }

  if (isCompleted) {
    return t('maintenance.mobile.labels.status.completed', 'Completed');
  }

  if (isInProgress) {
    return t('maintenance.mobile.labels.status.inProgress', 'In Progress');
  }

  return t('maintenance.mobile.labels.status.pending', 'Pending');
};

export const getMaintenanceUrgencyLabel = (
  language: LanguageCode,
  t: TranslationFn,
  urgency?: UrgencyLevel | string,
) => {
  const normalized = String(urgency || '').trim().toLowerCase();

  if (language === 'ar') {
    if (normalized === 'high') return 'مرتفع';
    if (normalized === 'medium') return 'متوسط';
    return 'منخفض';
  }

  if (normalized === 'high') {
    return t('maintenance.mobile.labels.urgency.high', 'High');
  }

  if (normalized === 'medium') {
    return t('maintenance.mobile.labels.urgency.medium', 'Medium');
  }

  return t('maintenance.mobile.labels.urgency.low', 'Low');
};

export const formatMaintenanceDate = (
  value: string | undefined,
  language: 'en' | 'fr' | 'ar',
) => {
  if (!value || value === '-') {
    return '-';
  }

  const parsed = new Date(value);
  if (!isValidDate(parsed)) {
    return value;
  }

  const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-SA' : 'en-US';
  return parsed.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const toStatus = (status: any): MaintenanceStatus => {
  if (typeof status === 'string') {
    const v = status.toLowerCase();
    if (v.trim() === '1') return 'Pending';
    if (v.trim() === '2') return 'In Progress';
    if (v.trim() === '3') return 'Completed';
    if (
      v.includes('progress') ||
      v.includes('assign') ||
      v.includes('accepted') ||
      v.includes('working') ||
      v.includes('started')
    ) {
      return 'In Progress';
    }
    if (v.includes('complete') || v.includes('close') || v.includes('resolve')) {
      return 'Completed';
    }
    return 'Pending';
  }
  if (typeof status === 'number') {
    if (status === 1) return 'Pending';
    if (status === 2) return 'In Progress';
    if (status === 3) return 'Completed';
    return 'Pending';
  }
  return 'Pending';
};

const toUrgency = (urgency: any): UrgencyLevel => {
  const v = String(urgency || '').toLowerCase();
  if (v === 'high') return 'High';
  if (v === 'medium') return 'Medium';
  return 'Low';
};

const toAbsoluteFileUrl = (value: string) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `${API_BASE_URL}/${normalized.replace(/^\/+/, '')}`;
};

const toTechnician = (raw?: AnyRecord | null): TechnicianInfo | undefined => {
  if (!raw) return undefined;
  const firstName = String(raw.firstName || '').trim();
  const lastName = String(raw.lastName || '').trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const experienceYears = raw.experienceYears ?? raw.experience;
  const normalizedExperience =
    experienceYears !== undefined && experienceYears !== null && String(experienceYears).trim() !== ''
      ? `${experienceYears} ${Number(experienceYears) === 1 ? 'year' : 'years'}`
      : '-';

  return {
    id: String(raw.technicianId || raw.id || ''),
    residenceId: raw.residenceId ? String(raw.residenceId) : undefined,
    name: fullName || raw.fullName || raw.name || 'Technician',
    role: raw.serviceCategory || raw.serviceCategoryName || raw.role || 'Technician',
    phone: raw.mobileNumber || raw.phone || raw.contactNumber || '-',
    profilePhoto: toAbsoluteFileUrl(raw.profilePhoto || raw.photo || ''),
    email: raw.email || '',
    gender: raw.gender || '',
    skillLevel: raw.skillLevel || '',
    availabilityStatus: raw.availabilityStatus || '',
    experience: normalizedExperience,
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    address: raw.address || '-',
    schedule: raw.workingHours || raw.schedule || '-',
    serviceCategoryId: raw.serviceCategoryId ? String(raw.serviceCategoryId) : undefined,
    govtIdProof: raw.govtIdProof ? String(raw.govtIdProof) : undefined,
  };
};

const toMaintenanceItem = (raw: AnyRecord): MaintenanceRequestItem => {
  const serviceLabel =
    raw.categoryName ||
    raw.serviceCategoryName ||
    raw.serviceType ||
    raw.serviceLabel ||
    'General Agent Support';

  const technicianRaw =
    raw.technician ||
    raw.assignedTechnician ||
    raw.technicianDetails ||
    null;
  const technician = toTechnician(technicianRaw);

  const createdAt = raw.createdAt || raw.requestedOn || raw.requestDate || raw.createdOn;

  return {
    id: resolveMaintenanceId(raw),
    requestCode: raw.requestCode ? String(raw.requestCode) : undefined,
    categoryId: raw.category ? String(raw.category) : undefined,
    serviceKey: toServiceKey(serviceLabel),
    serviceLabel,
    description:
      raw.issueSummary ||
      raw.issueDescription ||
      raw.description ||
      raw.notes ||
      raw.title ||
      '-',
    preferredDateTime:
      raw.preferredDateTime ||
      raw.scheduledDateTime ||
      raw.preferredSchedule ||
      '-',
    apartmentDetails:
      raw.apartmentDetails ||
      raw.unitNo ||
      raw.apartmentUnit ||
      raw.location ||
      '-',
    contactNumber: raw.contact || raw.contactNumber || raw.phone || raw.mobile || '-',
    urgencyLevel: toUrgency(raw.urgencyLevel),
    status:
      technician && toStatus(raw.status || raw.statusName || raw.requestStatus) === 'Pending'
        ? 'In Progress'
        : toStatus(raw.status || raw.statusName || raw.requestStatus),
    requestedOn: createdAt ? String(createdAt) : '-',
    residentId: raw.residentId ? String(raw.residentId) : undefined,
    residentName: raw.residentName ? String(raw.residentName) : undefined,
    notes: raw.notes ? String(raw.notes) : '',
    serviceCategoryId: raw.serviceCategoryId ? String(raw.serviceCategoryId) : undefined,
    technicianId: raw.technicianId
      ? String(raw.technicianId)
      : technicianRaw?.technicianId || technicianRaw?.id
        ? String(technicianRaw?.technicianId || technicianRaw?.id)
        : undefined,
    technician,
  };
};

export const createMaintenanceRequestApi = async (
  payload: CreateMaintenancePayload,
): Promise<string> => {
  const body: AnyRecord = {
    category: payload.category,
    issueSummary: payload.issueSummary,
    residentId: payload.residentId,
    unitNo: payload.unitNo,
    contact: payload.contact,
    notes: payload.notes,
    createdBy: payload.createdBy,
  };

  console.log("body",body)

  Object.keys(body).forEach(k => {
    if (body[k] === undefined || body[k] === null || body[k] === '') {
      delete body[k];
    }
  });

  const res = await apiFetch(`${API_BASE_URL}/api/maintenance`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to create maintenance request');
  }

  const json = await res.json();
  const createdId = unwrapData(json);
  return String(createdId || '');
};

export const getMaintenanceByResident = async (
  residentId: string,
): Promise<MaintenanceRequestItem[]> => {
  console.log("residentId",residentId)
  const res = await apiFetch(
    `${API_BASE_URL}/api/maintenance/by-resident/${residentId}`,
    { method: 'GET' },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch maintenance history');
  }

  const json = await res.json();
  const rawList = unwrapData(json);
  if (!Array.isArray(rawList)) return [];
  return rawList.map(toMaintenanceItem);
};

export const getMaintenanceById = async (
  id: string,
): Promise<MaintenanceRequestItem | null> => {
  const res = await apiFetch(`${API_BASE_URL}/api/maintenance/${id}`, {
    method: 'GET',
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    const text = await res.text();
    throw new Error(text || 'Failed to fetch maintenance request');
  }

  const json = await res.json();
  const raw = unwrapData(json);
  if (!raw) return null;
  return toMaintenanceItem(raw);
};

export const assignTechnician = async (payload: {
  requestId: string;
  technicianId: string;
}) => {
  const res = await apiFetch(`${API_BASE_URL}/api/maintenance/assign`, {
    method: 'POST',
    body: JSON.stringify({
      RequestId: payload.requestId,
      TechnicianId: payload.technicianId,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to assign technician');
  }
};

export const getTechniciansByServiceCategory = async (
  serviceCategoryId: string,
): Promise<TechnicianInfo[]> => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/technicians/by-service-category/${serviceCategoryId}`,
    { method: 'GET' },
  );

  if (!res.ok) {
    if (res.status === 404) return [];
    const text = await res.text();
    throw new Error(text || 'Failed to fetch technicians');
  }

  const json = await res.json();
  const data = unwrapData(json);
  if (!Array.isArray(data)) return [];
  return data.map(toTechnician).filter(Boolean) as TechnicianInfo[];
};

export const getMaintenanceCategories = async (): Promise<MaintenanceCategory[]> => {
  const res = await apiFetch(`${API_BASE_URL}/api/service-categories`, {
    method: 'GET',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch service categories');
  }

  const json = await res.json();
  const raw = unwrapData(json);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item: AnyRecord) => ({
      id: String(item.serviceCategoryId || ''),
      name: String(item.categoryName || ''),
      description: item.description ? String(item.description) : '',
      isActive: Boolean(item.isActive),
    }))
    .filter(item => item.id && item.name);
};

export const getTechnicianById = async (
  technicianId: string,
): Promise<TechnicianInfo | null> => {
  const res = await apiFetch(`${API_BASE_URL}/api/technicians/${technicianId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    const text = await res.text();
    throw new Error(text || 'Failed to fetch technician');
  }

  const json = await res.json();
  const data = unwrapData(json);
  if (!data) return null;
  return toTechnician(data) || null;
};
