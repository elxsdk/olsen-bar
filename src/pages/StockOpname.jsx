import { useState, useEffect } from 'react';
import { ClipboardCheck, Save, AlertCircle } from 'lucide-react';
import {
  getInventoryItems,
  getStockOpname,
  submitBulkStockOpname,
  getTodayDate,
  formatNumber,
  getCategories
} from '../data/stockData';

export default function StockOpname() {
  const [items, setItems] = useState([]);
  const [opnameData, setOpnameData] = useState({});
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const categories = getCategories();
  const isToday = selectedDate === getTodayDate();

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load all inventory items
      const allItems = await getInventoryItems();
      
      // Load existing opname data for the selected date
      const existingOpname = await getStockOpname(selectedDate);
      
      // Create opname data map
      const opnameMap = {};
      existingOpname.forEach(record => {
        opnameMap[record.item_id] = {
          beginning_stock: record.beginning_stock,
          stock_in: record.stock_in || 0,
          actual_stock: record.actual_stock,
          stock_out: record.stock_out,
          expected_stock: record.expected_stock
        };
      });

      setItems(allItems);
      setOpnameData(opnameMap);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (itemId, field, value) => {
    setOpnameData(prev => {
      const current = prev[itemId] || { beginning_stock: 0, stock_in: 0, actual_stock: 0 };
      const updated = { ...current, [field]: parseFloat(value) || 0 };
      
      // Auto-calculate stock_out
      const expected = updated.beginning_stock + updated.stock_in;
      updated.stock_out = expected - updated.actual_stock;
      updated.expected_stock = expected;
      
      return { ...prev, [itemId]: updated };
    });
  };

  const handleSaveAll = async () => {
    if (!isToday) {
      alert('Hanya bisa input stock opname untuk hari ini!');
      return;
    }

    const opnameList = Object.entries(opnameData)
      .filter(([itemId, data]) => data.actual_stock !== undefined && data.actual_stock !== '')
      .map(([itemId, data]) => ({
        item_id: parseInt(itemId),
        opname_date: selectedDate,
        actual_stock: data.actual_stock,
        stock_in: data.stock_in || 0,
        notes: null,
        created_by: null // TODO: Get from auth context
      }));

    if (opnameList.length === 0) {
      alert('Belum ada data stock yang diinput!');
      return;
    }

    setIsSaving(true);
    try {
      await submitBulkStockOpname(opnameList);
      setSaveMessage(`✓ Berhasil menyimpan ${opnameList.length} item stock opname`);
      setTimeout(() => setSaveMessage(''), 3000);
      await loadData();
    } catch (error) {
      alert('Gagal menyimpan stock opname: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-primary))',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--color-bg-tertiary)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
          <div>
            <h2 style={{
              margin: '0 0 var(--spacing-xs) 0',
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-accent-primary)'
            }}>
              <ClipboardCheck size={24} style={{ verticalAlign: 'middle', marginRight: 'var(--spacing-xs)' }} />
              Stock Opname
            </h2>
            <p style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-base)'
            }}>
              Input stock akhir aktual, sistem akan otomatis hitung OUT
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getTodayDate()}
              style={{
                padding: 'var(--spacing-sm)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-bg-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-base)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Warning for past dates */}
      {!isToday && (
        <div style={{
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          background: 'rgba(221, 161, 94, 0.1)',
          border: '1px solid var(--color-warning)',
          borderRadius: 'var(--border-radius-md)',
          display: 'flex',
          gap: 'var(--spacing-sm)',
          alignItems: 'center'
        }}>
          <AlertCircle size={20} color="var(--color-warning)" />
          <span style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-sm)' }}>
            Mode Read-Only: Hanya bisa input stock opname untuk hari ini
          </span>
        </div>
      )}

      {/* Success Message */}
      {saveMessage && (
        <div style={{
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          background: 'rgba(96, 108, 56, 0.2)',
          border: '1px solid var(--color-success)',
          borderRadius: 'var(--border-radius-md)',
          color: 'var(--color-success)',
          textAlign: 'center',
          fontWeight: 600
        }}>
          {saveMessage}
        </div>
      )}

      {/* Category Filter */}
      <div style={{
        marginBottom: 'var(--spacing-lg)',
        display: 'flex',
        gap: 'var(--spacing-xs)',
        overflowX: 'auto',
        paddingBottom: 'var(--spacing-xs)'
      }}>
        <CategoryTab
          label="Semua"
          active={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
        />
        {categories.map(cat => (
          <CategoryTab
            key={cat}
            label={cat}
            active={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          />
        ))}
      </div>

      {/* Items List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
          Loading...
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-xl)',
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--color-bg-tertiary)'
        }}>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Belum ada item inventory. Silakan tambahkan di halaman Inventory Management.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              <h3 style={{
                margin: '0 0 var(--spacing-md) 0',
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {category}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {categoryItems.map(item => {
                  const data = opnameData[item.id] || { beginning_stock: 0, stock_in: 0, actual_stock: '' };
                  return (
                    <StockOpnameCard
                      key={item.id}
                      item={item}
                      data={data}
                      onChange={(field, value) => handleInputChange(item.id, field, value)}
                      readOnly={!isToday}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      {isToday && filteredItems.length > 0 && (
        <div style={{
          position: 'sticky',
          bottom: 0,
          marginTop: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          background: 'var(--color-bg-primary)',
          borderTop: '1px solid var(--color-bg-tertiary)'
        }}>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: 'var(--spacing-md)',
              background: 'var(--color-accent-primary)',
              color: '#000',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              opacity: isSaving ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            <Save size={20} />
            {isSaving ? 'Menyimpan...' : 'SAVE ALL'}
          </button>
        </div>
      )}
    </div>
  );
}

function CategoryTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: 'var(--spacing-sm) var(--spacing-md)',
        background: active ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)',
        color: active ? '#000' : 'var(--color-text-secondary)',
        borderRadius: 'var(--border-radius-md)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: active ? 600 : 400,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
        border: active ? 'none' : '1px solid var(--color-bg-tertiary)'
      }}
    >
      {label}
    </button>
  );
}

function StockOpnameCard({ item, data, onChange, readOnly }) {
  const stockOut = data.stock_out || 0;
  const hasNegativeOut = stockOut < 0;

  return (
    <div style={{
      padding: 'var(--spacing-md)',
      background: 'var(--color-bg-secondary)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--color-bg-tertiary)'
    }}>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h4 style={{
          margin: 0,
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-text-primary)',
          fontWeight: 600
        }}>
          {item.name}
        </h4>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--spacing-md)'
      }}>
        {/* Last Stock */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-xs)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)'
          }}>
            Last Stock
          </label>
          <div style={{
            padding: 'var(--spacing-sm)',
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)'
          }}>
            {formatNumber(data.beginning_stock)} {item.unit}
          </div>
        </div>

        {/* IN */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-xs)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)'
          }}>
            IN
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <input
              type="number"
              step="0.01"
              value={data.stock_in || ''}
              onChange={(e) => onChange('stock_in', e.target.value)}
              disabled={readOnly}
              placeholder="0"
              style={{
                flex: 1,
                padding: 'var(--spacing-sm)',
                background: readOnly ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                border: '1px solid var(--color-bg-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-base)'
              }}
            />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {item.unit}
            </span>
          </div>
        </div>

        {/* Actual Stock */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-xs)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)'
          }}>
            Actual Stock *
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <input
              type="number"
              step="0.01"
              value={data.actual_stock}
              onChange={(e) => onChange('actual_stock', e.target.value)}
              disabled={readOnly}
              placeholder="0"
              style={{
                flex: 1,
                padding: 'var(--spacing-sm)',
                background: readOnly ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                border: `2px solid ${readOnly ? 'var(--color-bg-tertiary)' : 'var(--color-accent-primary)'}`,
                borderRadius: 'var(--border-radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 600
              }}
            />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {item.unit}
            </span>
          </div>
        </div>

        {/* OUT (Auto-calculated) */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-xs)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)'
          }}>
            → OUT (auto)
          </label>
          <div style={{
            padding: 'var(--spacing-sm)',
            background: hasNegativeOut ? 'rgba(220, 38, 38, 0.1)' : 'rgba(212, 163, 115, 0.1)',
            border: `1px solid ${hasNegativeOut ? '#dc2626' : 'var(--color-accent-primary)'}`,
            borderRadius: 'var(--border-radius-md)',
            fontSize: 'var(--font-size-base)',
            color: hasNegativeOut ? '#dc2626' : 'var(--color-accent-primary)',
            fontWeight: 600
          }}>
            {data.actual_stock !== '' ? `${formatNumber(stockOut)} ${item.unit}` : '-'}
          </div>
        </div>
      </div>

      {/* Warning for negative OUT */}
      {hasNegativeOut && data.actual_stock !== '' && (
        <div style={{
          marginTop: 'var(--spacing-sm)',
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid #dc2626',
          borderRadius: 'var(--border-radius-sm)',
          fontSize: 'var(--font-size-sm)',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)'
        }}>
          <AlertCircle size={16} />
          OUT negatif: Actual stock lebih besar dari expected. Cek kembali!
        </div>
      )}
    </div>
  );
}
