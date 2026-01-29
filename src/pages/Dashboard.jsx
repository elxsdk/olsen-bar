import { useState, useEffect } from 'react';
import { getSchedule, getBaristas, shifts } from '../data/mockData';
import ShiftCard from '../components/ShiftCard';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [showTomorrow, setShowTomorrow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [baristas, setBaristas] = useState([]);
  const [schedule, setSchedule] = useState({});
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [baristasData, scheduleData] = await Promise.all([
          getBaristas(),
          getSchedule()
        ]);
        setBaristas(baristasData);
        setSchedule(scheduleData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getShiftData = (dateStr) => {
    const dailySchedule = schedule[dateStr];
    
    if (!dailySchedule) return { morning: [], middle: [], evening: [] };

    return {
      morning: dailySchedule.morning?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || [],
      middle: dailySchedule.middle?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || [],
      evening: dailySchedule.evening?.map(id => baristas.find(b => b.id === id)).filter(Boolean) || []
    };
  };

  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);

  const todayShifts = getShiftData(todayStr);
  const tomorrowShifts = getShiftData(tomorrowStr);

  const morningShiftInfo = shifts.find(s => s.id === 'morning');
  const middleShiftInfo = shifts.find(s => s.id === 'middle');
  const eveningShiftInfo = shifts.find(s => s.id === 'evening');

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
          title="Shift Siang" 
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-xs)',
          width: '100%',
          padding: 'var(--spacing-sm)',
          background: 'var(--color-bg-secondary)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-bg-tertiary)',
          borderRadius: 'var(--border-radius-md)',
          fontSize: 'var(--font-size-sm)',
          marginBottom: 'var(--spacing-md)',
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
        {showTomorrow ? <ChevronUp size={18} /> : <ChevronDown size={18} /> }
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
            <span>Jadwal Besok</span>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 400 }}>
              {tomorrow.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </h2>
          
          <ShiftCard 
            title="Shift Pagi" 
            time={morningShiftInfo.time} 
            staff={tomorrowShifts.morning} 
            type="morning"
          />
          <ShiftCard 
            title="Shift Siang" 
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
        </section>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
