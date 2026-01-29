import { useState, useMemo, useRef, useEffect } from 'react';
import { currentMonthSchedule, baristas, shifts } from '../data/mockData';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Schedule() {
  const [currentDate] = useState(new Date());
  const todayCardRef = useRef(null);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  }, [currentDate]);

  const getShiftData = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const schedule = currentMonthSchedule[dateStr];

    if (!schedule) return { morning: [], middle: [], evening: [] };

    return {
      morning: schedule.morning?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || [],
      middle: schedule.middle?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || [],
      evening: schedule.evening?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || []
    };
  };

  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const scrollToToday = () => {
    if (todayCardRef.current) {
      todayCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div>
       <div style={{ 
        marginBottom: 'var(--spacing-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
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
          onClick={scrollToToday}
          style={{ 
            padding: 'var(--spacing-xs) var(--spacing-sm)', 
            background: 'var(--color-accent-primary)',
            color: '#000',
            borderRadius: 'var(--border-radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#c89563'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-accent-primary)'}
        >
          Hari Ini
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {daysInMonth.map(day => {
            const schedule = getShiftData(day);
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = new Date().toDateString() === dateObj.toDateString();
            const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
            const fullDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            return (
              <div 
                key={day} 
                ref={isToday ? todayCardRef : null}
                style={{
                background: 'var(--color-bg-secondary)',
                borderRadius: 'var(--border-radius-md)',
                border: isToday ? '1px solid var(--color-accent-primary)' : '1px solid var(--color-bg-tertiary)',
                padding: 'var(--spacing-md)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 'var(--spacing-md)',
                  borderBottom: '1px solid var(--color-bg-tertiary)',
                  paddingBottom: 'var(--spacing-sm)'
                }}>
                  <div>
                    <span style={{ 
                      display: 'block', 
                      fontWeight: 600, 
                      fontSize: 'var(--font-size-lg)',
                      color: isToday ? 'var(--color-accent-primary)' : 'var(--color-text-primary)'
                    }}>
                      {dayName}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                      {fullDate}
                    </span>
                  </div>
                  {isToday && (
                    <span style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      background: 'var(--color-accent-primary)', 
                      color: 'var(--color-bg-primary)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600
                    }}>
                      Hari Ini
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                  {/* Pagi */}
                  <div>
                    <h4 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Pagi</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {schedule.morning.length > 0 ? schedule.morning.map(staff => (
                        <div key={staff.id} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '4px 8px',
                          borderRadius: '100px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          fontSize: 'var(--font-size-sm)'
                        }}>
                          <img src={staff.avatar} style={{ width: '20px', height: '20px', borderRadius: '50%' }} alt="" />
                          <span>{staff.name}</span>
                        </div>
                      )) : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontStyle: 'italic' }}>-</span>}
                    </div>
                  </div>

                  {/* Siang */}
                   <div>
                    <h4 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Siang</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {schedule.middle.length > 0 ? schedule.middle.map(staff => (
                        <div key={staff.id} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '4px 8px',
                          borderRadius: '100px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          fontSize: 'var(--font-size-sm)'
                        }}>
                          <img src={staff.avatar} style={{ width: '20px', height: '20px', borderRadius: '50%' }} alt="" />
                          <span>{staff.name}</span>
                        </div>
                      )) : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontStyle: 'italic' }}>-</span>}
                    </div>
                  </div>

                  {/* Sore */}
                  <div>
                    <h4 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Sore</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {schedule.evening.length > 0 ? schedule.evening.map(staff => (
                        <div key={staff.id} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '4px 8px',
                          borderRadius: '100px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          fontSize: 'var(--font-size-sm)'
                        }}>
                          <img src={staff.avatar} style={{ width: '20px', height: '20px', borderRadius: '50%' }} alt="" />
                          <span>{staff.name}</span>
                        </div>
                      )) : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontStyle: 'italic' }}>-</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
}
