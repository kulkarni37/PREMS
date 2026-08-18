import { motion } from 'framer-motion';
import {
  PiCircuitry,
  PiLayout,
  PiUsersThree,
  PiKanban,
  PiGridFour,
  PiChalkboardTeacher,
  PiFolderSimple,
  PiChartLineUp,
  PiBookBookmark,
  PiBell,
  PiSignOut,
  PiX,
} from 'react-icons/pi';

export default function StudentSidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  isOpen,
  onClose,
  unreadCount = 0,
}) {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <PiLayout /> },
    { id: 'team', label: 'My Team', icon: <PiUsersThree /> },
    { id: 'diary', label: 'Daily Diary', icon: <PiBookBookmark /> },
    { id: 'progress', label: 'Workflow', icon: <PiKanban /> },
    { id: 'domain', label: 'Project Domain', icon: <PiGridFour /> },
    { id: 'guide', label: 'Project Guide', icon: <PiChalkboardTeacher /> },
    { id: 'documents', label: 'Documents', icon: <PiFolderSimple /> },
    { id: 'reviews', label: 'Reviews & Marks', icon: <PiChartLineUp /> },
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
    <aside className={`sd-sidebar ${isOpen ? 'sd-sidebar--open' : ''}`}>
      <div className="sd-sidebar__head">
        <div className="sd-sidebar__logo-mark">
          <PiCircuitry />
        </div>
        <div className="sd-sidebar__brand-text">
          <span className="sd-sidebar__brand-title">PRMES</span>
          <span className="sd-sidebar__brand-sub">Student Portal</span>
        </div>
        {isOpen && (
          <button className="sd-modal__close" style={{ top: 18, right: 12 }} onClick={onClose}>
            <PiX />
          </button>
        )}
      </div>

      <nav className="sd-sidebar__nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sd-nav-item ${isActive ? 'sd-nav-item--active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="sd-nav-item__icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="sd-nav-item__badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sd-sidebar__footer">
        <div className="sd-user-mini">
          <div className="sd-avatar">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="sd-user-mini__info">
            <span className="sd-user-mini__name">{user?.full_name || 'Student Name'}</span>
            <span className="sd-user-mini__id">{user?.student_id || 'PRMES-STU-2026-0001'}</span>
          </div>
        </div>

        <button
          className="sd-logout-btn"
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
