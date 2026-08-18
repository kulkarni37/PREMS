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

import {
  fetchGuideDashboard,
  fetchGuideTeams,
  fetchGuideDocuments,
  fetchGuideEvaluations,
} from '../../services/api';

import '../../styles/guide-dashboard.css';

/* ===================================================================
   TEMPORARY MOCK GUIDE DATA FOR DEVELOPMENT PREVIEW
   -------------------------------------------------------------------
   NOTE: This mock object provides instant preview access at /guide/dashboard
   without requiring faculty registration/login.
   Replace or remove this block when real faculty authentication is connected.
   =================================================================== */
const DEV_MOCK_GUIDE_PROFILE = {
  guide_id: 'PRMES-GDE-2026-001',
  name: 'Dr. Faculty Name',
  full_name: 'Dr. Faculty Name',
  designation: 'Assistant Professor',
  department: 'Computer Science & Engineering',
  specialization: 'Artificial Intelligence & Machine Learning',
  email: 'faculty@gndec.edu.in',
  role: 'guide'
};

export default function GuideDashboard() {
  const navigate = useNavigate();

  // 1. Logged-in Guide user state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('prmes_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'guide' || parsed.guide_id) {
          return parsed;
        }
      } catch (e) {
        // Fallback to mock profile
      }
    }
    // Fallback to Development Mock Data if no active guide session
    return DEV_MOCK_GUIDE_PROFILE;
  });

  // 2. Dashboard UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 3. Data States
  const [teams, setTeams] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [evaluations, setEvaluations] = useState(null);

  // 4. Modal States
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedEvalItem, setSelectedEvalItem] = useState(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  // Attempt backend API loading on mount
  useEffect(() => {
    const loadGuideData = async () => {
      const dbData = await fetchGuideDashboard();
      if (dbData) {
        if (dbData.user) setUser(dbData.user);
        if (dbData.teams) setTeams(dbData.teams);
        if (dbData.documents) setDocuments(dbData.documents);
        if (dbData.evaluations) setEvaluations(dbData.evaluations);
      }
    };
    loadGuideData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('prmes_user');
    navigate('/login');
  };

  const handleOpenEvaluation = (evalItem) => {
    setSelectedEvalItem(evalItem);
    setIsEvalModalOpen(true);
  };

  const handleReviewDocument = (doc) => {
    setSelectedEvalItem({
      id: doc.id,
      teamId: doc.teamId,
      teamTitle: doc.teamTitle,
      title: `${doc.docTitle} Review`,
      maxMarks: 50
    });
    setIsEvalModalOpen(true);
  };

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
        unreadCount={4}
      />

      {/* Main Content Workspace */}
      <div className="gd-main">
        <GuideHeader
          user={user}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          unreadCount={4}
          onOpenNotifications={() => {
            setActiveTab('notifications');
            document.getElementById('notifications')?.scrollIntoView({ behavior: 'smooth' });
          }}
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
                Good Evening, {user?.full_name || 'Dr. Faculty Name'} 👋
              </h2>
              <p className="gd-welcome-card__sub">
                Monitor your assigned projects, review submissions, and guide your teams through every stage.
              </p>
            </div>
            <div className="gd-welcome-card__status-pill">
              <span className="gd-pulse-dot" />
              Guide Status: Active
            </div>
          </motion.div>

          {/* Quick Statistics - 5 Cards */}
          <GuideStats
            stats={{
              assignedTeams: 8,
              pendingReviews: 3,
              documentsToReview: 5,
              upcomingEvaluations: 2,
              completedEvaluations: 14,
            }}
          />

          {/* Team Status Breakdown Overview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <TeamStatus counts={{ ontrack: 5, attention: 2, atrisk: 1, completed: 0 }} />
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
              onSelectTeam={(team) => setSelectedTeam(team)}
            />
          </motion.div>

          {/* Faculty Notifications & Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <GuideNotifications />
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
      />
    </div>
  );
}
