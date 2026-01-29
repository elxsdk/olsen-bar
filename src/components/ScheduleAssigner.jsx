import { useState, useEffect, useRef } from 'react';
import { Calendar, Save, Loader2 } from 'lucide-react';
import { getBaristas, getSchedule, updateDaySchedule, shifts } from '../data/mockData';

export default function ScheduleAssigner({ onDataChange }) {
  const dateInputRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const [baristas, setBaristas] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [morningShift, setMorningShift] = useState([]);
  const [middleShift, setMiddleShift] = useState([]);
  const [eveningShift, setEveningShift] = useState([]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [baristasData, scheduleData] = await Promise.all([
        getBaristas(),
        getSchedule()
      ]);
      setBaristas(baristasData);
      setSchedule(scheduleData);
      
      // Load schedule for selected date
      const daySchedule = scheduleData[selectedDate];
      if (daySchedule) {
        setMorningShift(daySchedule.morning || []);
        setMiddleShift(daySchedule.middle || []);
        setEveningShift(daySchedule.evening || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  // Update shifts when date changes
  useEffect(() => {
    const daySchedule = schedule[selectedDate];
    if (daySchedule) {
      setMorningShift(daySchedule.morning || []);
      setMiddleShift(daySchedule.middle || []);
      setEveningShift(daySchedule.evening || []);
    } else {
      setMorningShift([]);
      setMiddleShift([]);
      setEveningShift([]);
    }
  }, [selectedDate, schedule]);

  const handleToggleBarista = (shift, baristaId) => {
    let setter, current;
    
    if (shift === 'morning') {
      setter = setMorningShift;
      current = morningShift;
    } else if (shift === 'middle') {
      setter = setMiddleShift;
      current = middleShift;
    } else {
      setter = setEveningShift;
      current = eveningShift;
    }

    if (current.includes(baristaId)) {
      setter(current.filter(id => id !== baristaId));
    } else {
      setter([...current, baristaId]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateDaySchedule(selectedDate, 'morning', morningShift),
        updateDaySchedule(selectedDate, 'middle', middleShift),
        updateDaySchedule(selectedDate, 'evening', eveningShift)
      ]);
      
      // Refresh schedule data
      const newSchedule = await getSchedule();
      setSchedule(newSchedule);
      
      onDataChange?.();
      alert('✓ Jadwal berhasil disimpan!');
    } catch (error) {
      alert('Gagal menyimpan jadwal: ' + error.message);
    }
    setSaving(false);
  };

  const handleClearSchedule = async () => {
    if (window.confirm(`Bersihkan jadwal untuk ${formatDateDisplay(selectedDate)}?\n\nSemua barista akan dihapus dari semua shift.`)) {
      setSaving(true);
      try {
        setMorningShift([]);
        setMiddleShift([]);
        setEveningShift([]);
        
        await Promise.all([
          updateDaySchedule(selectedDate, 'morning', []),
          updateDaySchedule(selectedDate, 'middle', []),
          updateDaySchedule(selectedDate, 'evening', [])
        ]);
        
        const newSchedule = await getSchedule();
        setSchedule(newSchedule);
        
        onDataChange?.();
        alert('✓ Jadwal berhasil dibersihkan!');
      } catch (error) {
        alert('Gagal membersihkan jadwal: ' + error.message);
      }
      setSaving(false);
    }
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px',
        color: 'var(--color-text-muted)'
      }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: 'var(--spacing-sm)' }}>Memuat data...</span>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-bg-tertiary)',
        borderRadius: 'var(--border-radius-lg)'
      }}>
        <label style={{
          display: 'block',
          marginBottom: 'var(--spacing-xs)',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 500
        }}>
          <Calendar size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Pilih Tanggal
        </label>
        <div style={{ position: 'relative' }}>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              paddingRight: '40px',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-bg-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-base)',
              cursor: 'pointer'
            }}
          />
          <Calendar 
            size={20} 
            onClick={handleCalendarClick}
            style={{ 
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: 'var(--color-accent-primary)'
            }} 
          />
        </div>
        <p style={{
          margin: 'var(--spacing-xs) 0 0 0',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-accent-primary)'
        }}>
          {formatDateDisplay(selectedDate)}
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <button
          onClick={handleClearSchedule}
          disabled={saving}
          style={{
            flex: 1,
            padding: 'var(--spacing-sm)',
            background: 'transparent',
            border: '1px solid #dc2626',
            borderRadius: 'var(--border-radius-md)',
            color: '#dc2626',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
            transition: 'all 0.2s',
            opacity: saving ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#dc2626';
          }}
        >
          Bersihkan Jadwal
        </button>
      </div>

      {shifts.map(shift => {
        let isSelected;
        
        if (shift.id === 'morning') {
          isSelected = morningShift;
        } else if (shift.id === 'middle') {
          isSelected = middleShift;
        } else {
          isSelected = eveningShift;
        }
        
        return (
          <div
            key={shift.id}
            style={{
              marginBottom: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-bg-tertiary)',
              borderRadius: 'var(--border-radius-lg)'
            }}
          >
            <h4 style={{ 
              margin: '0 0 var(--spacing-sm) 0',
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-accent-primary)'
            }}>
              {shift.label} ({shift.time})
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 'var(--spacing-xs)'
            }}>
              {baristas.map(barista => {
                const isChecked = isSelected.includes(barista.id);
                
                return (
                  <label
                    key={barista.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      padding: 'var(--spacing-sm)',
                      background: isChecked ? 'rgba(212, 163, 115, 0.1)' : 'var(--color-bg-primary)',
                      border: isChecked ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-bg-tertiary)',
                      borderRadius: 'var(--border-radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.background = 'rgba(212, 163, 115, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.borderColor = 'var(--color-bg-tertiary)';
                        e.currentTarget.style.background = 'var(--color-bg-primary)';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleBarista(shift.id, barista.id)}
                      disabled={saving}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: 'var(--color-accent-primary)'
                      }}
                    />
                    <img
                      src={barista.avatar}
                      alt={barista.name}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                        {barista.name}
                      </div>
                      <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--color-text-muted)'
                      }}>
                        {barista.role}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            
            <p style={{
              margin: 'var(--spacing-sm) 0 0 0',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)'
            }}>
              {isSelected.length} barista dipilih
            </p>
          </div>
        );
      })}

      <button
        id="save-schedule-btn"
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-md)',
          background: saving ? '#888' : 'var(--color-accent-primary)',
          color: '#000',
          borderRadius: 'var(--border-radius-md)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 600,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!saving) {
            e.currentTarget.style.background = '#c89563';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!saving) {
            e.currentTarget.style.background = 'var(--color-accent-primary)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {saving ? (
          <>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Menyimpan...
          </>
        ) : (
          <>
            <Save size={20} />
            Simpan Jadwal
          </>
        )}
      </button>
    </div>
  );
}
