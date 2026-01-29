import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Admin from './pages/Admin';
import './styles/global.css';

// Simple Navigation Component
function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--color-bg-secondary)',
      borderTop: '1px solid var(--color-bg-tertiary)',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 100
    }}>
      <Link to="/" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: isActive('/') ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-sm)',
        gap: '4px'
      }}>
        <Home size={24} />
        <span>Dashboard</span>
      </Link>
      <Link to="/schedule" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: isActive('/schedule') ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-sm)',
        gap: '4px'
      }}>
        <Calendar size={24} />
        <span>Jadwal</span>
      </Link>
      <Link to="/admin" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: isActive('/admin') ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-sm)',
        gap: '4px'
      }}>
        <Settings size={24} />
        <span>Admin</span>
      </Link>
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
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
