import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PiInfo } from 'react-icons/pi';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import ProjectProgress from '../../components/student/ProjectProgress';
import ProjectOverview from '../../components/student/ProjectOverview';
import TeamCard from '../../components/student/TeamCard';
import GuideCard from '../../components/student/GuideCard';
import DomainCard from '../../components/student/DomainCard';
import DocumentsCard from '../../components/student/DocumentsCard';
import ReviewsCard from '../../components/student/ReviewsCard';
import UpcomingDeadlines from '../../components/student/UpcomingDeadlines';
import NotificationsCard from '../../components/student/NotificationsCard';
import TodayProgressCard from '../../components/student/TodayProgressCard';
import DailyDiaryCard from '../../components/student/DailyDiaryCard';
import RegisterTeamModal from '../../components/student/RegisterTeamModal';
import SelectDomainModal from '../../components/student/SelectDomainModal';
import EditProfileModal from '../../components/student/EditProfileModal';
import ProjectSimilarityModal from '../../components/student/ProjectSimilarityModal';

import {
  fetchStudentDashboard,
} from '../../services/api';

import '../../styles/student-dashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();

  // 1. Logged-in user state
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

  // 3. Workflow Data States
  const [team, setTeam] = useState(null);
  const [domain, setDomain] = useState(null);
  const [guide, setGuide] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [reviews, setReviews] = useState(null);
  const [review1, setReview1] = useState(null);
  const [review2, setReview2] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [todayDiary, setTodayDiary] = useState(null);

  // 4. Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      text: 'Welcome to PRMES. Account created successfully.',
      time: 'Just now',
      read: false
    }
  ]);

  // 5. Modal States
  const [isRegisterTeamOpen, setIsRegisterTeamOpen] = useState(false);
  const [isSelectDomainOpen, setIsSelectDomainOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSimilarityModalOpen, setIsSimilarityModalOpen] = useState(false);

  const loadDashboardData = async () => {
    const currentUser = user || JSON.parse(localStorage.getItem('prmes_user') || '{}');
    const dbData = await fetchStudentDashboard(currentUser?.email, currentUser?.student_id);
    if (dbData && dbData.success) {
      if (dbData.user) setUser(dbData.user);
      if (dbData.team) setTeam(dbData.team);
      if (dbData.domain) setDomain(dbData.domain);
      if (dbData.guide) setGuide(dbData.guide);
      if (dbData.allocation) setAllocation(dbData.allocation);
      if (dbData.documents) setDocuments(dbData.documents);
      if (dbData.reviews) setReviews(dbData.reviews);
      if (dbData.review1) setReview1(dbData.review1);
      if (dbData.review2) setReview2(dbData.review2);
      if (typeof dbData.stage_index === 'number') setStageIndex(dbData.stage_index);
      if (dbData.today_diary) setTodayDiary(dbData.today_diary);
      if (dbData.notifications && dbData.notifications.length > 0) {
        setNotifications(dbData.notifications);
      }
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem('prmes_user');
    navigate('/login');
  };

  const handleTeamRegistered = (newTeam) => {
    setTeam(newTeam);
    setStageIndex(1);
  };

  const handleDomainSelected = async (newDomain) => {
    setDomain(newDomain);
    if (team) setTeam({ ...team, domain: newDomain });
    setStageIndex(2);
    await loadDashboardData();
  };

  const handleNotificationRead = (id, updatedList) => {
    setNotifications(updatedList);
  };

  const handleMarkAllRead = (updatedList) => {
    setNotifications(updatedList);
  };

  const handleOpenDiary = () => {
    setActiveTab('diary');
    document.getElementById('diary')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isUnassignedStudent = !team && user?.role === 'STUDENT';
  const isLeader = user?.role === 'TEAM_LEADER' || (team && user && team.leader_id === user.id);

  return (
    <div className="sd-layout">
      {/* Blueprint Grid Backdrop */}
      <div className="blueprint-grid" style={{ opacity: 0.7 }} />

      {/* Sidebar Navigation */}
      <StudentSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        unreadCount={unreadCount}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* Main Workspace */}
      <div className="sd-main">
        <StudentHeader
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

        <div className="sd-content">
          {/* Welcome Section */}
          <motion.div
            className="sd-welcome-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sd-welcome-card__glow" />
            <div className="sd-welcome-card__text">
              <h2 className="sd-welcome-card__title">
                Welcome, {user?.full_name || 'Student'} 👋
              </h2>
              <p className="sd-welcome-card__sub">
                {user?.college || 'Guru Nanak Dev Engineering College'} • {user?.department || 'Computer Science & Engineering'} • <strong>Semester: {user?.semester || '7th'} ({user?.section || 'A'})</strong>
              </p>
            </div>
            <div className="sd-welcome-card__status-pill">
              <span className="sd-welcome-card__pulse" />
              Role: <strong>{user?.role === 'TEAM_LEADER' ? 'Team Leader' : 'Student'}</strong> • Status: {team ? (guide ? 'Development Active' : 'Guide Allocation Pending') : 'Team Unassigned'}
            </div>
          </motion.div>

          {/* Unassigned Student Notice Banner */}
          {isUnassignedStudent && (
            <motion.div
              style={{ padding: '20px 24px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--accent-cyan)', marginBottom: '20px' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <PiInfo style={{ color: 'var(--accent-cyan)', fontSize: 28, flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Welcome to PRMES, {user?.full_name}!
                  </h3>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Your student account is active, but you have not been added to a project team yet.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', margin: '14px 0', padding: '12px 16px', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)' }}>
                <div><span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Team Assignment:</span> <strong style={{ color: '#ff6259', marginLeft: 4 }}>Not Assigned</strong></div>
                <div><span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Project:</span> <strong style={{ color: 'var(--text-muted)', marginLeft: 4 }}>Not Assigned</strong></div>
                <div><span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Guide:</span> <strong style={{ color: 'var(--text-muted)', marginLeft: 4 }}>Not Assigned</strong></div>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--accent-cyan)' }}>
                ℹ️ Please wait for your Team Leader to add you to a project team. You will receive an email and in-app notification when added.
              </div>
            </motion.div>
          )}

          {/* Quick Stats Grid */}
          <motion.div
            className="sd-stats-grid"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sd-stat-card">
              <div className="sd-stat-card__info">
                <span className="sd-stat-card__value">{team ? (team.members?.length || 4) : 0} / 4</span>
                <span className="sd-stat-card__label">Team Members</span>
              </div>
              <span className="sd-stat-card__icon">👥</span>
            </div>

            <div className="sd-stat-card">
              <div className="sd-stat-card__info">
                <span className="sd-stat-card__value">{documents.length} / 6</span>
                <span className="sd-stat-card__label">Documents Uploaded</span>
              </div>
              <span className="sd-stat-card__icon">📄</span>
            </div>

            <div className="sd-stat-card">
              <div className="sd-stat-card__info">
                <span className="sd-stat-card__value">{review1?.status === 'COMPLETED' ? '1 / 2' : '0 / 2'}</span>
                <span className="sd-stat-card__label">Reviews Completed</span>
              </div>
              <span className="sd-stat-card__icon">📊</span>
            </div>

            <div className="sd-stat-card">
              <div className="sd-stat-card__info">
                <span className="sd-stat-card__value">{review1?.status === 'COMPLETED' ? '50%' : team ? '25%' : '0%'}</span>
                <span className="sd-stat-card__label">Overall Progress</span>
              </div>
              <span className="sd-stat-card__icon">🎯</span>
            </div>
          </motion.div>

          {/* Today's Diary Progress Summary Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}>
            <TodayProgressCard todayDiary={todayDiary} onOpenDiary={handleOpenDiary} />
          </motion.div>

          {/* 9-Stage Workflow Progress */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <ProjectProgress currentStageIndex={stageIndex} />
          </motion.div>

          {/* Project Overview */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <ProjectOverview team={team} onOpenRegisterTeam={() => setIsRegisterTeamOpen(true)} />
          </motion.div>

          {/* 2-Column Grid: Team Card (4 Members) & Guide Card */}
          <div className="sd-grid-2">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
              <TeamCard
                team={team}
                user={user}
                onOpenRegisterTeam={() => setIsRegisterTeamOpen(true)}
                onTeamUpdated={(updatedTeam) => {
                  setTeam(updatedTeam);
                  loadDashboardData();
                }}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <GuideCard guide={guide} allocation={allocation} domain={domain || team?.domain} isLeader={isLeader} />
            </motion.div>
          </div>

          {/* Daily Diary Section */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }}>
            <DailyDiaryCard user={user} onDiaryUpdated={loadDashboardData} />
          </motion.div>

          {/* Project Domain Selection */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
            <DomainCard
              selectedDomain={domain || team?.domain}
              onOpenSelectDomain={() => setIsSelectDomainOpen(true)}
              onOpenSimilarityModal={() => setIsSimilarityModalOpen(true)}
              isLeader={isLeader}
            />
          </motion.div>

          {/* Documents Section (Team Leader Only) */}
          {isLeader && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <DocumentsCard
                documents={documents}
                reviews={reviews}
                teamId={team?.team_id}
                studentId={user?.student_id}
                user={user}
                isLeader={isLeader}
                onRefreshDocuments={loadDashboardData}
                onOpenRegisterTeam={() => setIsRegisterTeamOpen(true)}
              />
            </motion.div>
          )}

          {/* 2-Column Grid: Reviews & Dynamic Upcoming */}
          <div className="sd-grid-2-1">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
              <ReviewsCard reviews={reviews} user={user} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <UpcomingDeadlines currentStageIndex={stageIndex} team={team} review1Status={review1?.status} />
            </motion.div>
          </div>

          {/* Notifications & Activity Panel */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}>
            <NotificationsCard
              notifications={notifications}
              onNotificationRead={handleNotificationRead}
              onMarkAllRead={handleMarkAllRead}
            />
          </motion.div>
        </div>
      </div>

      {/* Interactive Modals */}
      <RegisterTeamModal
        isOpen={isRegisterTeamOpen}
        onClose={() => setIsRegisterTeamOpen(false)}
        onTeamRegistered={handleTeamRegistered}
        user={user}
      />

      <SelectDomainModal
        isOpen={isSelectDomainOpen}
        onClose={() => setIsSelectDomainOpen(false)}
        currentDomain={domain || team?.domain}
        onDomainSelected={handleDomainSelected}
        user={user}
        team={team}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onProfileUpdated={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('prmes_user', JSON.stringify(updatedUser));
        }}
      />

      <ProjectSimilarityModal
        isOpen={isSimilarityModalOpen}
        onClose={() => setIsSimilarityModalOpen(false)}
        currentTitle={team?.title || ''}
        currentDomain={domain || team?.domain || ''}
        user={user}
        team={team}
        onSimilarityPassed={({ title: checkedTitle, domain: checkedDomain }) => {
          setIsSimilarityModalOpen(false);
          setIsSelectDomainOpen(true);
        }}
      />
    </div>
  );
}
