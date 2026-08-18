import { useState } from 'react';
import { PiFileText, PiDownloadSimple, PiEyeBold } from 'react-icons/pi';
import { fetchAdminReports } from '../../services/api';

export default function ReportsAnalytics() {
  const [loadingReport, setLoadingReport] = useState(null);
  const [notice, setNotice] = useState('');

  const REPORTS = [
    { id: 'stu', name: 'Student Registration Report', desc: 'Complete breakdown of student enrollments, departments, and verification status.' },
    { id: 'fct', name: 'Faculty & Guide Workload Report', desc: 'Faculty specializations, capacity slots, and current team allocation workload.' },
    { id: 'team', name: 'Project Team Master Report', desc: 'Comprehensive list of project titles, team members, domains, and guides.' },
    { id: 'alloc', name: 'Guide Allocation Report', desc: 'System allocation audit matching project domains with faculty specializations.' },
    { id: 'rev', name: 'Review Completion Report', desc: 'Stage-wise completion metrics across all department project reviews.' },
    { id: 'eval', name: 'Evaluation & Marks Report', desc: 'Tabulated criteria marks, evaluation completion rates, and grade statistics.' },
    { id: 'dom', name: 'Domain Distribution Report', desc: 'Categorized distribution of projects across 8 technical domains.' },
    { id: 'prog', name: 'Project Lifecycle Progress Report', desc: 'Overall department batch progress tracking from registration to viva.' },
  ];

  const handleAction = async (report, actionType) => {
    setNotice('');
    if (actionType === 'generate' || actionType === 'export') {
      try {
        setLoadingReport(report.id);
        await fetchAdminReports();
      } catch (err) {
        // Integration point
      } finally {
        setLoadingReport(null);
        setNotice(`[API Integration Point] '${report.name}' requested for ${actionType}. Endpoint: /api/admin/reports.`);
      }
    } else {
      alert(`Viewing ${report.name} preview.`);
    }
  };

  return (
    <div className="ad-card" id="reports">
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiFileText className="ad-card__title-icon" /> System-Wide Analytics &amp; Reports Engine
        </h2>
      </div>

      {notice && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '16px' }}>
          ℹ️ {notice}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {REPORTS.map((rep) => (
          <div key={rep.id} className="gd-doc-row">
            <div>
              <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                {rep.name}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {rep.desc}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="gd-btn gd-btn-outline"
                style={{ padding: '5px 10px', fontSize: '12px' }}
                onClick={() => handleAction(rep, 'view')}
              >
                <PiEyeBold /> View
              </button>
              <button
                className="gd-btn gd-btn-primary"
                style={{ padding: '5px 12px', fontSize: '12px' }}
                onClick={() => handleAction(rep, 'generate')}
                disabled={loadingReport === rep.id}
              >
                <PiDownloadSimple /> {loadingReport === rep.id ? 'Generating...' : 'Export PDF/CSV'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
