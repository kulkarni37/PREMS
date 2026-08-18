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
} from 'react-icons/pi';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  isOpen,
  onClose,
  unreadCount = 3,
}) {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <PiLayout /> },
    { id: 'users', label: 'User Management', icon: <PiUsers /> },
    { id: 'import', label: 'Faculty Import', icon: <PiUploadSimple /> },
    { id: 'roles', label: 'Role & Access', icon: <PiKey /> },
    { id: 'projects', label: 'Project Management', icon: <PiKanban /> },
    { id: 'guides', label: 'Guide Allocation', icon: <PiChalkboardTeacher /> },
    { id: 'domains', label: 'Project Domains', icon: <PiGridFour /> },
    { id: 'reviews', label: 'Academic Reviews', icon: <PiCalendarBlank /> },
    { id: 'announcements', label: 'Announcements', icon: <PiMegaphone />, badge: unreadCount },
    { id: 'reports', label: 'Reports & Analytics', icon: <PiFileText /> },
    { id: 'activity', label: 'System Audit Log', icon: <PiClockCounterClockwise /> },
    { id: 'settings', label: 'System Settings', icon: <PiGear /> },
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
          <PiShieldCheck />
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
            <span className="ad-user-mini__role">SUPER ADMIN</span>
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
