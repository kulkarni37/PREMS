import { useState } from 'react';
import { PiFileText, PiDownloadSimple, PiEyeBold } from 'react-icons/pi';
import { fetchCoordinatorReports } from '../../services/api';

export default function ReportsCard() {
  const [loadingReport, setLoadingReport] = useState(null);
  const [notice, setNotice] = useState('');

  const REPORTS = [
    { id: 'prog', name: 'Project Progress Report', desc: 'Batch-wide stage completion percentages and team milestones.' },
    { id: 'guide', name: 'Guide Allocation Report', desc: 'Faculty workload, team assignments, and capacity slots.' },
    { id: 'review', name: 'Review Completion Report', desc: 'Attendance, panel defense schedules, and review completion rates.' },
    { id: 'eval', name: 'Evaluation & Marks Report', desc: 'Tabulated criteria marks, grade distributions, and feedback.' },
    { id: 'domain', name: 'Domain Distribution Report', desc: 'Categorized count of project teams per academic domain.' },
  ];

  const handleAction = async (report, actionType) => {
    setNotice('');
    if (actionType === 'generate') {
      try {
        setLoadingReport(report.id);
        await fetchCoordinatorReports();
      } catch (err) {
        // Backend placeholder notice
      } finally {
        setLoadingReport(null);
        setNotice(`[API Integration Point] '${report.name}' generated. Endpoint: /api/coordinator/reports.`);
      }
    } else {
      alert(`Viewing ${report.name} summary.`);
    }
  };

  return (
    <div className="cd-card" id="reports">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiFileText className="cd-card__title-icon" /> Academic Reports &amp; Analytics
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="gd-btn gd-btn-outline"
                style={{ padding: '5px 12px', fontSize: '12px' }}
                onClick={() => handleAction(rep, 'view')}
              >
                <PiEyeBold /> View Report
              </button>
              <button
                className="gd-btn gd-btn-primary"
                style={{ padding: '5px 14px', fontSize: '12px' }}
                onClick={() => handleAction(rep, 'generate')}
                disabled={loadingReport === rep.id}
              >
                <PiDownloadSimple /> {loadingReport === rep.id ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
