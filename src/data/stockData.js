// Stock Management Data Layer
// API wrapper for inventory and stock opname operations

const API_BASE = import.meta.env.PROD ? '' : '';

// Cache for data
let inventoryCache = null;
let categoriesCache = ['Coffee', 'Dairy', 'Powder', 'Syrup/Liquid', 'Organics', 'Tea', 'Other 1', 'Other 2'];

// ============ INVENTORY API ============

export const getInventoryItems = async (category = null) => {
  try {
    const url = category && category !== 'all' 
      ? `${API_BASE}/api/inventory?category=${encodeURIComponent(category)}`
      : `${API_BASE}/api/inventory`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch inventory items');
    
    inventoryCache = await response.json();
    return inventoryCache;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return inventoryCache || [];
  }
};

export const addInventoryItem = async (item) => {
  try {
    const response = await fetch(`${API_BASE}/api/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!response.ok) throw new Error('Failed to add inventory item');
    
    const newItem = await response.json();
    inventoryCache = null; // Invalidate cache
    return newItem;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

export const updateInventoryItem = async (id, updates) => {
  try {
    const response = await fetch(`${API_BASE}/api/inventory?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update inventory item');
    
    const updatedItem = await response.json();
    inventoryCache = null; // Invalidate cache
    return updatedItem;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/api/inventory?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete inventory item');
    
    inventoryCache = null; // Invalidate cache
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

// ============ STOCK OPNAME API ============

export const getStockOpname = async (date) => {
  try {
    const response = await fetch(`${API_BASE}/api/stock-opname?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch stock opname');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stock opname:', error);
    return [];
  }
};

export const getStockOpnameHistory = async (fromDate, toDate) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/stock-opname?from=${fromDate}&to=${toDate}`
    );
    if (!response.ok) throw new Error('Failed to fetch stock opname history');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stock opname history:', error);
    return [];
  }
};

export const submitStockOpname = async (opnameData) => {
  try {
    const response = await fetch(`${API_BASE}/api/stock-opname`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opnameData)
    });
    if (!response.ok) throw new Error('Failed to submit stock opname');
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting stock opname:', error);
    throw error;
  }
};

export const submitBulkStockOpname = async (opnameList) => {
  try {
    const results = await Promise.all(
      opnameList.map(opnameData => submitStockOpname(opnameData))
    );
    return results;
  } catch (error) {
    console.error('Error submitting bulk stock opname:', error);
    throw error;
  }
};

// ============ HELPERS ============

export const getCategories = () => categoriesCache;

export const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const formatNumber = (num) => {
  if (!num && num !== 0) return '-';
  return parseFloat(num).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};
