import { Platform } from 'react-native';

const DEFAULT_HOST = '192.168.1.228';

const getDefaultApiUrl = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    // If accessing via localhost on PC browser
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8000/api/v1';
    }
    // If accessing via LAN IP on phone or PC browser
    return `http://${host}:8000/api/v1`;
  }

  // Native mobile app fallback (Expo Go / standalone)
  return Platform.select({
    android: `http://${DEFAULT_HOST}:8000/api/v1`,
    ios: `http://${DEFAULT_HOST}:8000/api/v1`,
    default: `http://${DEFAULT_HOST}:8000/api/v1`,
  });
};

export const DEFAULT_API_BASE_URL = getDefaultApiUrl();

let currentApiBaseUrl = DEFAULT_API_BASE_URL;

export const getApiBaseUrl = () => currentApiBaseUrl;

export const setApiBaseUrl = (url: string) => {
  currentApiBaseUrl = url;
};
