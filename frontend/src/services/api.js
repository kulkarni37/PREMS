import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
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

export const registerStudent = async (formData) => {
  try {
    const response = await API.post('/auth/register', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Registration failed.' };
  }
};

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

export const fetchGuideDashboard = async () => {
  try {
    const response = await API.get('/guide/dashboard');
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

export const submitGuideEvaluation = async (evaluationData) => {
  try {
    const response = await API.post('/guide/evaluations', evaluationData);
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

export const fetchCoordinatorDashboard = async () => {
  try {
    const response = await API.get('/coordinator/dashboard');
    return response.data;
  } catch (error) {
    return null;
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

export const fetchAdminDomains = async () => {
  try {
    const response = await API.get('/admin/domains');
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
