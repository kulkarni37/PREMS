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

export default function CoordinatorDashboard() {
  const navigate = useNavigate();

  // 1. Logged-in Coordinator state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('prmes_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed.role === 'coordinator' ||
          parsed.role === 'COORDINATOR' ||
          parsed.coordinator_id ||
          (parsed.roles && parsed.roles.includes('COORDINATOR'))
        ) {
          return parsed;
        }
      } catch (e) {
        // ignore parse error
      }
    }
    return null;
  });

  // 2. Dashboard UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Database-Driven States
  const [stats, setStats] = useState(null);
  const [batchProgress, setBatchProgress] = useState([]);
  const [teams, setTeams] = useState([]);
  const [guides, setGuides] = useState([]);
  const [guideMetrics, setGuideMetrics] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentMetrics, setDocumentMetrics] = useState(null);
  const [stageEvaluations, setStageEvaluations] = useState([]);
  const [totalMarksEntered, setTotalMarksEntered] = useState(0);
  const [domainDistribution, setDomainDistribution] = useState([]);
  const [atRiskProjects, setAtRiskProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  // 4. Modal States
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Load real coordinator data from MySQL backend
  const loadCoordinatorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dbData = await fetchCoordinatorDashboard();
      if (dbData && dbData.success) {
        if (dbData.user) setUser(dbData.user);
        setStats(
          dbData.stats || {
            totalTeams: 0,
            activeProjects: 0,
            guides: 0,
            pendingAllocations: 0,
            upcomingReviews: 0,
            pendingEvaluations: 0,
          }
        );
        setBatchProgress(dbData.batchProgress || []);
        setTeams(dbData.teams || []);
        setGuides(dbData.guides || []);
        setGuideMetrics(dbData.guideMetrics || null);
        setDocuments(dbData.documents || []);
        setDocumentMetrics(dbData.documentMetrics || null);
        setStageEvaluations(dbData.stageEvaluations || []);
        setTotalMarksEntered(dbData.totalMarksEntered || 0);
        setDomainDistribution(dbData.domainDistribution || []);
        setAtRiskProjects(dbData.atRiskProjects || []);
        setNotifications(dbData.notifications || []);
        setUnreadCount(dbData.unreadNotificationsCount ?? 0);
        setActivityTimeline(dbData.activityTimeline || []);
        setReviews(dbData.reviews || []);
        setCalendarEvents(dbData.calendarEvents || []);
      } else {
        setError('Unable to load dashboard statistics.');
      }
    } catch (err) {
      console.error('Failed to load coordinator dashboard data:', err);
      setError(err?.message || 'Unable to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoordinatorData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('prmes_user');
    navigate('/login');
  };

  // Loading Screen
  if (loading) {
    return (
      <div
        className="cd-layout"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-canvas)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 42,
              height: 42,
              border: '3px solid rgba(56, 189, 248, 0.2)',
              borderTopColor: 'var(--accent-cyan)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Loading...
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '6px' }}>
            Fetching coordinator dashboard statistics from MySQL database...
          </p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error && !stats) {
    return (
      <div
        className="cd-layout"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-canvas)',
        }}
      >
        <div
          className="cd-card"
          style={{
            maxWidth: '460px',
            textAlign: 'center',
            padding: '36px 28px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '14px' }}>⚠️</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              color: 'var(--text-primary)',
              margin: '0 0 8px 0',
            }}
          >
            Unable to load dashboard statistics.
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '13.5px',
              margin: '0 0 20px 0',
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>
          <button
            className="gd-btn gd-btn-primary"
            onClick={loadCoordinatorData}
            style={{ margin: '0 auto', padding: '8px 24px' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
        unreadCount={unreadCount}
      />

      {/* Main Content Workspace */}
      <div className="cd-main">
        <CoordinatorHeader
          user={user}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          unreadCount={unreadCount}
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
                Good Evening, {user?.full_name || 'Coordinator'} 👋
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
                Dept: {user?.department || 'Computer Science & Engineering'}
              </span>
            </div>
          </motion.div>

          {/* 6 Key Statistics Cards (Section 3) - 100% Database Driven */}
          <CoordinatorStats stats={stats} />

          {/* Project Progress Overview Visualization (Section 4) - 100% Database Driven */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <BatchProgressOverview
              stages={batchProgress}
              totalTeams={stats?.totalTeams ?? 0}
              academicYear={user?.academic_year}
            />
          </motion.div>

          {/* All Project Teams Table (Section 5) - Real Database Teams */}
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

          {/* Guide Allocation & Workload (Section 6) - Real Database Guides */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <GuideAllocationTable
              guides={guides}
              metrics={guideMetrics}
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
                reviews={reviews}
                onScheduleReview={() => alert('Schedule Review modal endpoint ready.')}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ReviewCalendarCard events={calendarEvents} />
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
                metrics={documentMetrics}
                onSelectTeam={(t) => setSelectedTeam(t)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <EvaluationStatusCard
                stageEvaluations={stageEvaluations}
                totalMarksEntered={totalMarksEntered}
                totalTeams={stats?.totalTeams ?? 0}
              />
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
                atRiskTeams={atRiskProjects}
                onSelectTeam={(t) => setSelectedTeam(t)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <DomainDistributionCard domains={domainDistribution} />
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
              <CoordinatorNotifications
                notifications={notifications}
                onMarkAllRead={() => setUnreadCount(0)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <RecentActivityTimeline activities={activityTimeline} />
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
