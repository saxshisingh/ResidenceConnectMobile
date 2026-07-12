import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

export interface SecurityContactInfo {
  staffId?: string;
  userId?: string;
  securityUserId?: string;
  receiverId?: string;
  conversationId?: string;
  name?: string;
  phoneNumber?: string;
  mobile?: string;
  contact?: string;
}

export interface StartSecurityCallPayload {
  calledByUserId: string;
  residenceId: string;
  blockId: string;
  fromNumber: string;
  toNumber: string;
}

const unwrapData = (json: any) => {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
};

const readJsonSafely = async (res: Response) => {
  const text = await res.text();
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const getSecurityContact = async (
  residenceId: string,
  blockId: string,
): Promise<SecurityContactInfo | null> => {
  const params = new URLSearchParams({
    residenceId,
    blockId,
  });

  const res = await apiFetch(`${API_BASE_URL}/api/security/contact?${params.toString()}`, {
    method: 'GET',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch security contact');
  }

  const json = await readJsonSafely(res);
  if (json && typeof json === 'object' && json.status === false) {
    throw new Error(json.message || 'No active security staff found.');
  }
  const contactData = unwrapData(json);
  if (!contactData) return null;

  const staffId = String(
    contactData.securityStaffId ||
      contactData.staffId ||
      contactData.securityId ||
      contactData.id ||
      '',
  );

  let staffData: any = null;
  if (staffId) {
    const staffRes = await apiFetch(`${API_BASE_URL}/api/security-staff/${staffId}`, {
      method: 'GET',
    });
    if (staffRes.ok) {
      const staffJson = await readJsonSafely(staffRes);
      staffData = unwrapData(staffJson);
    }
  }

  const fullName = `${staffData?.firstName || ''} ${staffData?.lastName || ''}`.trim();
  const securityUserId =
    staffData?.userId ||
    staffData?.securityUserId ||
    contactData?.securityUserId ||
    contactData?.userId;

  return {
    staffId: staffId || undefined,
    userId: securityUserId,
    securityUserId,
    receiverId:
      securityUserId ||
      contactData?.receiverId ||
      contactData?.securityUserId ||
      contactData?.userId,
    conversationId: contactData?.conversationId || contactData?.chatConversationId,
    name: fullName || contactData?.name || contactData?.securityName || 'Security Team',
    phoneNumber:
      staffData?.mobileNumber ||
      staffData?.phoneNumber ||
      contactData?.phoneNumber ||
      contactData?.contactNumber ||
      contactData?.phone,
    mobile: staffData?.mobileNumber || contactData?.mobile,
    contact: contactData?.contact,
  };
};

export const startSecurityCall = async (payload: StartSecurityCallPayload) => {
  const requestPayload = {
    ...payload,
    callType: 'RESIDENT_TO_SECURITY',
  };

  console.log("payload", requestPayload);

  const res = await apiFetch(`${API_BASE_URL}/api/security/start-call`, {
    method: 'POST',
    body: JSON.stringify(requestPayload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to start security call');
  }

  return await readJsonSafely(res);
};
