import { useState } from 'react';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';
import { baristas, addBarista, updateBarista, deleteBarista } from '../data/mockData';
import BaristaForm from './BaristaForm';

export default function BaristaManager({ onDataChange }) {
  const [showForm, setShowForm] = useState(false);
  const [editingBarista, setEditingBarista] = useState(null);
  const [baristaList, setBaristaList] = useState(baristas);

  const handleAdd = () => {
    setEditingBarista(null);
    setShowForm(true);
  };

  const handleEdit = (barista) => {
    setEditingBarista(barista);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus barista ini? Barista akan dihapus dari semua jadwal.')) {
      deleteBarista(id);
      setBaristaList(baristas);
      onDataChange?.();
    }
  };

  const handleSave = (baristaData) => {
    if (editingBarista) {
      updateBarista(editingBarista.id, baristaData);
    } else {
      addBarista(baristaData);
    }
    setBaristaList(baristas);
    onDataChange?.();
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)'
      }}>
        <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>
          Daftar Barista ({baristaList.length})
        </h3>
        <button
          onClick={handleAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            background: 'var(--color-accent-primary)',
            color: '#000',
            borderRadius: 'var(--border-radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#c89563';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-accent-primary)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <UserPlus size={18} />
          Tambah Barista
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 'var(--spacing-md)'
      }}>
        {baristaList.map(barista => (
          <div
            key={barista.id}
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-bg-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: 'var(--spacing-md)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-bg-tertiary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
              <img
                src={barista.avatar}
                alt={barista.name}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid var(--color-bg-tertiary)'
                }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>
                  {barista.name}
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)'
                }}>
                  {barista.role}
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 'var(--spacing-xs)',
              marginTop: 'var(--spacing-sm)',
              paddingTop: 'var(--spacing-sm)',
              borderTop: '1px solid var(--color-bg-tertiary)'
            }}>
              <button
                onClick={() => handleEdit(barista)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: 'var(--spacing-xs)',
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-secondary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-accent-primary)';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                <Edit2 size={14} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(barista.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: 'var(--spacing-xs)',
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-secondary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                <Trash2 size={14} />
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {baristaList.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-xl)',
          color: 'var(--color-text-muted)'
        }}>
          <p>Belum ada barista. Tambahkan barista pertama Anda!</p>
        </div>
      )}

      <BaristaForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        barista={editingBarista}
      />
    </div>
  );
}
