import { useState } from 'react';
import { PiFileText, PiDownloadSimple, PiEyeBold, PiUploadSimple, PiFileCsv, PiCheckCircle, PiWarningCircle, PiX } from 'react-icons/pi';
import {
  getComprehensiveReportUrl,
  getExportMarksCsvUrl,
  importCoordinatorMarksExcel,
  fetchCoordinatorReports
} from '../../services/api';

export default function ReportsCard() {
  const [loadingReport, setLoadingReport] = useState(null);
  const [notice, setNotice] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPhase, setImportPhase] = useState(1);
  const [importReview, setImportReview] = useState(1);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');

  const REPORTS = [
    {
      id: 'comprehensive',
      name: 'Comprehensive CIE Evaluation Report (PDF)',
      desc: 'Official multi-page formatted academic marks report with college header, all student criteria scores, and signatures.',
      isPdf: true,
      url: getComprehensiveReportUrl()
    },
    {
      id: 'csv',
      name: 'Student Review Marks & Criteria Export (CSV)',
      desc: 'Raw tabulated student-wise marks across all phases, review stages, and 4 criteria components.',
      isCsv: true,
      url: getExportMarksCsvUrl()
    },
    {
      id: 'prog',
      name: 'Project Progress Report',
      desc: 'Batch-wide stage completion percentages, milestone tracking, and stage throughput.',
      isStandard: true
    },
    {
      id: 'guide',
      name: 'Guide Allocation Report',
      desc: 'Faculty guide workload, team allocations, matched domain specializations, and capacity slots.',
      isStandard: true
    },
    {
      id: 'review',
      name: 'Review Completion Rate Report',
      desc: 'Review stage attendance, pending evaluations, and approved vs rejected defense records.',
      isStandard: true
    },
    {
      id: 'domain',
      name: 'Domain Distribution Report',
      desc: 'Categorized counts of project teams and student enrollment per academic domain.',
      isStandard: true
    },
  ];

  const handleAction = async (report) => {
    setNotice('');
    if (report.url) {
      window.open(report.url, '_blank');
      setNotice(`Generating and downloading '${report.name}'...`);
      return;
    }

    try {
      setLoadingReport(report.id);
      await fetchCoordinatorReports();
      setNotice(`'${report.name}' generated from real MySQL records.`);
    } catch (err) {
      setNotice(`Failed to generate '${report.name}'.`);
    } finally {
      setLoadingReport(null);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setImportError('');
    setImportResult(null);

    if (!importFile) {
      setImportError('Please select a valid .xlsx Excel file.');
      return;
    }

    const formData = new FormData();
    formData.append('phase', importPhase);
    formData.append('review', importReview);
    formData.append('file', importFile);

    try {
      setImporting(true);
      const res = await importCoordinatorMarksExcel(formData);
      if (res && res.success) {
        setImportResult(res);
      } else {
        setImportError(res?.message || 'Failed to import Excel marks.');
      }
    } catch (err) {
      setImportError(err?.message || 'Error occurred while importing Excel marks.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="cd-card" id="reports">
      <div className="cd-card__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2 className="cd-card__title" style={{ margin: 0 }}>
          <PiFileText className="cd-card__title-icon" /> Academic Reports &amp; CIE Evaluation Analytics
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="gd-btn gd-btn-outline"
            style={{ padding: '6px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => {
              setShowImportModal(true);
              setImportResult(null);
              setImportError('');
            }}
          >
            <PiUploadSimple /> Import Marks (.xlsx)
          </button>
          
          <a
            href={getExportMarksCsvUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="gd-btn gd-btn-outline"
            style={{ padding: '6px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <PiFileCsv /> Export CSV
          </a>

          <a
            href={getComprehensiveReportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="gd-btn gd-btn-primary"
            style={{ padding: '6px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <PiDownloadSimple /> Official CIE PDF
          </a>
        </div>
      </div>

      {notice && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '16px' }}>
          ℹ️ {notice}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {REPORTS.map((rep) => (
          <div key={rep.id} className="gd-doc-row" style={{ alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{rep.name}</span>
                {rep.isPdf && (
                  <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                    OFFICIAL PDF
                  </span>
                )}
                {rep.isCsv && (
                  <span style={{ fontSize: '10px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                    DATA CSV
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                {rep.desc}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="gd-btn gd-btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => handleAction(rep)}
                disabled={loadingReport === rep.id}
              >
                <PiDownloadSimple /> {loadingReport === rep.id ? 'Generating...' : (rep.isPdf || rep.isCsv ? 'Download' : 'Generate Report')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Excel Marks Import Modal */}
      {showImportModal && (
        <div className="sd-modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div
            className="sd-modal"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="sd-modal__close" onClick={() => setShowImportModal(false)}>
              <PiX />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <PiUploadSimple style={{ color: 'var(--accent-cyan)', fontSize: 24 }} />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Import Review Marks from Excel (.xlsx)
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Calculates criteria breakdown dynamically and updates MySQL student records.
                </span>
              </div>
            </div>

            {importError && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '14px' }}>
                <PiWarningCircle style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                {importError}
              </div>
            )}

            {importResult && (
              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '13px', marginBottom: '14px' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                  <PiCheckCircle style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  {importResult.message}
                </div>
                {importResult.matched_students?.length > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    Updated Students: {importResult.matched_students.slice(0, 5).join(', ')}
                    {importResult.matched_students.length > 5 ? ` and ${importResult.matched_students.length - 5} more...` : ''}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Phase Number *
                  </label>
                  <select
                    value={importPhase}
                    onChange={(e) => setImportPhase(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-canvas)', border: '1px solid var(--border-hairline-strong)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value={1}>Phase 1 (Review 1 &amp; 2)</option>
                    <option value={2}>Phase 2 (Review 1 &amp; 2)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Review Number *
                  </label>
                  <select
                    value={importReview}
                    onChange={(e) => setImportReview(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-canvas)', border: '1px solid var(--border-hairline-strong)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value={1}>Review 1</option>
                    <option value={2}>Review 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Excel File (.xlsx) *
                </label>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-canvas)', border: '1px solid var(--border-hairline-strong)', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                />
                <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Accepted columns: Student Name, USN/Seat No, Total Marks, or Individual Criteria columns.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="gd-btn gd-btn-outline"
                  onClick={() => setShowImportModal(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="gd-btn gd-btn-primary"
                  disabled={importing}
                >
                  {importing ? 'Importing Marks...' : 'Upload & Process Marks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
