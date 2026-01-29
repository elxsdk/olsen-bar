// API base URL - use relative path for production, full URL for development
const API_BASE = import.meta.env.PROD ? '' : '';

// Shifts data (static, no need to store in DB)
export const shifts = [
  { id: 'morning', label: 'Pagi', time: '09:00 - 17:00' },
  { id: 'middle', label: 'Siang', time: '12:00 - 20:00' },
  { id: 'evening', label: 'Sore', time: '17:00 - 23:59' },
];

// Cache for data
let baristasCache = null;
let scheduleCache = null;

// ============ BARISTAS API ============

export const getBaristas = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/baristas`);
    if (!response.ok) throw new Error('Failed to fetch baristas');
    baristasCache = await response.json();
    return baristasCache;
  } catch (error) {
    console.error('Error fetching baristas:', error);
    return baristasCache || [];
  }
};

export const addBarista = async (barista) => {
  try {
    const response = await fetch(`${API_BASE}/api/baristas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(barista)
    });
    if (!response.ok) throw new Error('Failed to add barista');
    const newBarista = await response.json();
    baristasCache = null; // Invalidate cache
    return newBarista;
  } catch (error) {
    console.error('Error adding barista:', error);
    throw error;
  }
};

export const updateBarista = async (id, updates) => {
  try {
    const response = await fetch(`${API_BASE}/api/baristas?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update barista');
    const updatedBarista = await response.json();
    baristasCache = null; // Invalidate cache
    return updatedBarista;
  } catch (error) {
    console.error('Error updating barista:', error);
    throw error;
  }
};

export const deleteBarista = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/api/baristas?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete barista');
    baristasCache = null; // Invalidate cache
    return true;
  } catch (error) {
    console.error('Error deleting barista:', error);
    throw error;
  }
};

// ============ SCHEDULES API ============

export const getSchedule = async (month = null) => {
  try {
    const now = new Date();
    const monthParam = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const response = await fetch(`${API_BASE}/api/schedules?month=${monthParam}`);
    if (!response.ok) throw new Error('Failed to fetch schedule');
    scheduleCache = await response.json();
    return scheduleCache;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return scheduleCache || {};
  }
};

export const updateDaySchedule = async (date, shift, baristaIds) => {
  try {
    const response = await fetch(`${API_BASE}/api/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, shift, baristaIds })
    });
    if (!response.ok) throw new Error('Failed to update schedule');
    scheduleCache = null; // Invalidate cache
    return await response.json();
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

export const clearDaySchedule = async (date) => {
  try {
    const response = await fetch(`${API_BASE}/api/schedules?date=${date}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to clear schedule');
    scheduleCache = null; // Invalidate cache
    return true;
  } catch (error) {
    console.error('Error clearing schedule:', error);
    throw error;
  }
};

// ============ INITIALIZE DATABASE ============

export const initializeDatabase = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/init`);
    if (!response.ok) throw new Error('Failed to initialize database');
    return await response.json();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// ============ LEGACY EXPORTS FOR COMPATIBILITY ============
// These are kept for backward compatibility with existing components
// They will be populated after first API call

export let baristas = [];
export let currentMonthSchedule = {};

// Helper to sync cache to exports
export const syncData = async () => {
  baristas = await getBaristas();
  currentMonthSchedule = await getSchedule();
  return { baristas, currentMonthSchedule };
};
