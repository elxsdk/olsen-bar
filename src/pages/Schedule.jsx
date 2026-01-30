import { useState, useEffect, useRef } from 'react';
import { getSchedule, getBaristas, shifts } from '../data/mockData';
import { Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [baristas, setBaristas] = useState([]);
  const [schedule, setSchedule] = useState({});
  const todayCardRef = useRef(null);

  const loadData = async (date) => {
    setLoading(true);
    try {
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const [baristasData, scheduleData] = await Promise.all([
        getBaristas(),
        getSchedule(monthStr)
      ]);
      setBaristas(baristasData);
      setSchedule(scheduleData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(currentDate);
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const daysInMonth = (() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  })();

  const getShiftData = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const daySchedule = schedule[dateStr];

    if (!daySchedule) return { morning: [], middle: [], evening: [] };

    return {
      morning: daySchedule.morning?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || [],
      middle: daySchedule.middle?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || [],
      evening: daySchedule.evening?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || []
    };
  };

  const exportToExcel = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    // Create CSV content
    let csvContent = '\uFEFF'; // BOM for UTF-8
    csvContent += `Jadwal Barista - ${monthName}\n\n`;
    csvContent += 'Tanggal,Hari,Shift Pagi (09:00-17:00),Shift Siang (12:00-20:00),Shift Sore (17:00-23:59)\n';
    
    daysInMonth.forEach(day => {
      const dateObj = new Date(year, month, day);
      const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
      const shiftData = getShiftData(day);
      
      const morningStaff = shiftData.morning.map(b => b.name).join(', ') || '-';
      const middleStaff = shiftData.middle.map(b => b.name).join(', ') || '-';
      const eveningStaff = shiftData.evening.map(b => b.name).join(', ') || '-';
      
      csvContent += `${day} ${currentDate.toLocaleDateString('id-ID', { month: 'short' })},${dayName},"${morningStaff}","${middleStaff}","${eveningStaff}"\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Jadwal_Barista_${monthName.replace(' ', '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('✓ Jadwal berhasil diexport!\n\nFile dapat dibuka dengan Excel.');
  };

  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const isCurrentMonth = new Date().getMonth() === currentDate.getMonth() && 
                         new Date().getFullYear() === currentDate.getFullYear();

  const scrollToToday = () => {
    if (todayCardRef.current) {
      todayCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px',
        color: 'var(--color-text-muted)'
      }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: 'var(--spacing-sm)' }}>Memuat jadwal...</span>
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
      {/* Header with month navigation */}
      <div style={{ 
        marginBottom: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)'
      }}>
        {/* Month navigation row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={goToPreviousMonth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-bg-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
              e.currentTarget.style.color = 'var(--color-accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <ChevronLeft size={18} />
            Sebelumnya
          </button>
          
          <h2 style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-xl)', 
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)'
          }}>
            <CalendarIcon color="var(--color-accent-primary)" />
            {monthName}
          </h2>

          <button
            onClick={goToNextMonth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-bg-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
              e.currentTarget.style.color = 'var(--color-accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            Selanjutnya
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Action buttons row */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          justifyContent: 'center'
        }}>
          {isCurrentMonth && (
            <button 
              onClick={scrollToToday}
              style={{ 
                padding: 'var(--spacing-xs) var(--spacing-md)',
                background: 'var(--color-accent-primary)',
                color: '#000',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600
              }}>
              Hari Ini
            </button>
          )}
          
          {!isCurrentMonth && (
            <button 
              onClick={goToCurrentMonth}
              style={{ 
                padding: 'var(--spacing-xs) var(--spacing-md)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-bg-tertiary)',
                color: 'var(--color-text-secondary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500
              }}>
              Kembali ke Bulan Ini
            </button>
          )}
          
          <button 
            onClick={exportToExcel}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: 'var(--spacing-xs) var(--spacing-md)',
              background: '#22c55e',
              color: '#fff',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#16a34a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#22c55e';
            }}
          >
            <Download size={16} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Schedule cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {daysInMonth.map(day => {
            const shiftData = getShiftData(day);
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const today = new Date();
            const isToday = today.getDate() === day && 
                           today.getMonth() === currentDate.getMonth() && 
                           today.getFullYear() === currentDate.getFullYear();
            const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

            return (
              <div 
                key={day} 
                ref={isToday ? todayCardRef : null} 
                style={{
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: 'var(--spacing-md)',
                  border: isToday ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-bg-tertiary)',
                }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 'var(--spacing-sm)',
                  paddingBottom: 'var(--spacing-sm)',
                  borderBottom: '1px solid var(--color-bg-tertiary)'
                }}>
                  <div>
                    <span style={{ 
                      fontSize: 'var(--font-size-lg)', 
                      fontWeight: 600,
                      color: isWeekend ? 'var(--color-accent-primary)' : 'var(--color-text-primary)'
                    }}>
                      {dayName}, {day}
                    </span>
                    {isToday && (
                      <span style={{
                        marginLeft: 'var(--spacing-sm)',
                        padding: '2px 8px',
                        background: 'var(--color-accent-primary)',
                        color: '#000',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600
                      }}>
                        Hari Ini
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                  {shifts.map(shift => {
                    const shiftStaff = shiftData[shift.id] || [];
                    return (
                      <div key={shift.id} style={{ 
                        background: 'var(--color-bg-primary)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: 'var(--spacing-sm)'
                      }}>
                        <div style={{ 
                          fontSize: 'var(--font-size-sm)', 
                          color: 'var(--color-accent-primary)',
                          fontWeight: 500,
                          marginBottom: 'var(--spacing-xs)'
                        }}>
                          {shift.label} ({shift.time})
                        </div>
                        {shiftStaff.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {shiftStaff.map(barista => (
                              <div key={barista.id} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                padding: '2px 6px',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--border-radius-sm)',
                                fontSize: 'var(--font-size-xs)'
                              }}>
                                <img 
                                  src={barista.avatar} 
                                  alt={barista.name}
                                  style={{ width: '16px', height: '16px', borderRadius: '50%' }}
                                />
                                {barista.name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            Belum ada jadwal
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
}
