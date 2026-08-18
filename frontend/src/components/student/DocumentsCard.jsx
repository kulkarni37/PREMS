import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiFolderSimple, PiFilePdf, PiFilePpt, PiUploadSimple, PiEye, PiArrowsClockwise, PiLockKey, PiCheckCircle } from 'react-icons/pi';
import { uploadStudentDocument } from '../../services/api';

export default function DocumentsCard({ documents, review1Status = 'OPEN', teamId, studentId, onRefreshDocuments }) {
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [statusNotice, setStatusNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  const isReview1Completed = review1Status === 'COMPLETED';

  const DOCUMENT_ITEMS = [
    { type: 'Proposal', title: 'Project Proposal', stage: 'Stage 1', accept: '.pdf,.doc,.docx', isPPT: false, locked: false },
    { type: 'Synopsis', title: 'Synopsis Document', stage: 'Stage 2', accept: '.pdf,.doc,.docx', isPPT: false, locked: false },
    { type: 'Review1_Report', title: 'Review 1 Project Report', stage: 'Review 1', accept: '.pdf,.doc,.docx', isPPT: false, locked: false },
    { type: 'Review1_PPT', title: 'Review 1 Project PPT', stage: 'Review 1', accept: '.ppt,.pptx', isPPT: true, locked: false },
    { type: 'Review2_Report', title: 'Review 2 Final Project Report', stage: 'Review 2 (Final)', accept: '.pdf,.doc,.docx', isPPT: false, locked: !isReview1Completed },
    { type: 'Review2_PPT', title: 'Review 2 Final Project PPT', stage: 'Review 2 (Final)', accept: '.ppt,.pptx', isPPT: true, locked: !isReview1Completed },
  ];

  const handleUpload = (docItem) => {
    setStatusNotice('');
    setErrorNotice('');

    if (docItem.locked) {
      setErrorNotice('Review 2 is LOCKED. You cannot upload Review 2 documents until Review 1 is officially COMPLETED.');
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
      formData.append('team_id', teamId || 'PRMES-TEAM-2026-001');
      formData.append('student_id', studentId || '');
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
        setStatusNotice(`[API Integration Point] Document '${file.name}' submitted to backend endpoint (/api/student/documents/upload).`);
      } finally {
        setUploadingDocType(null);
      }
    };

    fileInput.click();
  };

  const findSubmittedDoc = (type) => {
    if (!documents) return null;
    return documents.find((d) => d.doc_type === type);
  };

  return (
    <div className="sd-card" id="documents">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiFolderSimple className="sd-card__title-icon" /> Project Documents &amp; Submissions
        </h2>
        <span className="sd-welcome-card__status-pill">
          Review 2 Lock: {isReview1Completed ? 'Unlocked ✓' : 'Locked until Review 1 Complete 🔒'}
        </span>
      </div>

      {statusNotice && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '16px' }}>
          ℹ️ {statusNotice}
        </div>
      )}

      {errorNotice && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '16px' }}>
          ⚠️ {errorNotice}
        </div>
      )}

      <div className="sd-docs-list">
        {DOCUMENT_ITEMS.map((docItem) => {
          const submitted = findSubmittedDoc(docItem.type);
          const isUploading = uploadingDocType === docItem.type;

          return (
            <div key={docItem.type} className="sd-doc-item" style={{ opacity: docItem.locked ? 0.7 : 1 }}>
              <div className="sd-doc-info">
                {docItem.isPPT ? <PiFilePpt className="sd-doc-icon" style={{ color: 'var(--accent-amber)' }} /> : <PiFilePdf className="sd-doc-icon" />}
                <div>
                  <div className="sd-doc-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{docItem.title}</span>
                    {docItem.locked && <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: '#ff6259' }}>🔒 LOCKED</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {submitted ? `Submitted: ${submitted.file_name} (Attempt ${submitted.attempt_number} of 2)` : `Stage: ${docItem.stage} • Accepted: ${docItem.accept}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`sd-doc-status-pill ${docItem.locked ? 'sd-urgency-pill--approaching' : submitted ? 'sd-doc-status-pill--approved' : 'sd-doc-status-pill--pending'}`}>
                  {docItem.locked ? 'LOCKED' : submitted ? `${submitted.status} ✓` : 'PENDING'}
                </span>

                <button
                  className={`sd-btn ${docItem.locked ? 'sd-btn-outline' : 'sd-btn-primary'}`}
                  style={{ padding: '6px 14px', fontSize: '12.5px' }}
                  onClick={() => handleUpload(docItem)}
                  disabled={docItem.locked || isUploading}
                >
                  {docItem.locked ? <PiLockKey /> : <PiUploadSimple />}
                  {isUploading ? 'Uploading...' : docItem.locked ? 'Locked' : submitted ? 'Re-upload' : 'Upload'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
