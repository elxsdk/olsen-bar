// LocalStorage keys
const STORAGE_KEYS = {
  BARISTAS: 'olsen_baristas',
  SCHEDULE: 'olsen_schedule'
};

// Default data
const defaultBaristas = [
  { id: 1, name: 'Budi', role: 'Head Barista', avatar: 'https://ui-avatars.com/api/?name=Budi&background=d4a373&color=fff' },
  { id: 2, name: 'Siti', role: 'Senior Barista', avatar: 'https://ui-avatars.com/api/?name=Siti&background=faedcd&color=0f1115' },
  { id: 3, name: 'Andi', role: 'Barista', avatar: 'https://ui-avatars.com/api/?name=Andi&background=6b705c&color=fff' },
  { id: 4, name: 'Dewi', role: 'Barista', avatar: 'https://ui-avatars.com/api/?name=Dewi&background=dda15e&color=fff' },
];

export const shifts = [
  { id: 'morning', label: 'Pagi', time: '09:00 - 17:00' },
  { id: 'middle', label: 'siang', time: '12:00 - 20:00' },
  { id: 'evening', label: 'Sore', time: '17:00 - 23:59' },
];

// Helper to generate a month of schedule
export const generateMockSchedule = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const schedule = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    // Rotate between different shift patterns for variety
    const pattern = d % 3;
    if (pattern === 0) {
       schedule[dateStr] = {
         morning: [1, 2],
         middle: [3, 4],
         evening: [1, 3]
       };
    } else if (pattern === 1) {
       schedule[dateStr] = {
         morning: [2, 3],
         middle: [1, 4],
         evening: [2, 4]
       };
    } else {
       schedule[dateStr] = {
         morning: [1, 4],
         middle: [2, 3],
         evening: [1, 2]
       };
    }
  }
  return schedule;
};

// Load data from localStorage or use defaults
const loadBaristas = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BARISTAS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading baristas:', error);
  }
  return defaultBaristas;
};

const loadSchedule = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading schedule:', error);
  }
  return generateMockSchedule(new Date().getFullYear(), new Date().getMonth());
};

// Export initial data
export let baristas = loadBaristas();
export let currentMonthSchedule = loadSchedule();

// Save functions
const saveBaristas = (data) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BARISTAS, JSON.stringify(data));
    baristas = data;
  } catch (error) {
    console.error('Error saving baristas:', error);
  }
};

const saveSchedule = (data) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(data));
    currentMonthSchedule = data;
  } catch (error) {
    console.error('Error saving schedule:', error);
  }
};

// Barista CRUD operations
export const addBarista = (barista) => {
  const updatedBaristas = [...baristas];
  const newId = Math.max(...updatedBaristas.map(b => b.id), 0) + 1;
  const newBarista = { ...barista, id: newId };
  updatedBaristas.push(newBarista);
  saveBaristas(updatedBaristas);
  return newBarista;
};

export const updateBarista = (id, updates) => {
  const updatedBaristas = baristas.map(b => 
    b.id === id ? { ...b, ...updates } : b
  );
  saveBaristas(updatedBaristas);
  return updatedBaristas.find(b => b.id === id);
};

export const deleteBarista = (id) => {
  const updatedBaristas = baristas.filter(b => b.id !== id);
  saveBaristas(updatedBaristas);
  
  // Also remove from all schedules
  const updatedSchedule = { ...currentMonthSchedule };
  Object.keys(updatedSchedule).forEach(date => {
    updatedSchedule[date] = {
      morning: updatedSchedule[date].morning?.filter(bId => bId !== id) || [],
      middle: updatedSchedule[date].middle?.filter(bId => bId !== id) || [],
      evening: updatedSchedule[date].evening?.filter(bId => bId !== id) || []
    };
  });
  saveSchedule(updatedSchedule);
  
  return true;
};

export const getBaristas = () => {
  return loadBaristas();
};

// Schedule management
export const updateDaySchedule = (date, shift, baristaIds) => {
  const updatedSchedule = { ...currentMonthSchedule };
  
  if (!updatedSchedule[date]) {
    updatedSchedule[date] = { morning: [], middle: [], evening: [] };
  }
  
  updatedSchedule[date][shift] = baristaIds;
  saveSchedule(updatedSchedule);
  return updatedSchedule[date];
};

export const getSchedule = () => {
  return loadSchedule();
};
