import {
  PiCircuitry,
  PiLayout,
  PiUsersThree,
  PiKanban,
  PiFolderSimple,
  PiStarBold,
  PiChatCircleText,
  PiBell,
  PiUserCircle,
  PiSignOut,
  PiX,
} from 'react-icons/pi';

export default function GuideSidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  isOpen,
  onClose,
  unreadCount = 4,
}) {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <PiLayout /> },
    { id: 'teams', label: 'My Teams', icon: <PiUsersThree /> },
    { id: 'documents', label: 'Pending Reviews', icon: <PiFolderSimple /> },
    { id: 'evaluations', label: 'Evaluations', icon: <PiStarBold /> },
    { id: 'feedback', label: 'Recent Feedback', icon: <PiChatCircleText /> },
    { id: 'notifications', label: 'Notifications', icon: <PiBell />, badge: unreadCount },
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
    <aside className={`gd-sidebar ${isOpen ? 'gd-sidebar--open' : ''}`}>
      <div className="gd-sidebar__head">
        <div className="gd-sidebar__logo-mark">
          <PiCircuitry />
        </div>
        <div className="gd-sidebar__brand-text">
          <span className="gd-sidebar__brand-title">PRMES</span>
          <span className="gd-sidebar__brand-sub">Guide Portal</span>
        </div>
        {isOpen && (
          <button className="sd-modal__close" style={{ top: 18, right: 12 }} onClick={onClose}>
            <PiX />
          </button>
        )}
      </div>

      <nav className="gd-sidebar__nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`gd-nav-item ${isActive ? 'gd-nav-item--active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="gd-nav-item__icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="gd-nav-item__badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="gd-sidebar__footer">
        <div className="gd-user-mini">
          <div className="gd-avatar">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'G'}
          </div>
          <div className="gd-user-mini__info">
            <span className="gd-user-mini__name">{user?.full_name || 'Dr. Faculty Name'}</span>
            <span className="gd-user-mini__desig">{user?.designation || 'Assistant Professor'}</span>
          </div>
        </div>

        <button
          className="gd-logout-btn"
          onClick={onLogout}
          title="Logout of PRMES"
          aria-label="Logout"
        >
          <PiSignOut />
        </button>
      </div>
    </aside>
  );
}
