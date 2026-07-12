export type MaintenanceStatus = 'Pending' | 'Completed';

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
  name: string;
  role: string;
  phone: string;
  experience: string;
  skills: string[];
  address: string;
  schedule: string;
}

export interface MaintenanceRequestItem {
  id: string;
  serviceKey: ServiceKey;
  serviceLabel: string;
  description: string;
  preferredDateTime: string;
  apartmentDetails: string;
  contactNumber: string;
  urgencyLevel: 'Low' | 'Medium' | 'High';
  status: MaintenanceStatus;
  requestedOn: string;
  technician?: TechnicianInfo;
}

interface CreateRequestPayload {
  serviceKey: ServiceKey;
  serviceLabel: string;
  description: string;
  preferredDateTime: string;
  apartmentDetails: string;
  contactNumber: string;
  urgencyLevel: 'Low' | 'Medium' | 'High';
}

const defaultTechnician: TechnicianInfo = {
  id: 'TECH-1001',
  name: 'Rahul Sharma',
  role: 'Electrician',
  phone: '+1 234 567 8901',
  experience: '5+ years',
  skills: ['Fan & light repair', 'Switchboard repair', 'Wiring issues', 'Electrical safety check'],
  address: 'Greenfield Apartments, Block C',
  schedule: 'Monday to Saturday, 9:00 AM - 6:00 PM',
};

let maintenanceRequests: MaintenanceRequestItem[] = [
  {
    id: 'REQ-1024',
    serviceKey: 'electrician',
    serviceLabel: 'Electrician',
    description: 'Fan is not working',
    preferredDateTime: '18/03/2024 11:30 AM',
    apartmentDetails: 'A-402',
    contactNumber: '(454) 726-0592',
    urgencyLevel: 'Low',
    status: 'Completed',
    requestedOn: 'Jan 18, 2026',
    technician: defaultTechnician,
  },
  {
    id: 'REQ-1025',
    serviceKey: 'plumber',
    serviceLabel: 'Plumber',
    description: 'Kitchen sink leakage',
    preferredDateTime: '22/03/2024 10:00 AM',
    apartmentDetails: 'A-402',
    contactNumber: '(454) 726-0592',
    urgencyLevel: 'Medium',
    status: 'Pending',
    requestedOn: 'Jan 20, 2026',
  },
];

export function getMaintenanceRequests(): MaintenanceRequestItem[] {
  return [...maintenanceRequests];
}

export function getMaintenanceRequestById(id: string): MaintenanceRequestItem | undefined {
  return maintenanceRequests.find(item => item.id === id);
}

export function createMaintenanceRequest(payload: CreateRequestPayload): MaintenanceRequestItem {
  const nextId = `REQ-${1030 + maintenanceRequests.length}`;
  const item: MaintenanceRequestItem = {
    id: nextId,
    serviceKey: payload.serviceKey,
    serviceLabel: payload.serviceLabel,
    description: payload.description,
    preferredDateTime: payload.preferredDateTime,
    apartmentDetails: payload.apartmentDetails,
    contactNumber: payload.contactNumber,
    urgencyLevel: payload.urgencyLevel,
    status: 'Pending',
    requestedOn: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
  maintenanceRequests = [item, ...maintenanceRequests];
  return item;
}
