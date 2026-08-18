import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import CoordinatorSidebar from '../../components/coordinator/CoordinatorSidebar';
import CoordinatorHeader from '../../components/coordinator/CoordinatorHeader';
import CoordinatorStats from '../../components/coordinator/CoordinatorStats';
import BatchProgressOverview from '../../components/coordinator/BatchProgressOverview';
import ProjectTeamsTable from '../../components/coordinator/ProjectTeamsTable';
import GuideAllocationTable from '../../components/coordinator/GuideAllocationTable';
import ReviewScheduleCard from '../../components/coordinator/ReviewScheduleCard';
import ReviewCalendarCard from '../../components/coordinator/ReviewCalendarCard';
import DocumentOverview from '../../components/coordinator/DocumentOverview';
import EvaluationStatusCard from '../../components/coordinator/EvaluationStatusCard';
import AtRiskProjectsCard from '../../components/coordinator/AtRiskProjectsCard';
import DomainDistributionCard from '../../components/coordinator/DomainDistributionCard';
import CoordinatorNotifications from '../../components/coordinator/CoordinatorNotifications';
import RecentActivityTimeline from '../../components/coordinator/RecentActivityTimeline';
import ReportsCard from '../../components/coordinator/ReportsCard';
import CoordinatorTeamDetailModal from '../../components/coordinator/CoordinatorTeamDetailModal';

import {
  fetchCoordinatorDashboard,
  fetchCoordinatorTeams,
  fetchCoordinatorGuides,
  fetchCoordinatorDocuments,
  fetchCoordinatorEvaluations,
} from '../../services/api';

import '../../styles/coordinator-dashboard.css';

/* ===================================================================
   TEMPORARY MOCK COORDINATOR DATA FOR DEVELOPMENT PREVIEW
   -------------------------------------------------------------------
   NOTE: This mock object provides instant preview access at /coordinator/dashboard
   without requiring coordinator registration/login.
   Replace or remove this block when real coordinator authentication is connected.
   =================================================================== */
const DEV_MOCK_COORDINATOR_PROFILE = {
  coordinator_id: 'PRMES-CRD-2026-001',
  name: 'Prof. Coordinator Name',
  full_name: 'Prof. Coordinator Name',
  department: 'Computer Science & Engineering',
  academic_year: '2026–27',
  semester: '7th Semester',
  email: 'coordinator@gndec.edu.in',
  role: 'coordinator'
};

export default function CoordinatorDashboard() {
  const navigate = useNavigate();

  // 1. Logged-in Coordinator state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('prmes_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'coordinator' || parsed.coordinator_id) {
          return parsed;
        }
      } catch (e) {
        // Fallback to mock profile
      }
    }
    // Fallback to Development Mock Data if no active coordinator session
    return DEV_MOCK_COORDINATOR_PROFILE;
  });

  // 2. Dashboard UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 3. Data States
  const [teams, setTeams] = useState(null);
  const [guides, setGuides] = useState(null);
  const [documents, setDocuments] = useState(null);

  // 4. Modal States
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Attempt backend API loading on mount
  useEffect(() => {
    const loadCoordinatorData = async () => {
      const dbData = await fetchCoordinatorDashboard();
      if (dbData) {
        if (dbData.user) setUser(dbData.user);
        if (dbData.teams) setTeams(dbData.teams);
        if (dbData.guides) setGuides(dbData.guides);
        if (dbData.documents) setDocuments(dbData.documents);
      }
    };
    loadCoordinatorData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('prmes_user');
    navigate('/login');
  };

  return (
    <div className="cd-layout">
      {/* Blueprint Grid Backdrop */}
      <div className="blueprint-grid" style={{ opacity: 0.7 }} />

      {/* Sidebar Navigation */}
      <CoordinatorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        unreadCount={5}
      />

      {/* Main Content Workspace */}
      <div className="cd-main">
        <CoordinatorHeader
          user={user}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          unreadCount={5}
          onOpenNotifications={() => {
            setActiveTab('notifications');
            document.getElementById('notifications')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <div className="cd-content">
          {/* Welcome Card Section (Section 2) */}
          <motion.div
            className="cd-welcome-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="cd-welcome-card__glow" />
            <div className="cd-welcome-card__text">
              <h2 className="cd-welcome-card__title">
                Good Evening, {user?.full_name || 'Prof. Coordinator Name'} 👋
              </h2>
              <p className="cd-welcome-card__sub">
                Monitor project progress, reviews, evaluations, and guide allocation across the department.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span className="sd-welcome-card__status-pill">
                Academic Year: {user?.academic_year || '2026–27'}
              </span>
              <span className="sd-welcome-card__status-pill">
                Dept: {user?.department || 'CSE'}
              </span>
            </div>
          </motion.div>

          {/* 6 Key Statistics Cards (Section 3) */}
          <CoordinatorStats
            stats={{
              totalTeams: 48,
              activeProjects: 42,
              guides: 18,
              pendingAllocations: 4,
              upcomingReviews: 8,
              pendingEvaluations: 6,
            }}
          />

          {/* Project Progress Overview Visualization (Section 4) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <BatchProgressOverview />
          </motion.div>

          {/* All Project Teams Table (Section 5) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProjectTeamsTable
              teams={teams}
              onSelectTeam={(t) => setSelectedTeam(t)}
            />
          </motion.div>

          {/* Guide Allocation & Workload (Section 6) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <GuideAllocationTable
              guides={guides}
              onReviewAllocation={(g) => alert(`Reviewing allocation capacity for ${g.name}`)}
            />
          </motion.div>

          {/* 2-Column Grid: Review Schedule & Academic Calendar (Sections 7 & 8) */}
          <div className="sd-grid-2-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ReviewScheduleCard
                onScheduleReview={() => alert('Schedule Review modal endpoint ready.')}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ReviewCalendarCard />
            </motion.div>
          </div>

          {/* Document Submission Overview & Evaluation Status (Sections 9 & 10) */}
          <div className="sd-grid-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <DocumentOverview
                documents={documents}
                onSelectTeam={(t) => setSelectedTeam(t)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <EvaluationStatusCard />
            </motion.div>
          </div>

          {/* At-Risk Projects & Domain Distribution (Sections 11 & 12) */}
          <div className="sd-grid-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <AtRiskProjectsCard
                onSelectTeam={(t) => setSelectedTeam(t)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <DomainDistributionCard />
            </motion.div>
          </div>

          {/* Reports & Analytics (Section 16) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <ReportsCard />
          </motion.div>

          {/* Notifications & Recent Activity (Sections 13 & 14) */}
          <div className="sd-grid-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <CoordinatorNotifications />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <RecentActivityTimeline />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Coordinator Team Detail View Modal (Section 17) */}
      <CoordinatorTeamDetailModal
        isOpen={Boolean(selectedTeam)}
        onClose={() => setSelectedTeam(null)}
        team={selectedTeam}
      />
    </div>
  );
}
