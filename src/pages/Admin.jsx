import { useState, useEffect } from 'react';
import { Users, CalendarDays, Lock } from 'lucide-react';
import BaristaManager from '../components/BaristaManager';
import ScheduleAssigner from '../components/ScheduleAssigner';

const ADMIN_PASSWORD = 'admin123'; // Simple password for demo

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('schedule');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Check if already authenticated in session
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
    } else {
      setError('Password salah!');
      setPassword('');
    }
  };

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Reordered tabs: Schedule first, then Baristas
  const tabs = [
    { id: 'schedule', label: 'Atur Jadwal', icon: CalendarDays },
    { id: 'baristas', label: 'Kelola Barista', icon: Users }
  ];

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          padding: 'var(--spacing-xl)',
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--color-bg-tertiary)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <Lock size={48} color="var(--color-accent-primary)" style={{ marginBottom: 'var(--spacing-sm)' }} />
            <h2 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-xl)' }}>
              Admin Panel
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Masukkan password untuk akses
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  background: 'var(--color-bg-primary)',
                  border: error ? '1px solid #dc2626' : '1px solid var(--color-bg-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-base)'
                }}
              />
              {error && (
                <p style={{
                  margin: 'var(--spacing-xs) 0 0 0',
                  color: '#dc2626',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: 'var(--spacing-sm)',
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
              Masuk
            </button>

            <p style={{
              marginTop: 'var(--spacing-md)',
              textAlign: 'center',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)'
            }}>
              Password: admin123
            </p>
          </form>
        </div>
      </div>
    );
  }

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
        <h2 style={{
          margin: '0 0 var(--spacing-xs) 0',
          fontSize: 'var(--font-size-xl)',
          color: 'var(--color-accent-primary)'
        }}>
          Admin Panel
        </h2>
        <p style={{
          margin: 0,
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-base)'
        }}>
          Kelola daftar barista dan atur jadwal piket mereka
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-xs)',
        marginBottom: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--color-bg-tertiary)',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                background: 'transparent',
                color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                borderBottom: isActive ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                fontSize: 'var(--font-size-base)',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div key={refreshKey}>
        {activeTab === 'schedule' && (
          <ScheduleAssigner onDataChange={handleDataChange} />
        )}
        
        {activeTab === 'baristas' && (
          <BaristaManager onDataChange={handleDataChange} />
        )}
      </div>
    </div>
  );
}
