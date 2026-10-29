import { useNavigate } from 'react-router-dom';
import { PiBell, PiList } from 'react-icons/pi';

export default function CoordinatorHeader({
  user,
  onLogout,
  onToggleMobileSidebar,
  unreadCount = 5,
  onOpenNotifications,
}) {
  const navigate = useNavigate();
  const userRoles = (user?.roles || [user?.role || 'COORDINATOR']).map(r => r.toUpperCase());

  return (
    <header className="cd-header">
      <div className="cd-header__title-area">
        <span className="cd-header__breadcrumb">Department Academic Control Center</span>
        <h1 className="cd-header__title">PRMES Coordinator Portal</h1>
      </div>

      <div className="cd-header__actions">
        {/* Workspace Switcher for Multi-Role Users */}
        {userRoles.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', borderRadius: 'var(--radius-sm)', padding: '4px 10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>Workspace:</span>
            <select
              value="COORDINATOR"
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'GUIDE') navigate('/guide/dashboard');
                else if (val === 'ADMIN') navigate('/admin/dashboard');
                else if (val === 'STUDENT' || val === 'TEAM_LEADER') navigate('/student/dashboard');
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
            >
              {userRoles.map(r => (
                <option key={r} value={r} style={{ background: '#121824', color: '#fff' }}>
                  {r === 'COORDINATOR' ? 'Coordinator' : r === 'GUIDE' ? 'Faculty Guide' : r === 'ADMIN' ? 'Admin' : 'Student'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Coordinator Metadata Pill */}
        <div className="cd-header__pill">
          <span className="cd-header__pill-item">
            ID: <strong>{user?.coordinator_id || 'PRMES-CRD-2026-001'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="cd-header__pill-item">
            Year: <strong>{user?.academic_year || '2026–27'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="cd-header__pill-item">
            Sem: <strong>{user?.semester || '7th Semester'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="cd-header__pill-item">
            Dept: <strong>{user?.department || 'CSE'}</strong>
          </span>
        </div>

        {/* Notifications Icon */}
        <button
          className="cd-icon-btn"
          onClick={onOpenNotifications}
          title="Notifications"
          aria-label="View notifications"
        >
          <PiBell />
          {unreadCount > 0 && <span className="cd-icon-btn__badge" />}
        </button>

        {/* Avatar */}
        <div className="cd-avatar" style={{ cursor: 'pointer' }} title={user?.full_name || 'Prof. Coordinator Name'}>
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'C'}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="cd-icon-btn cd-mobile-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <PiList />
        </button>
      </div>
    </header>
  );
}
