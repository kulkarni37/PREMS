import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiFolderSimple, PiFilePdf, PiCheckCircle, PiNotePencil, PiEyeBold } from 'react-icons/pi';

export default function PendingDocuments({ documents, onReviewDoc }) {
  const DEFAULT_PENDING_DOCS = [
    {
      id: 'doc1',
      teamId: 'PRMES-TEAM-2026-014',
      teamTitle: 'AI-Based Student Performance Prediction',
      docTitle: 'Project Synopsis',
      submittedDate: '10 Sept 2026',
      status: 'Pending Review',
      fileName: 'Synopsis_Team014_Final.pdf'
    },
    {
      id: 'doc2',
      teamId: 'PRMES-TEAM-2026-021',
      teamTitle: 'Blockchain-Based Electronic Health Record System',
      docTitle: 'System Architecture & Proposal',
      submittedDate: '08 Sept 2026',
      status: 'Pending Review',
      fileName: 'Proposal_HealthBlock.pdf'
    },
    {
      id: 'doc3',
      teamId: 'PRMES-TEAM-2026-033',
      teamTitle: 'Cloud-Native Microservices E-Commerce Portal',
      docTitle: 'Review 1 Revised Presentation',
      submittedDate: '05 Sept 2026',
      status: 'Changes Requested',
      fileName: 'Review1_Revisions_v2.pdf'
    }
  ];

  const docList = documents && documents.length > 0 ? documents : DEFAULT_PENDING_DOCS;

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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className={`sd-status-badge ${doc.status === 'Changes Requested' ? 'sd-status-badge--pending' : 'sd-status-badge--reviewed'}`}>
                {doc.status}
              </span>

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
