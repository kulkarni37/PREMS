import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiFolderSimple, PiFilePdf, PiFilePpt, PiUploadSimple, PiLockKey, PiCheckCircle, PiInfo, PiWarningBold, PiPlusBold } from 'react-icons/pi';
import { uploadStudentDocument, getDocumentUrl } from '../../services/api';

export default function DocumentsCard({ documents = [], reviews = {}, teamId, studentId, user, isLeader = true, onRefreshDocuments, onOpenRegisterTeam }) {
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [statusNotice, setStatusNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  // 1. Normal students must NOT see the Project Documents & Submissions section (Requirement 4)
  if (!isLeader) {
    return null;
  }

  // 2. Team Leader must register a project team before uploading documents
  if (!teamId) {
    return (
      <div className="sd-card" id="documents">
        <div className="sd-card__head">
          <h2 className="sd-card__title">
            <PiFolderSimple className="sd-card__title-icon" /> Project Documents &amp; Submissions
          </h2>
          <span className="sd-welcome-card__status-pill">
            Team Leader Control
          </span>
        </div>

        <div className="sd-empty-state">
          <div className="sd-empty-state__icon">
            <PiFolderSimple />
          </div>
          <h3 className="sd-empty-state__title">Team Registration Required</h3>
          <p className="sd-empty-state__sub">
            Please register your project team (1 Team Leader + 3 Team Members) before uploading project documents.
          </p>
          {onOpenRegisterTeam && (
            <motion.button
              className="sd-btn sd-btn-primary"
              onClick={onOpenRegisterTeam}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <PiPlusBold /> Register Team (4 Members)
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  // Lock status calculation per review stage
  const isP1R1Approved = reviews?.p1r1?.status === 'COMPLETED' || reviews?.p1r1?.status === 'APPROVED';
  const isP1R2Approved = reviews?.p1r2?.status === 'COMPLETED' || reviews?.p1r2?.status === 'APPROVED';
  const isP2R1Approved = reviews?.p2r1?.status === 'COMPLETED' || reviews?.p2r1?.status === 'APPROVED';
  const isP2R2Approved = reviews?.p2r2?.status === 'COMPLETED' || reviews?.p2r2?.status === 'APPROVED';

  // Structure EXACT 2 PHASES & 4 REVIEWS (STRICT SYSTEM REQUIREMENT)
  const PHASES = [
    {
      phaseId: 1,
      phaseTitle: 'PHASE 1',
      reviews: [
        {
          reviewId: 1,
          reviewTitle: 'REVIEW 1',
          locked: false,
          items: [
            { type: 'Synopsis', title: 'Synopsis', accept: '.pdf,.doc,.docx', isPPT: false }
          ]
        },
        {
          reviewId: 2,
          reviewTitle: 'REVIEW 2',
          locked: !isP1R1Approved,
          items: [
            { type: 'Phase1_Report', altTypes: ['Review1_Report', 'Project_Report'], title: 'Project Report', accept: '.pdf,.doc,.docx', isPPT: false },
            { type: 'Phase1_PPT', altTypes: ['Review1_PPT', 'Project_PPT'], title: 'Project PPT', accept: '.ppt,.pptx', isPPT: true }
          ]
        }
      ]
    },
    {
      phaseId: 2,
      phaseTitle: 'PHASE 2',
      reviews: [
        {
          reviewId: 1,
          reviewTitle: 'REVIEW 1',
          locked: !isP1R2Approved,
          items: [
            { type: 'Phase2_Review1_PPT', altTypes: ['Phase2_PPT'], title: 'Project PPT', accept: '.ppt,.pptx', isPPT: true }
          ]
        },
        {
          reviewId: 2,
          reviewTitle: 'REVIEW 2',
          locked: !isP2R1Approved,
          items: [
            { type: 'Final_Project_Report', altTypes: ['Final_Report', 'Phase2_Final_Report'], title: 'Final Project Report', accept: '.pdf,.doc,.docx', isPPT: false },
            { type: 'Final_Project_PPT', altTypes: ['Final_PPT', 'Phase2_Final_PPT'], title: 'Final Project PPT', accept: '.ppt,.pptx', isPPT: true }
          ]
        }
      ]
    }
  ];

  const findSubmittedDoc = (primaryType, altTypes = []) => {
    if (!documents || !Array.isArray(documents)) return null;
    const allTypes = [primaryType, ...altTypes];
    return documents.find((d) => allTypes.includes(d.doc_type));
  };

  const handleUpload = (docItem, isStageLocked) => {
    setStatusNotice('');
    setErrorNotice('');

    if (isStageLocked) {
      setErrorNotice('This review stage is LOCKED. You cannot upload documents until the previous review stage is completed and approved by your Guide.');
      return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = docItem.accept;

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploadingDocType(docItem.type);
      const formData = new FormData();
      formData.append('doc_type', docItem.type);
      formData.append('team_id', teamId || '');
      formData.append('student_id', user?.student_id || studentId || '');
      formData.append('user_email', user?.email || '');
      formData.append('file', file);

      try {
        const res = await uploadStudentDocument(formData);
        if (res && res.success) {
          setStatusNotice(res.message || `Successfully uploaded ${file.name}`);
          if (onRefreshDocuments) onRefreshDocuments();
        } else {
          setErrorNotice(res?.message || 'Upload failed.');
        }
      } catch (err) {
        setErrorNotice(err?.message || 'Failed to upload document.');
      } finally {
        setUploadingDocType(null);
      }
    };

    fileInput.click();
  };

  return (
    <div className="sd-card" id="documents">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiFolderSimple className="sd-card__title-icon" /> Project Documents &amp; Submissions
        </h2>
        <span className="sd-welcome-card__status-pill">
          {isLeader ? 'Team Leader Control' : 'Read-Only View'}
        </span>
      </div>

      {!isLeader && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PiInfo style={{ color: 'var(--accent-cyan)', fontSize: 18, flexShrink: 0 }} />
          <span>Real-time project submission workflow. Document uploads are managed exclusively by your Team Leader.</span>
        </div>
      )}

      {statusNotice && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '16px' }}>
          ℹ️ {statusNotice}
        </div>
      )}

      {errorNotice && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PiWarningBold style={{ flexShrink: 0 }} /> {errorNotice}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {PHASES.map((phase) => (
          <div key={phase.phaseId} style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)', padding: '18px 20px' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{phase.phaseTitle}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {phase.reviews.map((rev) => (
                <div key={rev.reviewId} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rev.reviewTitle}
                    </div>
                    <div>
                      {rev.locked ? (
                        <span style={{ fontSize: '11.5px', color: '#ff6259', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <PiLockKey /> 🔒 LOCKED
                        </span>
                      ) : (
                        <span style={{ fontSize: '11.5px', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <PiCheckCircle /> OPEN FOR SUBMISSION
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sd-docs-list" style={{ gap: '10px' }}>
                    {rev.items.map((docItem) => {
                      const submitted = findSubmittedDoc(docItem.type, docItem.altTypes);
                      const isUploading = uploadingDocType === docItem.type;

                      let pillText = 'OPEN / Pending Upload';
                      let pillClass = 'sd-doc-status-pill--pending';

                      if (rev.locked) {
                        pillText = '🔒 LOCKED';
                        pillClass = 'sd-urgency-pill--approaching';
                      } else if (submitted) {
                        if (submitted.status === 'APPROVED' || submitted.status === 'COMPLETED') {
                          pillText = '✓ APPROVED';
                          pillClass = 'sd-doc-status-pill--approved';
                        } else if (submitted.status === 'CHANGES_REQUESTED') {
                          pillText = 'CHANGES REQUESTED';
                          pillClass = 'sd-urgency-pill--approaching';
                        } else {
                          pillText = 'SUBMITTED';
                          pillClass = 'sd-doc-status-pill--submitted';
                        }
                      }

                      return (
                        <div key={docItem.type} className="sd-doc-item" style={{ opacity: rev.locked ? 0.65 : 1, padding: '10px 14px' }}>
                          <div className="sd-doc-info">
                            {docItem.isPPT ? (
                              <PiFilePpt className="sd-doc-icon" style={{ color: 'var(--accent-amber)', fontSize: 24 }} />
                            ) : (
                              <PiFilePdf className="sd-doc-icon" style={{ fontSize: 24 }} />
                            )}
                            <div>
                              <div className="sd-doc-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <span>{docItem.title}</span>
                              </div>
                              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {submitted
                                  ? `File: ${submitted.file_name} (Attempt ${submitted.attempt_number} of 2)`
                                  : `Accepted format: ${docItem.accept}`}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {submitted?.file_path && (
                              <a
                                href={getDocumentUrl(submitted.file_path)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sd-btn sd-btn-outline"
                                style={{ padding: '5px 10px', fontSize: '12px', textDecoration: 'none' }}
                              >
                                View File
                              </a>
                            )}

                            <span className={`sd-doc-status-pill ${pillClass}`} style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                              {pillText}
                            </span>

                            {isLeader && (
                              <button
                                className={`sd-btn ${rev.locked ? 'sd-btn-outline' : 'sd-btn-primary'}`}
                                style={{ padding: '5px 12px', fontSize: '12px' }}
                                onClick={() => handleUpload(docItem, rev.locked)}
                                disabled={rev.locked || isUploading}
                              >
                                {rev.locked ? <PiLockKey /> : <PiUploadSimple />}
                                {isUploading ? 'Uploading...' : rev.locked ? 'Locked' : submitted ? 'Re-upload' : 'Upload'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
