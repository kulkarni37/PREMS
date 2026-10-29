import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem('prmes_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email) {
        config.headers['X-User-Email'] = parsed.email;
      }
      if (parsed.admin_id || parsed.id || parsed.student_id) {
        config.headers['X-Admin-ID'] = parsed.admin_id || parsed.id || parsed.student_id;
      }
    }
  } catch (e) {}
  return config;
});

/* ===================================================================
   INSTITUTION & PUBLIC ENDPOINTS
   =================================================================== */

export const registerInstitution = async (institutionData) => {
  try {
    const response = await API.post('/auth/institution-register', institutionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Institution registration failed.' };
  }
};

export const registerOrganization = async (organizationData) => {
  try {
    const response = await API.post('/organizations/register', organizationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Organization registration failed.' };
  }
};

export const fetchOrganizationStatus = async () => {
  try {
    const response = await API.get('/system/organization-status');
    return response.data;
  } catch (error) {
    return { success: false, organization_exists: false };
  }
};

export const fetchUserProfile = async (email, student_id) => {
  try {
    const response = await API.get('/profile', { params: { email, student_id } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateUserProfile = async (payload) => {
  try {
    const response = await API.put('/profile', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update profile.' };
  }
};

export const uploadProfilePhoto = async (formData) => {
  try {
    const response = await API.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to upload profile photo.' };
  }
};

export const getProfilePhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  if (photoPath.startsWith('data:') || photoPath.startsWith('blob:') || photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  if (photoPath.startsWith('/')) {
    return photoPath;
  }
  return `/${photoPath}`;
};

export const fetchInstitutions = async () => {
  try {
    const response = await API.get('/institutions');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchDepartments = async (institutionId) => {
  try {
    const response = await API.get('/departments', { params: { institution_id: institutionId } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchDomains = async () => {
  try {
    const response = await API.get('/domains');
    return response.data;
  } catch (error) {
    return null;
  }
};

/* ===================================================================
   AUTH ENDPOINTS
   =================================================================== */

export const requestForgotPasswordOTP = async (email, studentId) => {
  try {
    const response = await API.post('/auth/forgot-password', {
      email,
      student_id: studentId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to connect to PRMES backend server.' };
  }
};

export const verifyOTP = async (studentId, email, otp) => {
  try {
    const response = await API.post('/auth/verify-otp', {
      student_id: studentId,
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to verify OTP with backend server.' };
  }
};

export const resetPassword = async (studentId, email, otp, newPassword) => {
  try {
    const response = await API.post('/auth/reset-password', {
      student_id: studentId,
      email,
      otp,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to reset password.' };
  }
};

export const registerUser = async (formData) => {
  try {
    const response = await API.post('/auth/register', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Registration failed.' };
  }
};

export const registerStudent = registerUser;

export const loginStudent = async (email, password) => {
  try {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Login failed.' };
  }
};

/* ===================================================================
   STUDENT DASHBOARD ENDPOINTS
   =================================================================== */

export const fetchStudentDashboard = async (email, studentId) => {
  try {
    const response = await API.get('/student/dashboard', { params: { email, student_id: studentId } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchEligibleMembers = async (leaderEmail, query) => {
  try {
    const response = await API.get('/student/eligible-members', { params: { leader_email: leaderEmail, q: query } });
    return response.data;
  } catch (error) {
    return { success: false, students: [] };
  }
};

export const fetchStudentProfile = async () => {
  try {
    const response = await API.get('/student/profile');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchStudentTeam = async () => {
  try {
    const response = await API.get('/student/team');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const registerStudentTeam = async (teamData) => {
  try {
    const response = await API.post('/student/team', teamData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to register team.' };
  }
};

export const updateTeamInfo = async (teamData) => {
  try {
    const response = await API.put('/student/team', teamData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update team info.' };
  }
};

export const checkProjectSimilarity = async (title, leaderEmail, threshold = 40.0) => {
  try {
    const response = await API.post('/student/check-similarity', { title, leaderEmail, threshold });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to run project similarity check.' };
  }
};

export const fetchPastProjects = async (q = '', sourcePeriod = '') => {
  try {
    const response = await API.get('/admin/past-projects', { params: { q, source_period: sourcePeriod } });
    return response.data;
  } catch (error) {
    return { success: false, projects: [] };
  }
};

export const addPastProject = async (projectData) => {
  try {
    const response = await API.post('/admin/past-projects', projectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to add past project.' };
  }
};

export const deletePastProject = async (id) => {
  try {
    const response = await API.delete(`/admin/past-projects/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete past project.' };
  }
};

export const removeTeamMember = async (leaderEmail, memberUserId) => {
  try {
    const response = await API.post('/student/team/remove-member', { leaderEmail, memberUserId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to remove team member.' };
  }
};

export const addTeamMember = async (leaderEmail, memberEmailOrUsn) => {
  try {
    const response = await API.post('/student/team/add-member', { leaderEmail, memberEmailOrUsn });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to add team member.' };
  }
};

export const fetchStudentDomain = async () => {
  try {
    const response = await API.get('/student/domain');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const selectStudentDomain = async (domainData) => {
  try {
    const response = await API.post('/student/domain', domainData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to select domain.' };
  }
};

export const fetchStudentGuide = async () => {
  try {
    const response = await API.get('/student/guide');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchStudentDocuments = async () => {
  try {
    const response = await API.get('/student/documents');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const uploadStudentDocument = async (formData) => {
  try {
    const response = await API.post('/student/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to upload document.' };
  }
};

export const fetchStudentReviews = async () => {
  try {
    const response = await API.get('/student/reviews');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchStudentNotifications = async () => {
  try {
    const response = await API.get('/student/notifications');
    return response.data;
  } catch (error) {
    return null;
  }
};

/* ===================================================================
   DAILY DIARY ENDPOINTS
   =================================================================== */

export const fetchStudentDiary = async (email, userId) => {
  try {
    const response = await API.get('/student/diary', { params: { email, user_id: userId } });
    return response.data;
  } catch (error) {
    return { success: false, entries: [] };
  }
};

export const createDiaryEntry = async (entryData) => {
  try {
    const response = await API.post('/student/diary', entryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create diary entry.' };
  }
};

export const updateDiaryEntry = async (entryId, entryData) => {
  try {
    const response = await API.put(`/student/diary/${entryId}`, entryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update diary entry.' };
  }
};

export const deleteDiaryEntry = async (entryId, userEmail) => {
  try {
    const response = await API.delete(`/student/diary/${entryId}`, { params: { user_email: userEmail } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete diary entry.' };
  }
};

export const fetchTeamDiary = async (teamId) => {
  try {
    const response = await API.get('/student/team-diary', { params: { team_id: teamId } });
    return response.data;
  } catch (error) {
    return { success: false, entries: [] };
  }
};

/* ===================================================================
   GUIDE DASHBOARD ENDPOINTS
   =================================================================== */

export const fetchGuideDashboard = async (email) => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('prmes_user') || '{}');
    const userEmail = email || savedUser.email;
    const response = await API.get('/guide/dashboard', { params: { email: userEmail } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const markNotificationRead = async (notifId, email) => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('prmes_user') || '{}');
    const userEmail = email || savedUser.email;
    const response = await API.patch(`/notifications/${notifId}/read`, { email: userEmail }, { params: { email: userEmail } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const markAllNotificationsRead = async (email) => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('prmes_user') || '{}');
    const userEmail = email || savedUser.email;
    const response = await API.post('/notifications/mark-all-read', { email: userEmail }, { params: { email: userEmail } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchGuideProfile = async () => {
  try {
    const response = await API.get('/guide/profile');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchGuideTeams = async () => {
  try {
    const response = await API.get('/guide/teams');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchGuideTeamDetail = async (teamId) => {
  try {
    const response = await API.get(`/guide/teams/${teamId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchGuideDocuments = async () => {
  try {
    const response = await API.get('/guide/documents');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchGuideReviews = async () => {
  try {
    const response = await API.get('/guide/reviews');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchGuideEvaluations = async () => {
  try {
    const response = await API.get('/guide/evaluations');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchReviewStudentMarks = async (params = {}) => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('prmes_user') || '{}');
    const userEmail = params.email || savedUser.email;
    const finalParams = { ...params };
    if (userEmail) finalParams.email = userEmail;
    const response = await API.get('/guide/review-marks', { params: finalParams });
    return response.data;
  } catch (error) {
    console.error("fetchReviewStudentMarks error:", error.response?.data || error.message);
    return null;
  }
};

export const submitGuideEvaluation = async (evaluationData = {}) => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('prmes_user') || '{}');
    const userEmail = evaluationData.email || savedUser.email;
    const payload = { ...evaluationData };
    if (userEmail) payload.email = userEmail;
    const response = await API.post('/guide/evaluations', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to submit evaluation.' };
  }
};

export const sendGuideFeedback = async (feedbackData) => {
  try {
    const response = await API.post('/guide/feedback', feedbackData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to send feedback.' };
  }
};

export const fetchGuideNotifications = async () => {
  try {
    const response = await API.get('/guide/notifications');
    return response.data;
  } catch (error) {
    return null;
  }
};

/* ===================================================================
   COORDINATOR DASHBOARD ENDPOINTS
   =================================================================== */

export const fetchCoordinatorDashboard = async (email) => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('prmes_user') || '{}');
    const userEmail = email || savedUser.email;
    const response = await API.get('/coordinator/dashboard', { params: userEmail ? { email: userEmail } : {} });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Unable to load dashboard statistics.' };
  }
};

export const fetchCoordinatorTeams = async () => {
  try {
    const response = await API.get('/coordinator/teams');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchCoordinatorTeamDetail = async (teamId) => {
  try {
    const response = await API.get(`/coordinator/teams/${teamId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchCoordinatorGuides = async () => {
  try {
    const response = await API.get('/coordinator/guides');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchCoordinatorDomains = async () => {
  try {
    const response = await API.get('/coordinator/domains');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchCoordinatorReviews = async () => {
  try {
    const response = await API.get('/coordinator/reviews');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createCoordinatorReview = async (reviewData) => {
  try {
    const response = await API.post('/coordinator/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create review.' };
  }
};

export const fetchCoordinatorDocuments = async () => {
  try {
    const response = await API.get('/coordinator/documents');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchCoordinatorEvaluations = async () => {
  try {
    const response = await API.get('/coordinator/evaluations');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchCoordinatorReports = async () => {
  try {
    const response = await API.get('/coordinator/reports');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchCoordinatorNotifications = async () => {
  try {
    const response = await API.get('/coordinator/notifications');
    return response.data;
  } catch (error) {
    return null;
  }
};

/* ===================================================================
   ADMIN DASHBOARD ENDPOINTS
   =================================================================== */

export const fetchAdminDashboard = async (email, adminId) => {
  try {
    const response = await API.get('/admin/dashboard', { params: { email, admin_id: adminId } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminDepartments = async (email) => {
  try {
    const response = await API.get('/admin/departments', { params: { email } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createAdminDepartment = async (deptData) => {
  try {
    const response = await API.post('/admin/departments', deptData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create department.' };
  }
};

export const fetchAdminUsers = async (email, role, search) => {
  try {
    const response = await API.get('/admin/users', { params: { email, role, search } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminUserDetail = async (userId, email) => {
  try {
    const response = await API.get(`/admin/users/${userId}`, { params: { email } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateAdminUserStatus = async (userId, status, email) => {
  try {
    const response = await API.patch(`/admin/users/${userId}/status`, { status, email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update user status.' };
  }
};

export const fetchAdminStudents = async () => {
  try {
    const response = await API.get('/admin/students');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminFaculty = async () => {
  try {
    const response = await API.get('/admin/faculty');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const importAdminFaculty = async (formData) => {
  try {
    const response = await API.post('/admin/faculty/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to import faculty.' };
  }
};

export const fetchAdminCoordinators = async () => {
  try {
    const response = await API.get('/admin/coordinators');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminTeams = async () => {
  try {
    const response = await API.get('/admin/teams');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminGuides = async () => {
  try {
    const response = await API.get('/admin/guides');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminGuidesWorkload = async (email) => {
  try {
    const response = await API.get('/admin/guides/workload', { params: { email } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminGuideRules = async (guideId, email) => {
  try {
    const response = await API.get(`/admin/guides/${guideId}/rules`, { params: { email } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateAdminGuideRules = async (guideId, rulesData) => {
  try {
    const response = await API.patch(`/admin/guides/${guideId}/rules`, rulesData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update guide rules.' };
  }
};

export const fetchAdminDomains = async (email) => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('prmes_user') || '{}');
    const userEmail = email || savedUser.email;
    const response = await API.get('/admin/domains', { params: { email: userEmail } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminDomainStats = async (email) => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('prmes_user') || '{}');
    const userEmail = email || savedUser.email;
    const response = await API.get('/admin/domain-stats', { params: { email: userEmail } });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createAdminDomain = async (domainData) => {
  try {
    const response = await API.post('/admin/domains', domainData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create domain.' };
  }
};

export const fetchAdminReviews = async () => {
  try {
    const response = await API.get('/admin/reviews');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminEvaluations = async () => {
  try {
    const response = await API.get('/admin/evaluations');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminReports = async () => {
  try {
    const response = await API.get('/admin/reports');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminAnnouncements = async () => {
  try {
    const response = await API.get('/admin/announcements');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createAdminAnnouncement = async (annData) => {
  try {
    const response = await API.post('/admin/announcements', annData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create announcement.' };
  }
};

export const fetchAdminActivity = async () => {
  try {
    const response = await API.get('/admin/activity');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchAdminSystemHealth = async () => {
  try {
    const response = await API.get('/admin/system-health');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createAdminStudent = async (studentData) => {
  try {
    const response = await API.post('/admin/students', studentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create student.' };
  }
};

export const updateAdminStudent = async (studentId, studentData) => {
  try {
    const response = await API.put(`/admin/students/${studentId}`, studentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update student.' };
  }
};

export const deleteAdminStudent = async (studentId) => {
  try {
    const response = await API.delete(`/admin/students/${studentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete student.' };
  }
};

export const createAdminGuide = async (guideData) => {
  try {
    const response = await API.post('/admin/guides', guideData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create guide.' };
  }
};

export const updateAdminGuide = async (guideId, guideData) => {
  try {
    const response = await API.put(`/admin/guides/${guideId}`, guideData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update guide.' };
  }
};

export const deleteAdminGuide = async (guideId) => {
  try {
    const response = await API.delete(`/admin/guides/${guideId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete guide.' };
  }
};

export const createAdminCoordinator = async (coordData) => {
  try {
    const response = await API.post('/admin/coordinators', coordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create coordinator.' };
  }
};

export const updateAdminCoordinator = async (coordId, coordData) => {
  try {
    const response = await API.put(`/admin/coordinators/${coordId}`, coordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update coordinator.' };
  }
};

export const deleteAdminCoordinator = async (coordId) => {
  try {
    const response = await API.delete(`/admin/coordinators/${coordId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete coordinator.' };
  }
};

export const updateAdminTeam = async (teamId, teamData) => {
  try {
    const response = await API.put(`/admin/teams/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update team.' };
  }
};

export const deleteAdminTeam = async (teamId) => {
  try {
    const response = await API.delete(`/admin/teams/${teamId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete team.' };
  }
};

export const fetchAdminAllocations = async () => {
  try {
    const response = await API.get('/admin/allocations');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const assignAdminGuide = async (allocationData) => {
  try {
    const response = await API.post('/admin/allocations/assign', allocationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to assign guide.' };
  }
};

export const removeAdminGuide = async (allocationData) => {
  try {
    const response = await API.post('/admin/allocations/remove', allocationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to remove guide.' };
  }
};

export const unlockAdminReview = async (unlockData) => {
  try {
    const response = await API.post('/admin/reviews/unlock', unlockData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to unlock review window.' };
  }
};

export const fetchAdminDocuments = async () => {
  try {
    const response = await API.get('/admin/documents');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateAdminEvaluation = async (markId, evalData) => {
  try {
    const response = await API.put(`/admin/evaluations/${markId}`, evalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update evaluation.' };
  }
};

export const checkAdminSimilarity = async (title, abstract) => {
  try {
    const response = await API.post('/admin/past-projects/check-similarity', { title, abstract });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to check similarity.' };
  }
};

export const fetchAdminNotifications = async () => {
  try {
    const response = await API.get('/admin/notifications');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createAdminNotification = async (notifData) => {
  try {
    const response = await API.post('/admin/notifications', notifData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to send notification.' };
  }
};

export const updateAdminUserRole = async (userId, roleData) => {
  try {
    const response = await API.post(`/admin/users/${userId}/role`, roleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update user role.' };
  }
};

export const getAdminComprehensiveReportUrl = () => {
  return `${getBackendBaseUrl()}/api/admin/reports/comprehensive-pdf`;
};

export const getAdminExportCsvUrl = (type = 'marks') => {
  return `${getBackendBaseUrl()}/api/admin/reports/export-csv?type=${encodeURIComponent(type)}`;
};

export const importAdminMarksExcel = async (formData) => {
  try {
    const response = await API.post('/admin/reports/import-marks-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to import Excel marks.' };
  }
};

/* ===================================================================
   FILE & DOCUMENT URL UTILITY HELPERS
   =================================================================== */

export const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:5000`;
  }
  return 'http://127.0.0.1:5000';
};

export const getDocumentUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const baseUrl = getBackendBaseUrl();
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  
  // Encode URL segments cleanly handling spaces (%20) and special characters
  const encodedPath = cleanPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${baseUrl}${encodedPath}`;
};

export const getComprehensiveReportUrl = () => {
  return `${getBackendBaseUrl()}/api/coordinator/reports/comprehensive-pdf`;
};

export const getExportMarksCsvUrl = () => {
  return `${getBackendBaseUrl()}/api/coordinator/reports/export-csv`;
};

export const getStudentMarksPdfUrl = (studentId, phase = 1, review = 1) => {
  return `${getBackendBaseUrl()}/api/coordinator/reports/student-pdf/${studentId}?phase=${phase}&review=${review}`;
};

export const getOwnMarksPdfUrl = (email, phase = 1, review = 1) => {
  return `${getBackendBaseUrl()}/api/student/marks-card-pdf?email=${encodeURIComponent(email || '')}&phase=${phase}&review=${review}`;
};

export const importCoordinatorMarksExcel = async (formData) => {
  try {
    const response = await API.post('/coordinator/reports/import-marks-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to import Excel marks.' };
  }
};

