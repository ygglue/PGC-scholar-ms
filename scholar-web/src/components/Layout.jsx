import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox as InboxIcon, User, LogOut, MoreVertical } from 'lucide-react';
import '../index.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={24} /> },
    { path: '/inbox', label: 'Inbox', icon: <InboxIcon size={24} /> },
    { path: '/profile', label: 'Profile', icon: <User size={24} /> }
  ];

  return (
    <div className="dashboard-layout">
      {/* Mobile Top Bar */}
      <div className="mobile-topbar glass-nav">
         <div className="headline-sm" style={{color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans'}}>Luminary</div>
         <button className="btn-ghost" style={{padding: '0.25rem'}} onClick={() => setMenuOpen(!menuOpen)}>
           <MoreVertical size={24} color="var(--on-surface)"/>
         </button>
      </div>

      {menuOpen && (
        <div style={{position: 'fixed', top: '70px', right: '1.5rem', background: 'var(--surface-lowest)', zIndex: 60, padding: '1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--ambient-shadow)', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          <button className="btn-ghost" onClick={handleLogout} style={{color: '#d32f2f', textAlign: 'left', width: '100%', padding: '0.5rem 1rem'}}>
            <LogOut size={16} style={{display: 'inline', marginRight: '0.5rem', marginBottom: '-2px'}}/> Sign Out
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav">
         {navItems.map(item => (
           <button 
              key={item.path}
              className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
           >
               {item.icon}
               <span>{item.label}</span>
           </button>
         ))}
      </div>

      {/* Desktop Sidebar */}
      <nav className="dashboard-sidebar">
        <div className="headline-sm" style={{marginBottom: '4rem', color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans'}}>Luminary</div>
        <div className="nav-links">
           {navItems.map(item => {
               const isActive = location.pathname === item.path;
               return (
                   <button 
                     key={item.path}
                     className={isActive ? "btn-primary" : "btn-ghost"} 
                     style={{
                       textAlign: 'left', 
                       width: '100%', 
                       ...(isActive ? {borderRadius: 'var(--radius-md)', background: 'var(--surface-highest)', color: 'var(--primary)', fontWeight: 'bold'} : {color: 'var(--on-surface-variant)'})
                     }}
                     onClick={() => navigate(item.path)}
                   >
                     {item.label}
                   </button>
               )
           })}
        </div>
        <div style={{marginTop: 'auto'}}>
          <button className="btn-ghost" onClick={handleLogout} style={{textAlign: 'left', width: '100%', color: '#d32f2f'}}>
             <LogOut size={18} style={{display: 'inline', marginRight: '0.5rem', marginBottom: '-4px'}}/> Sign Out
          </button>
        </div>
      </nav>
      
      <main className="main-content">
         {children}
      </main>
    </div>
  );
};

export default Layout;
