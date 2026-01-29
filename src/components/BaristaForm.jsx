import { useState } from 'react';
import Modal from './Modal';

const avatarColors = [
  'd4a373', 'faedcd', '6b705c', 'dda15e', 'bc6c25',
  'e76f51', 'f4a261', '2a9d8f', '264653', 'e9c46a'
];

export default function BaristaForm({ isOpen, onClose, onSave, barista = null }) {
  const [formData, setFormData] = useState(
    barista || { name: '', role: 'Barista', avatar: '' }
  );
  const [selectedColor, setSelectedColor] = useState('d4a373');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate avatar URL if using color picker
    const avatar = formData.avatar || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=${selectedColor}&color=fff`;
    
    onSave({ ...formData, avatar });
    onClose();
    
    // Reset form
    setFormData({ name: '', role: 'Barista', avatar: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={barista ? 'Edit Barista' : 'Tambah Barista Baru'}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 'var(--spacing-xs)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}>
            Nama *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
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
            placeholder="Masukkan nama barista"
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 'var(--spacing-xs)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}>
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
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
            <option value="Casual">Casual</option>
            <option value="Barista">Barista</option>
            <option value="Senior Barista">Senior Barista</option>
            <option value="Head Barista">Head Barista</option>
          </select>
        </div>

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 'var(--spacing-xs)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}>
            Warna Avatar
          </label>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 'var(--spacing-xs)'
          }}>
            {avatarColors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  background: `#${color}`,
                  border: selectedColor === color ? '3px solid var(--color-accent-primary)' : '2px solid var(--color-bg-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>
          <p style={{ 
            marginTop: 'var(--spacing-xs)', 
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)'
          }}>
            Avatar akan dibuat otomatis berdasarkan nama dan warna yang dipilih
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-sm)',
          marginTop: 'var(--spacing-lg)'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
          >
            Batal
          </button>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: 'var(--color-accent-primary)',
              color: '#000',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#c89563'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-accent-primary)'}
          >
            {barista ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
