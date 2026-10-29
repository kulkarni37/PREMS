import { useState, useEffect } from 'react';
import { PiGridFour } from 'react-icons/pi';
import { FIXED_PROJECT_DOMAINS } from '../../constants/domains';
import { fetchAdminDomainStats } from '../../services/api';

export default function DomainManagement({ adminUser }) {
  const [domainStats, setDomainStats] = useState(() =>
    FIXED_PROJECT_DOMAINS.map((domainName) => ({
      id: domainName.toLowerCase().replace(/\s+/g, '_'),
      name: domainName,
      domain: domainName,
      teamsCount: 0,
      status: 'Active'
    }))
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDomainStats = async () => {
      try {
        setLoading(true);
        const email = adminUser?.email || adminUser?.student_id;
        const res = await fetchAdminDomainStats(email);
        if (res && res.success && res.domain_stats) {
          setDomainStats(res.domain_stats);
        }
      } catch (err) {
        console.error('Failed to load real domain stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDomainStats();
  }, [adminUser]);

  return (
    <div className="ad-card" id="domains">
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiGridFour className="ad-card__title-icon" /> Academic Project Domains &amp; Real Team Distribution
        </h2>
        <span className="sd-welcome-card__status-pill">
          {FIXED_PROJECT_DOMAINS.length} Predefined System Domains
        </span>
      </div>

      <div className="cd-table-container">
        <table className="cd-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Predefined Domain Name</th>
              <th>Registered Teams (Real MySQL Count)</th>
              <th>Allocation Status</th>
            </tr>
          </thead>
          <tbody>
            {domainStats.map((d, index) => (
              <tr key={d.name || d.domain}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {index + 1}
                </td>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {d.name || d.domain}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: d.teamsCount > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                  {d.teamsCount ?? d.teams ?? 0} Teams
                </td>
                <td>
                  <span className="sd-doc-status-pill sd-doc-status-pill--approved">
                    Active System Option ✓
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
