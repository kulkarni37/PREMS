import {
  PiShieldCheck,
  PiLayout,
  PiUsers,
  PiUploadSimple,
  PiKey,
  PiKanban,
  PiChalkboardTeacher,
  PiGridFour,
  PiCalendarBlank,
  PiStarBold,
  PiFileText,
  PiMegaphone,
  PiClockCounterClockwise,
  PiGear,
  PiSignOut,
  PiX,
  PiGraduationCap,
  PiUsersThree,
  PiFolderSimple,
} from 'react-icons/pi';

import logo from '../../assets/logo.png';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  isOpen,
  onClose,
  unreadCount = 0,
}) {
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: <PiLayout /> },
    { id: 'students', label: 'Student Management', icon: <PiGraduationCap /> },
    { id: 'faculty', label: 'Guide / Faculty', icon: <PiChalkboardTeacher /> },
    { id: 'coordinators', label: 'Coordinators', icon: <PiShieldCheck /> },
    { id: 'teams', label: 'Team Management', icon: <PiUsersThree /> },
    { id: 'domains', label: 'Project & Domain', icon: <PiGridFour /> },
    { id: 'allocations', label: 'Guide Allocation', icon: <PiKanban /> },
    { id: 'reviews', label: 'Review Management', icon: <PiCalendarBlank /> },
    { id: 'documents', label: 'Document Management', icon: <PiFolderSimple /> },
    { id: 'evaluations', label: 'Evaluation & Marks', icon: <PiStarBold /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <PiFileText /> },
    { id: 'notifications', label: 'Notifications', icon: <PiMegaphone />, badge: unreadCount },
    { id: 'system-users', label: 'User & System Accounts', icon: <PiGear /> },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className={`ad-sidebar ${isOpen ? 'ad-sidebar--open' : ''}`}>
      <div className="ad-sidebar__head">
        <div className="ad-sidebar__logo-mark">
          <img src={logo} alt="PRMES Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="ad-sidebar__brand-text">
          <span className="ad-sidebar__brand-title">PRMES</span>
          <span className="ad-sidebar__brand-sub">Admin Control</span>
        </div>
        {isOpen && (
          <button className="sd-modal__close" style={{ top: 18, right: 12 }} onClick={onClose}>
            <PiX />
          </button>
        )}
      </div>

      <nav className="ad-sidebar__nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`ad-nav-item ${isActive ? 'ad-nav-item--active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="ad-nav-item__icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="ad-nav-item__badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="ad-sidebar__footer">
        <div className="ad-user-mini">
          <div className="ad-avatar">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="ad-user-mini__info">
            <span className="ad-user-mini__name">{user?.full_name || 'System Administrator'}</span>
            <span className="ad-user-mini__role">ADMIN</span>
          </div>
        </div>

        <button
          className="gd-logout-btn"
          onClick={onLogout}
          title="Logout of PRMES Admin"
          aria-label="Logout"
        >
          <PiSignOut />
        </button>
      </div>
    </aside>
  );
}
