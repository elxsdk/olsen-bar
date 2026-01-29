import { useMemo, useState } from 'react';
import { currentMonthSchedule, baristas, shifts } from '../data/mockData';
import ShiftCard from '../components/ShiftCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Dashboard() {
  const [showTomorrow, setShowTomorrow] = useState(false);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getShiftData = (dateStr) => {
    const dailySchedule = currentMonthSchedule[dateStr];
    
    if (!dailySchedule) return { morning: [], middle: [], evening: [] };

    return {
      morning: dailySchedule.morning?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || [],
      middle: dailySchedule.middle?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || [],
      evening: dailySchedule.evening?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || []
    };
  };

  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);

  const todayShifts = useMemo(() => getShiftData(todayStr), [todayStr]);
  const tomorrowShifts = useMemo(() => getShiftData(tomorrowStr), [tomorrowStr]);

  const morningShiftInfo = shifts.find(s => s.id === 'morning');
  const middleShiftInfo = shifts.find(s => s.id === 'middle');
  const eveningShiftInfo = shifts.find(s => s.id === 'evening');

  return (
    <div>
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ 
          fontSize: 'var(--font-size-lg)', 
          marginBottom: 'var(--spacing-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline'
        }}>
          <span>Jadwal Hari Ini</span>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 400 }}>
            {today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </h2>
        
        <ShiftCard 
          title="Shift Pagi" 
          time={morningShiftInfo.time} 
          staff={todayShifts.morning} 
          type="morning"
        />
        <ShiftCard 
          title="Shift siang" 
          time={middleShiftInfo.time} 
          staff={todayShifts.middle} 
          type="middle"
        />
        <ShiftCard 
          title="Shift Sore" 
          time={eveningShiftInfo.time} 
          staff={todayShifts.evening} 
          type="evening"
        />
      </section>

      <button
        onClick={() => setShowTomorrow(!showTomorrow)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-xs)',
          padding: 'var(--spacing-sm)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-bg-tertiary)',
          borderRadius: 'var(--border-radius-md)',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 500,
          marginBottom: 'var(--spacing-md)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-bg-tertiary)';
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }}
      >
        {showTomorrow ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        {showTomorrow ? 'Sembunyikan Jadwal Besok' : 'Lihat Jadwal Besok'}
      </button>

      {showTomorrow && (
        <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ 
            fontSize: 'var(--font-size-lg)', 
            marginBottom: 'var(--spacing-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline'
          }}>
            <span>Besok</span>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 400 }}>
              {tomorrow.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </h2>
          
          <div>
            <ShiftCard 
              title="Shift Pagi" 
              time={morningShiftInfo.time} 
              staff={tomorrowShifts.morning} 
              type="morning"
            />
            <ShiftCard 
              title="Shift siang" 
              time={middleShiftInfo.time} 
              staff={tomorrowShifts.middle} 
              type="middle"
            />
            <ShiftCard 
              title="Shift Sore" 
              time={eveningShiftInfo.time} 
              staff={tomorrowShifts.evening} 
              type="evening"
            />
          </div>
        </section>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
