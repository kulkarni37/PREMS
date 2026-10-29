import { motion } from 'framer-motion';
import { PiFolderSimple, PiFilePdf, PiCheckCircle, PiNotePencil, PiDownloadSimple } from 'react-icons/pi';
import { getDocumentUrl } from '../../services/api';

export default function PendingDocuments({ documents = [], onReviewDoc }) {
  const docList = Array.isArray(documents) ? documents : [];

  if (docList.length === 0) {
    return (
      <div className="gd-card" id="documents">
        <div className="gd-card__head">
          <h2 className="gd-card__title">
            <PiFolderSimple className="gd-card__title-icon" /> Documents Awaiting Review
          </h2>
        </div>
        <div className="gd-empty-state">
          <div className="gd-empty-state__icon">
            <PiCheckCircle />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            You&apos;re all caught up. No documents require review.
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
            Newly submitted project synopses, proposals, and review reports from your assigned teams will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gd-card" id="documents">
      <div className="gd-card__head">
        <h2 className="gd-card__title">
          <PiFolderSimple className="gd-card__title-icon" /> Documents Awaiting Review
        </h2>
        <span className="gd-header__breadcrumb" style={{ color: 'var(--text-muted)' }}>
          {docList.length} Pending Actions
        </span>
      </div>

      <div className="gd-doc-table">
        {docList.map((doc) => (
          <div key={doc.id} className="gd-doc-row">
            <div className="gd-doc-info">
              <PiFilePdf style={{ fontSize: 28, color: 'var(--accent-cyan)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                  {doc.docTitle}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                  Team: <strong>{doc.teamId}</strong> — {doc.teamTitle}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Submitted: {doc.submittedDate} • File: {doc.fileName}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`sd-status-badge ${doc.status === 'Changes Requested' ? 'sd-status-badge--pending' : 'sd-status-badge--reviewed'}`}>
                {doc.status}
              </span>

              {doc.filePath && (
                <a
                  href={getDocumentUrl(doc.filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gd-btn gd-btn-outline"
                  style={{ padding: '7px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
                >
                  <PiDownloadSimple /> View File
                </a>
              )}

              <motion.button
                className="gd-btn gd-btn-primary"
                style={{ padding: '7px 16px', fontSize: '12.5px' }}
                onClick={() => onReviewDoc(doc)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <PiNotePencil /> Review Document
              </motion.button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
