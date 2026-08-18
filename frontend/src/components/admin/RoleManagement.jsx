import { PiKey, PiShieldCheck } from 'react-icons/pi';

export default function RoleManagement() {
  const ROLES = [
    { role: 'ADMIN', badgeClass: 'ad-role-badge--admin', usersCount: 2, desc: 'Highest Privilege System Access. Full administrative and security control.', permissions: 'Full System Access' },
    { role: 'COORDINATOR', badgeClass: 'ad-role-badge--coordinator', usersCount: 2, desc: 'Department Academic Review Coordination, Scheduling, and Workload Monitoring.', permissions: 'Department Project Management' },
    { role: 'GUIDE', badgeClass: 'ad-role-badge--guide', usersCount: 36, desc: 'Faculty Guide Mentoring, Document Review, Stage Evaluation, and Grading.', permissions: 'Assigned Project Management' },
    { role: 'STUDENT', badgeClass: 'ad-role-badge--student', usersCount: 420, desc: 'Project Registration, Team Formation, Document Submission, and Review Status Tracking.', permissions: 'Own Project Management' },
  ];

  return (
    <div className="ad-card" id="roles">
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiKey className="ad-card__title-icon" /> Role-Based Access Control (RBAC)
        </h2>
        <span className="sd-welcome-card__status-pill">
          Strict Privilege Hierarchy Enforced
        </span>
      </div>

      <div className="cd-table-container">
        <table className="cd-table">
          <thead>
            <tr>
              <th>Role Level</th>
              <th>Active Users</th>
              <th>System Scope &amp; Privilege Description</th>
              <th>Scope Limit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((r) => (
              <tr key={r.role}>
                <td>
                  <span className={`ad-role-badge ${r.badgeClass}`}>
                    {r.role}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {r.usersCount} Users
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.desc}</td>
                <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{r.permissions}</td>
                <td>
                  <span className="sd-doc-status-pill sd-doc-status-pill--approved">
                    Active Enforcement ✓
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
