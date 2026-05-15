type DeleteAccountRequestPayload = {
  email: string;
};

const ACCOUNT_DELETION_URL = 'https://residenceconnect-dz.com/api/residents/request-deletion';

const parseDeletionResponse = async (response: Response): Promise<string> => {
  const rawText = await response.text();
  const text = rawText.trim();

  if (!text) {
    return '';
  }

  try {
    const parsed = JSON.parse(text);

    if (typeof parsed === 'string') {
      return parsed;
    }

    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message.trim();
    }

    if (typeof parsed?.error === 'string' && parsed.error.trim()) {
      return parsed.error.trim();
    }

    if (typeof parsed?.title === 'string' && parsed.title.trim()) {
      return parsed.title.trim();
    }
  } catch {}

  return text;
};

export const requestAccountDeletion = async ({
  email,
}: DeleteAccountRequestPayload): Promise<string> => {
  const trimmedEmail = String(email || '').trim();
  console.log("trimmedEmail:", trimmedEmail);

  if (!trimmedEmail) {
    throw new Error('Email is required');
  }

  const response = await fetch(ACCOUNT_DELETION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: trimmedEmail,
    }),
  });

  const message = await parseDeletionResponse(response);

  if (!response.ok) {
    throw new Error(message || `Account deletion failed (HTTP ${response.status})`);
  }

  return message || 'Account deletion request processed successfully.';
};
