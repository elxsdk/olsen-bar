import { useState, useEffect } from 'react';
import { Package, Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import Modal from '../components/Modal';
import {
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getCategories
} from '../data/stockData';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const categories = getCategories();

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, selectedCategory, searchQuery]);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await getInventoryItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (item) => {
    if (!confirm(`Hapus item "${item.name}"?`)) return;

    try {
      await deleteInventoryItem(item.id);
      await loadItems();
    } catch (error) {
      alert('Gagal menghapus item: ' + error.message);
    }
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{
              margin: '0 0 var(--spacing-xs) 0',
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-accent-primary)'
            }}>
              <Package size={24} style={{ verticalAlign: 'middle', marginRight: 'var(--spacing-xs)' }} />
              Inventory Management
            </h2>
            <p style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-base)'
            }}>
              Kelola daftar item inventory untuk stock opname
            </p>
          </div>
          <button
            onClick={handleAddItem}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: 'var(--color-accent-primary)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={20} />
            Tambah Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        marginBottom: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: 'var(--spacing-sm)',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)'
          }} />
          <input
            type="text"
            placeholder="Cari item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 2.5rem',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-bg-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-base)'
            }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-xs)',
          overflowX: 'auto',
          paddingBottom: 'var(--spacing-xs)'
        }}>
          <CategoryTab
            label="Semua"
            value="all"
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            count={items.length}
          />
          {categories.map(cat => (
            <CategoryTab
              key={cat}
              label={cat}
              value={cat}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              count={items.filter(item => item.category === cat).length}
            />
          ))}
        </div>
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
          <Package size={48} color="var(--color-text-muted)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            {searchQuery || selectedCategory !== 'all' ? 'Tidak ada item yang cocok' : 'Belum ada item inventory'}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
                {categoryItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => handleEditItem(item)}
                    onDelete={() => handleDeleteItem(item)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <ItemFormModal
          item={editingItem}
          onClose={() => setIsModalOpen(false)}
          onSave={async () => {
            await loadItems();
            setIsModalOpen(false);
          }}
          categories={categories}
        />
      )}
    </div>
  );
}

function CategoryTab({ label, value, active, onClick, count }) {
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
        border: active ? 'none' : '1px solid var(--color-bg-tertiary)',
        cursor: 'pointer'
      }}
    >
      {label} ({count})
    </button>
  );
}

function ItemCard({ item, onEdit, onDelete }) {
  return (
    <div style={{
      padding: 'var(--spacing-md)',
      background: 'var(--color-bg-secondary)',
      borderRadius: 'var(--border-radius-md)',
      border: '1px solid var(--color-bg-tertiary)',
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-sm)' }}>
        <h4 style={{
          margin: 0,
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-primary)',
          fontWeight: 600
        }}>
          {item.name}
        </h4>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <button
            onClick={onEdit}
            style={{
              padding: 'var(--spacing-xs)',
              background: 'transparent',
              color: 'var(--color-accent-primary)',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: 'var(--spacing-xs)',
              background: 'transparent',
              color: 'var(--color-danger)',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Unit: <strong>{item.unit}</strong>
        </span>
        {item.min_stock && (
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Min Stock: <strong>{item.min_stock}</strong>
          </span>
        )}
      </div>
    </div>
  );
}

function ItemFormModal({ item, onClose, onSave, categories }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || categories[0],
    unit: item?.unit || '',
    min_stock: item?.min_stock || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (item) {
        await updateInventoryItem(item.id, formData);
      } else {
        await addInventoryItem(formData);
      }
      onSave();
    } catch (error) {
      alert('Gagal menyimpan item: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div style={{
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: 'var(--spacing-lg)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)', color: 'var(--color-accent-primary)' }}>
            {item ? 'Edit Item' : 'Tambah Item Baru'}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', padding: 'var(--spacing-xs)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Nama Item *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-bg-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-base)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Kategori *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-bg-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-base)'
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Satuan (Unit) *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Gram, ML, Pcs, Karung, dll"
                required
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-bg-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-base)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Minimum Stock (Opsional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-bg-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-base)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: 'var(--spacing-sm)',
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                border: 'none',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 1,
                padding: 'var(--spacing-sm)',
                background: 'var(--color-accent-primary)',
                color: '#000',
                border: 'none',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1
              }}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
