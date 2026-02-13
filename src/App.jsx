import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Settings, ClipboardCheck } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Admin from './pages/Admin';
import StockOpname from './pages/StockOpname';
import StockHistory from './pages/StockHistory';
import './styles/global.css';

// Simple Navigation Component
function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/schedule', icon: Calendar, label: 'Jadwal' },
    { path: '/stock-opname', icon: ClipboardCheck, label: 'Stock' },
    { path: '/admin', icon: Settings, label: 'Admin' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--color-bg-secondary)',
      borderTop: '1px solid var(--color-bg-tertiary)',
      padding: 'var(--spacing-sm)',
      display: 'flex',
      justifyContent: 'space-around',
      gap: 'var(--spacing-xs)',
      zIndex: 100,
      overflowX: 'auto'
    }}>
      {navItems.map(item => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <Link key={item.path} to={item.path} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: active ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            gap: '4px',
            minWidth: '60px',
            padding: 'var(--spacing-xs)'
          }}>
            <Icon size={22} />
            <span style={{ fontSize: '0.75rem' }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <header style={{
        padding: 'var(--spacing-md)',
        background: 'rgba(15, 17, 21, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--color-bg-tertiary)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: 'var(--font-size-xl)', 
          color: 'var(--color-accent-primary)',
          fontWeight: 600
        }}>
          Olsen Caffeine Supply Barista
        </h1>
      </header>
      <main style={{ padding: 'var(--spacing-md)' }}>
        {children}
      </main>
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/stock-opname" element={<StockOpname />} />
          <Route path="/stock-history" element={<StockHistory />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
