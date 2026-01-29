import { Clock, User } from 'lucide-react';

export default function ShiftCard({ title, time, staff, type = 'default' }) {
  const isMorning = type === 'morning';
  const accentColor = isMorning ? 'var(--color-accent-secondary)' : 'var(--color-accent-primary)';
  
  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      borderRadius: 'var(--border-radius-md)',
      padding: 'var(--spacing-md)',
      border: '1px solid var(--color-bg-tertiary)',
      marginBottom: 'var(--spacing-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-sm)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${isMorning ? 'rgba(250, 237, 205, 0.1)' : 'rgba(212, 163, 115, 0.1)'}`,
        paddingBottom: 'var(--spacing-xs)',
        marginBottom: 'var(--spacing-xs)'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: 'var(--font-size-base)', 
          color: accentColor,
          fontWeight: 600
        }}>
          {title}
        </h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          color: 'var(--color-text-secondary)', 
          fontSize: 'var(--font-size-sm)' 
        }}>
          <Clock size={14} />
          <span>{time}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {staff.map((person) => (
          <div key={person.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <img 
              src={person.avatar} 
              alt={person.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid var(--color-bg-tertiary)'
              }}
            />
            <div>
              <div style={{ fontWeight: 500 }}>{person.name}</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{person.role}</div>
            </div>
          </div>
        ))}
        {staff.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: 'var(--font-size-sm)' }}>
            Belum ada jadwal
          </div>
        )}
      </div>
    </div>
  );
}
