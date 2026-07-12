import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

export interface Language {
  languageId: string;
  languageCode: string;
  languageName: string;
}

export interface LanguagesResponse {
  status: boolean;
  message: string;
  data: Language[];
}

export interface SelectLanguageResponse {
  status: boolean;
  message: string;
  data: null;
}

const SELECTED_LANGUAGE_ID_STORAGE_KEY = 'selectedLanguageId';
const APP_LANGUAGE_CODE_STORAGE_KEY = 'appLanguageCode';

export const normalizeSupportedLanguageCode = (
  value?: string | null,
): 'en' | 'fr' | 'ar' | null => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'en' || normalized === 'fr' || normalized === 'ar') {
    return normalized;
  }
  return null;
};

type ResolveLanguageSelectionOptions = {
  userData?: any;
  fallbackLanguageCode?: string | null;
  syncRemote?: boolean;
};

export const resolveLanguageSelection = async ({
  userData,
  fallbackLanguageCode,
  syncRemote = false,
}: ResolveLanguageSelectionOptions = {}) => {
  const persistedLanguageCode = normalizeSupportedLanguageCode(
    await AsyncStorage.getItem(APP_LANGUAGE_CODE_STORAGE_KEY),
  );
  const resolvedLanguageCode =
    normalizeSupportedLanguageCode(userData?.languageCode) ||
    normalizeSupportedLanguageCode(userData?.preferredLanguageCode) ||
    normalizeSupportedLanguageCode(fallbackLanguageCode) ||
    persistedLanguageCode;

  if (resolvedLanguageCode) {
    await AsyncStorage.setItem(APP_LANGUAGE_CODE_STORAGE_KEY, resolvedLanguageCode);
  }

  const directLanguageId = String(
    userData?.languageId || userData?.preferredLanguageId || '',
  ).trim();

  if (directLanguageId) {
    await AsyncStorage.setItem(SELECTED_LANGUAGE_ID_STORAGE_KEY, directLanguageId);
    return {
      languageId: directLanguageId,
      languageCode: resolvedLanguageCode,
    };
  }

  const storedLanguageId = String(
    (await AsyncStorage.getItem(SELECTED_LANGUAGE_ID_STORAGE_KEY)) || '',
  ).trim();

  if (storedLanguageId) {
    return {
      languageId: storedLanguageId,
      languageCode: resolvedLanguageCode,
    };
  }

  if (!resolvedLanguageCode) {
    return {
      languageId: '',
      languageCode: null,
    };
  }

  try {
    const languages = await fetchLanguages();
    const matchedLanguage = languages.find(
      item =>
        String(item.languageCode || '').trim().toLowerCase() ===
        resolvedLanguageCode,
    );

    if (!matchedLanguage?.languageId) {
      return {
        languageId: '',
        languageCode: resolvedLanguageCode,
      };
    }

    await AsyncStorage.setItem(
      SELECTED_LANGUAGE_ID_STORAGE_KEY,
      matchedLanguage.languageId,
    );

    if (syncRemote) {
      try {
        await selectLanguage(matchedLanguage.languageId);
      } catch (error) {
        console.warn('Unable to sync language selection remotely:', error);
      }
    }

    return {
      languageId: matchedLanguage.languageId,
      languageCode:
        normalizeSupportedLanguageCode(matchedLanguage.languageCode) ||
        resolvedLanguageCode,
    };
  } catch (error) {
    console.warn('Unable to resolve language selection:', error);
    return {
      languageId: '',
      languageCode: resolvedLanguageCode,
    };
  }
};

export const fetchLanguages = async (): Promise<Language[]> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/user/Languages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Fetch Languages Response Error:', text);
      throw new Error(text || 'Failed to fetch languages');
    }

    const json: LanguagesResponse = await response.json();
    console.log('Fetch Languages Response:', json);
    
    if (!json.status) {
      throw new Error(json.message || 'Failed to fetch languages');
    }

    return json.data;
  } catch (error: any) {
    console.error('FETCH LANGUAGES ERROR:', error);
    throw new Error(error.message || 'Network error');
  }
};

export const selectLanguage = async (languageId: string): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    
    
   
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const requestBody = {"language": languageId };
  

    const response = await apiFetch(`${API_BASE_URL}/api/user/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });




    const responseText = await response.text();
   

    if (!response.ok) {
      throw new Error(responseText || `Failed to select language (Status: ${response.status})`);
    }

  
    let json: SelectLanguageResponse;
    try {
      json = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Invalid response format from server');
    }

    console.log('Select Language Response:', json);
    
    if (!json.status) {
      throw new Error(json.message || 'Failed to select language');
    }

    await AsyncStorage.setItem(SELECTED_LANGUAGE_ID_STORAGE_KEY, languageId);
    
  } catch (error: any) {
    console.error('SELECT LANGUAGE ERROR:', error);
    throw error;
  }
};
