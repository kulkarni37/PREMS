import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import GuideSidebar from '../../components/guide/GuideSidebar';
import GuideHeader from '../../components/guide/GuideHeader';
import GuideStats from '../../components/guide/GuideStats';
import TeamStatus from '../../components/guide/TeamStatus';
import AssignedTeams from '../../components/guide/AssignedTeams';
import PendingDocuments from '../../components/guide/PendingDocuments';
import UpcomingEvaluations from '../../components/guide/UpcomingEvaluations';
import EvaluationPanel from '../../components/guide/EvaluationPanel';
import FeedbackPanel from '../../components/guide/FeedbackPanel';
import UpcomingDeadlines from '../../components/guide/UpcomingDeadlines';
import GuideNotifications from '../../components/guide/GuideNotifications';
import TeamDetailModal from '../../components/guide/TeamDetailModal';
import GuideEditProfileModal from '../../components/guide/GuideEditProfileModal';

import {
  fetchGuideDashboard,
  markNotificationRead,
  markAllNotificationsRead
} from '../../services/api';

import '../../styles/guide-dashboard.css';

export default function GuideDashboard() {
  const navigate = useNavigate();

  // 1. Authenticated Guide user state from localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('prmes_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // 2. Dashboard UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 3. Real Database Metric States
  const [stats, setStats] = useState({
    assigned_teams: 0,
    pending_reviews: 0,
    documents_to_review: 0,
    upcoming_evaluations: 0,
    completed_evaluations: 0
  });
  const [projectHealth, setProjectHealth] = useState({ ontrack: 0, attention: 0, atrisk: 0, completed: 0 });
  const [specializations, setSpecializations] = useState({ preference_1: null, preference_2: null, preference_3: null });
  const [teams, setTeams] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 4. Modal States
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedEvalItem, setSelectedEvalItem] = useState(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Load real Guide Dashboard metrics from backend API on mount and when user session updates
  const loadGuideData = async () => {
    const savedUser = JSON.parse(localStorage.getItem('prmes_user') || '{}');
    const emailToUse = user?.email || savedUser.email;
    if (!emailToUse) return;

    const dbData = await fetchGuideDashboard(emailToUse);
    if (dbData && dbData.success) {
      if (dbData.user) setUser((prev) => ({ ...prev, ...dbData.user }));
      if (dbData.stats) setStats(dbData.stats);
      if (dbData.project_health) setProjectHealth(dbData.project_health);
      if (dbData.specializations) setSpecializations(dbData.specializations);
      if (dbData.teams) setTeams(dbData.teams);
      if (dbData.documents) setDocuments(dbData.documents);
      if (dbData.evaluations) setEvaluations(dbData.evaluations);
      if (dbData.notifications) setNotifications(dbData.notifications);
      if (typeof dbData.unread_notification_count === 'number') {
        setUnreadCount(dbData.unread_notification_count);
      }
    }
  };

  useEffect(() => {
    loadGuideData();
  }, [user?.email]);

  const handleLogout = () => {
    localStorage.removeItem('prmes_user');
    navigate('/login');
  };

  const handleMarkNotificationRead = async (notifId) => {
    const res = await markNotificationRead(notifId, user?.email);
    if (res && res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
      if (typeof res.unread_count === 'number') {
        setUnreadCount(res.unread_count);
      } else {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const res = await markAllNotificationsRead(user?.email);
    if (res && res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const handleOpenEvaluation = (evalItem) => {
    setSelectedEvalItem(evalItem);
    setIsEvalModalOpen(true);
  };

  const handleReviewDocument = (doc) => {
    setSelectedEvalItem({
      doc_id: doc.id,
      id: doc.id,
      teamId: doc.teamId,
      teamTitle: doc.teamTitle,
      docTitle: doc.docTitle,
      title: `${doc.docTitle} Review`,
      fileName: doc.fileName,
      filePath: doc.filePath,
      submittedDate: doc.submittedDate,
      isDocumentReview: true
    });
    setIsEvalModalOpen(true);
  };

  const pref1 = specializations.preference_1 || user?.preference_1 || (user?.specialization_preferences && user.specialization_preferences[0]) || user?.specialization;
  const pref2 = specializations.preference_2 || user?.preference_2 || (user?.specialization_preferences && user.specialization_preferences[1]);
  const pref3 = specializations.preference_3 || user?.preference_3 || (user?.specialization_preferences && user.specialization_preferences[2]);

  return (
    <div className="gd-layout">
      {/* Blueprint Grid Backdrop */}
      <div className="blueprint-grid" style={{ opacity: 0.7 }} />

      {/* Sidebar Navigation */}
      <GuideSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        unreadCount={unreadCount}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="gd-main">
        <GuideHeader
          user={user}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          unreadCount={unreadCount}
          onOpenNotifications={() => {
            setActiveTab('notifications');
            document.getElementById('notifications')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
        />

        <div className="gd-content">
          {/* Welcome Section */}
          <motion.div
            className="gd-welcome-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="gd-welcome-card__glow" />
            <div className="gd-welcome-card__text">
              <h2 className="gd-welcome-card__title">
                {user?.full_name ? `Good Evening, ${user.full_name} 👋` : 'Good Evening 👋'}
              </h2>
              <p className="gd-welcome-card__sub">
                Monitor your assigned projects, review submissions, and guide your teams through every stage.
              </p>
            </div>
            <div className="gd-welcome-card__status-pill">
              <span className="gd-pulse-dot" />
              Guide Status: {user?.status || 'Active'}
            </div>
          </motion.div>

          {/* Quick Statistics - 5 Cards */}
          <GuideStats
            stats={{
              assignedTeams: stats.assigned_teams,
              pendingReviews: stats.pending_reviews,
              documentsToReview: stats.documents_to_review,
              upcomingEvaluations: stats.upcoming_evaluations,
              completedEvaluations: stats.completed_evaluations,
            }}
          />

          {/* 3-Level Domain Specialization Preferences Card */}
          <motion.div
            className="gd-card"
            style={{ padding: '18px 20px', marginBottom: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎯 Domain Specialization Preferences
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Priority order for project allocation</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                  🥇 1st Preference (Highest)
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {pref1 || 'Not Configured'}
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 193, 7, 0.06)', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#ffc107', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                  🥈 2nd Preference (Medium)
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {pref2 || 'Not Configured'}
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(156, 39, 176, 0.06)', border: '1px solid rgba(156, 39, 176, 0.2)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#ba68c8', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                  🥉 3rd Preference (Third)
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {pref3 || 'Not Configured'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Team Status Breakdown Overview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <TeamStatus counts={projectHealth} />
          </motion.div>

          {/* My Assigned Teams */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <AssignedTeams
              teams={teams}
              onSelectTeam={(team) => setSelectedTeam(team)}
            />
          </motion.div>

          {/* Documents Awaiting Review */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <PendingDocuments
              documents={documents}
              onReviewDoc={handleReviewDocument}
            />
          </motion.div>

          {/* 2-Column Grid: Upcoming Evaluations & Upcoming Deadlines */}
          <div className="sd-grid-2-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <UpcomingEvaluations
                evaluations={evaluations}
                onOpenEvalModal={handleOpenEvaluation}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <UpcomingDeadlines />
            </motion.div>
          </div>

          {/* Recent Mentoring Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <FeedbackPanel
              feedbackList={[]}
              onSelectTeam={(team) => setSelectedTeam(team)}
            />
          </motion.div>

          {/* Faculty Notifications & Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <GuideNotifications
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
              onMarkAllRead={handleMarkAllNotificationsRead}
            />
          </motion.div>
        </div>
      </div>

      {/* Interactive Modals */}
      <TeamDetailModal
        isOpen={Boolean(selectedTeam)}
        onClose={() => setSelectedTeam(null)}
        team={selectedTeam}
        onOpenEvalModal={(team) => {
          handleOpenEvaluation({
            id: `eval_${team.team_id}`,
            teamId: team.team_id,
            teamTitle: team.title,
            title: 'Review Evaluation Stage'
          });
        }}
      />

      <EvaluationPanel
        isOpen={isEvalModalOpen}
        onClose={() => {
          setIsEvalModalOpen(false);
          setSelectedEvalItem(null);
        }}
        evalItem={selectedEvalItem}
        onEvaluationSubmitted={() => {
          loadGuideData();
        }}
      />

      <GuideEditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onProfileUpdated={(updatedUser) => {
          setUser((prev) => ({ ...prev, ...updatedUser }));
        }}
      />
    </div>
  );
}
