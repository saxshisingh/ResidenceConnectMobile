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

    await AsyncStorage.setItem('selectedLanguageId', languageId);
    
  } catch (error: any) {
    console.error('SELECT LANGUAGE ERROR:', error);
    throw error;
  }
};
