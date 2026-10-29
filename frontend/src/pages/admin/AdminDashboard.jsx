import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStats from '../../components/admin/AdminStats';
import DepartmentManagement from '../../components/admin/DepartmentManagement';
import UserManagement from '../../components/admin/UserManagement';
import FacultyImport from '../../components/admin/FacultyImport';
import ProjectOverview from '../../components/admin/ProjectOverview';
import GuideAllocationManagement from '../../components/admin/GuideAllocationManagement';
import DomainManagement from '../../components/admin/DomainManagement';
import PastProjectsTable from '../../components/admin/PastProjectsTable';
import SystemAlerts from '../../components/admin/SystemAlerts';
import Announcements from '../../components/admin/Announcements';
import SystemHealth from '../../components/admin/SystemHealth';
import ReportsAnalytics from '../../components/admin/ReportsAnalytics';
import AdminSettingsModal from '../../components/admin/AdminSettingsModal';
import CoordinatorTeamDetailModal from '../../components/coordinator/CoordinatorTeamDetailModal';

import {
  fetchAdminDashboard
} from '../../services/api';

import '../../styles/admin-dashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('prmes_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'ADMIN' || parsed.role === 'admin' || parsed.admin_id) {
          return parsed;
        }
      } catch (e) {}
    }
    return null;
  });

  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    coordinators: 0,
    teams: 0,
    activeProjects: 0,
    guidesAssigned: 0,
    pendingAllocations: 0,
    pendingEvaluations: 0,
  });

  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [health, setHealth] = useState([]);
  const [guides, setGuides] = useState([]);

  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const loadAdminData = async () => {
    const email = user?.email || user?.student_id;
    const adminId = user?.admin_id || user?.student_id;
    const dbData = await fetchAdminDashboard(email, adminId);

    if (dbData && dbData.success) {
      if (dbData.user) setUser((prev) => ({ ...prev, ...dbData.user }));
      if (dbData.stats) setStats(dbData.stats);
      if (dbData.teams) setTeams(dbData.teams);
      if (dbData.departments) setDepartments(dbData.departments);
      if (dbData.health) setHealth(dbData.health);
      if (dbData.guides) setGuides(dbData.guides);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('prmes_user');
    navigate('/login');
  };

  return (
    <div className="ad-layout">
      <div className="blueprint-grid" style={{ opacity: 0.7 }} />

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        unreadCount={0}
      />

      <div className="ad-main">
        <AdminHeader
          user={user}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          unreadCount={0}
          onOpenNotifications={() => {
            setActiveTab('announcements');
            document.getElementById('announcements')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <div className="ad-content">
          {/* Welcome Card Section */}
          <motion.div
            className="ad-welcome-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ad-welcome-card__glow" />
            <div className="ad-welcome-card__text">
              <h2 className="ad-welcome-card__title">
                Welcome, {user?.full_name || 'Administrator'} 👋
              </h2>
              <p className="ad-welcome-card__sub">
                Managing <strong>{user?.college || 'Registered Organization'}</strong> ({user?.institution_code || 'PRMES'}).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span className="sd-welcome-card__status-pill">
                Institution: {user?.institution_code || 'GNDEC'}
              </span>
              <span className="ad-health-badge">
                <span className="ad-health-dot" /> Operational
              </span>
            </div>
          </motion.div>

          {/* 8 System Statistics Cards */}
          <AdminStats stats={stats} />

          {/* System Architecture Health */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <SystemHealth health={health} />
          </motion.div>

          {/* Department Management Section */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}>
            <DepartmentManagement user={user} departments={departments} onDepartmentAdded={loadAdminData} />
          </motion.div>

          {/* User Account Management */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <UserManagement adminUser={user} />
          </motion.div>

          {/* Faculty Account Batch Import */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
            <FacultyImport />
          </motion.div>

          {/* System-Wide Project Overview */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
            <ProjectOverview teams={teams} onSelectTeam={(t) => setSelectedTeam(t)} />
          </motion.div>

          {/* Guide Allocation Control Rules */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <GuideAllocationManagement adminUser={user} />
          </motion.div>

          {/* Academic Project Domains */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
            <DomainManagement adminUser={user} />
          </motion.div>

          {/* 5-Year Past Project Repository */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.48 }}>
            <PastProjectsTable />
          </motion.div>

          {/* 2-Column Grid: Alerts & Announcements */}
          <div className="sd-grid-2">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <SystemAlerts />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}>
              <Announcements />
            </motion.div>
          </div>

          {/* Reports & Analytics */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
            <ReportsAnalytics />
          </motion.div>
        </div>
      </div>

      <AdminSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <CoordinatorTeamDetailModal isOpen={Boolean(selectedTeam)} onClose={() => setSelectedTeam(null)} team={selectedTeam} />
    </div>
  );
}
