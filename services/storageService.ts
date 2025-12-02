import { AppData } from '../types';
import { INITIAL_DATA } from '../constants';

const STORAGE_KEY = 'umami_fenix_data_v1';

export const saveAppData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to local storage', error);
  }
};

export const loadAppData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_DATA;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading data, reverting to defaults', error);
    return INITIAL_DATA;
  }
};

export const resetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
}