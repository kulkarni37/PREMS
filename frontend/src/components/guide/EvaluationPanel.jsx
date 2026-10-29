import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PiX, PiCheckCircle, PiWarningCircle, PiPaperPlaneRight, PiFilePdf, PiKanban, PiDownloadSimple, PiUserBold } from 'react-icons/pi';
import { submitGuideEvaluation, getDocumentUrl, fetchReviewStudentMarks } from '../../services/api';

export default function EvaluationPanel({ isOpen, onClose, evalItem, onEvaluationSubmitted }) {
  const [action, setAction] = useState('APPROVED'); // 'APPROVED' or 'REJECTED'
  const [feedback, setFeedback] = useState('Review evaluation completed. Good work on the project documentation.');
  const [studentMarks, setStudentMarks] = useState([]);
  const [maxMarks, setMaxMarks] = useState(50);
  const [criteriaList, setCriteriaList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  useEffect(() => {
    if (evalItem) {
      setAction('APPROVED');
      setFeedback(evalItem.isDocumentReview ? '' : 'Review evaluation completed. Good work on the project documentation.');
      setStatusNotice('');
      setErrorNotice('');

      const loadStudentMarks = async () => {
        setLoadingMembers(true);
        const params = {
          team_id: evalItem.teamId || evalItem.team_id,
          doc_id: evalItem.doc_id || evalItem.docId || (evalItem.isDocumentReview ? evalItem.id : null),
          review_id: evalItem.review_id || evalItem.id,
          phase_number: evalItem.phase_number || 1,
          review_number: evalItem.review_number || 1
        };

        const res = await fetchReviewStudentMarks(params);
        if (res && res.success && Array.isArray(res.members)) {
          setMaxMarks(res.max_marks || 50);
          if (Array.isArray(res.criteria)) {
            setCriteriaList(res.criteria);
          }
          setStudentMarks(res.members.map((m) => ({
            student_id: m.student_id,
            full_name: m.full_name,
            usn: m.usn,
            role: m.role,
            is_leader: m.is_leader,
            marks_obtained: m.marks_obtained !== null && m.marks_obtained !== undefined ? m.marks_obtained : '',
            max_marks: m.max_marks || res.max_marks || 50,
            criteria1: m.criteria1,
            criteria2: m.criteria2,
            criteria3: m.criteria3,
            criteria4: m.criteria4,
          })));
        }
        setLoadingMembers(false);
      };

      loadStudentMarks();
    }
  }, [evalItem]);

  if (!isOpen || !evalItem) return null;

  const handleMarkChange = (studentId, value) => {
    setStudentMarks((prev) =>
      prev.map((m) => {
        if (m.student_id === studentId) {
          return { ...m, marks_obtained: value };
        }
        return m;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusNotice('');
    setErrorNotice('');

    if (action === 'REJECTED' && !feedback.trim()) {
      setErrorNotice('Rejection reason / feedback is strictly required when rejecting a document.');
      return;
    }

    if (!feedback.trim()) {
      setErrorNotice('Please provide faculty feedback or recommendations before submitting.');
      return;
    }

    // Validation for individual student marks
    if (action === 'APPROVED' && studentMarks.length > 0) {
      for (const sm of studentMarks) {
        if (sm.marks_obtained === '' || sm.marks_obtained === null || sm.marks_obtained === undefined) {
          setErrorNotice(`Please enter individual marks for student ${sm.full_name} (${sm.usn}).`);
          return;
        }
        const numVal = parseFloat(sm.marks_obtained);
        const currMax = sm.max_marks || maxMarks;
        if (isNaN(numVal) || numVal < 0 || numVal > currMax) {
          setErrorNotice(`Marks for ${sm.full_name} must be between 0 and ${currMax}.`);
          return;
        }
      }
    }

    const payload = {
      doc_id: evalItem.doc_id || evalItem.docId || (evalItem.isDocumentReview ? evalItem.id : null),
      eval_id: evalItem.id,
      review_id: evalItem.id,
      team_id: evalItem.teamId || evalItem.team_id,
      action: action,
      feedback: feedback.trim(),
      student_marks: studentMarks.map((s) => ({
        student_id: s.student_id,
        marks_obtained: parseFloat(s.marks_obtained)
      })),
      evaluated_at: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      const res = await submitGuideEvaluation(payload);
      if (res && res.success) {
        setStatusNotice(res.message || 'Evaluation decision & student marks recorded successfully.');
      } else {
        setStatusNotice(res?.message || 'Evaluation decision recorded.');
      }
    } catch (err) {
      setErrorNotice(err?.message || 'Failed to submit evaluation decision.');
      setSubmitting(false);
      return;
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        if (onEvaluationSubmitted) onEvaluationSubmitted(payload);
        onClose();
      }, 700);
    }
  };

  const stageTitle = evalItem.docTitle || evalItem.reviewTitle || evalItem.title || 'Review Stage';
  const teamIdStr = evalItem.teamId || evalItem.team_id || 'PRMES-TEAM-2026-001';
  const teamTitleStr = evalItem.teamTitle || evalItem.project_title || 'Project Team';
  const docFileName = evalItem.fileName || evalItem.file_name;
  const docFilePath = evalItem.filePath || evalItem.file_path;

  return (
    <div className="sd-modal-backdrop" onClick={onClose}>
      <motion.div
        className="sd-modal"
        style={{ maxWidth: 660 }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sd-modal__close" onClick={onClose}>
          <PiX />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <PiKanban style={{ color: 'var(--accent-cyan)', fontSize: '26px' }} />
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Faculty Review &amp; Student Evaluation Panel
            </h3>
            <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Target: <strong style={{ color: 'var(--accent-cyan)' }}>{stageTitle}</strong>
            </span>
          </div>
        </div>

        {/* Project & Team Summary Box */}
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {teamIdStr}
            </span>
            <span className="sd-welcome-card__status-pill" style={{ fontSize: '11px' }}>
              Workflow Active
            </span>
          </div>
          <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {teamTitleStr}
          </div>
        </div>

        {/* Submitted Document Summary if present */}
        {docFileName && (
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-canvas)', border: '1px solid var(--border-hairline)', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PiFilePdf style={{ color: 'var(--accent-cyan)', fontSize: 24 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  File: {docFileName}
                </div>
                {evalItem.submittedDate && (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Submitted: {evalItem.submittedDate}
                  </div>
                )}
              </div>
            </div>

            {docFilePath && (
              <a
                href={getDocumentUrl(docFilePath)}
                target="_blank"
                rel="noopener noreferrer"
                className="gd-btn gd-btn-outline"
                style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              >
                <PiDownloadSimple style={{ fontSize: 15 }} /> View / Open File
              </a>
            )}
          </div>
        )}

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Review Decision Selector */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Review Decision *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                onClick={() => setAction('APPROVED')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: action === 'APPROVED' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-hairline)',
                  background: action === 'APPROVED' ? 'var(--accent-cyan-soft)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}
              >
                <PiCheckCircle style={{ fontSize: 20, color: action === 'APPROVED' ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: action === 'APPROVED' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                    Approve Document / Review
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Accept submission &amp; save student marks
                  </div>
                </div>
              </div>

              <div
                onClick={() => setAction('REJECTED')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: action === 'REJECTED' ? '1px solid #ff6259' : '1px solid var(--border-hairline)',
                  background: action === 'REJECTED' ? 'rgba(255, 98, 89, 0.12)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}
              >
                <PiWarningCircle style={{ fontSize: 20, color: action === 'REJECTED' ? '#ff6259' : 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: action === 'REJECTED' ? '#ff6259' : 'var(--text-primary)' }}>
                    Reject Document / Review
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Require team revision &amp; resubmission
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Student-Wise Marks Breakdown */}
          <div style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.5px', margin: 0 }}>
                🎯 Student-Wise Individual Marks (Max: {maxMarks} Marks)
              </label>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Each student evaluated separately
              </span>
            </div>

            {loadingMembers ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>
                Loading real team members from MySQL database...
              </div>
            ) : studentMarks.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>
                No registered student members found for this team.
              </div>
            ) : (
              <>
                {criteriaList.length > 0 && (
                  <div style={{ marginBottom: '12px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      CIE Evaluation Rubrics &amp; Criteria Breakdown:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {criteriaList.map((crit, idx) => (
                        <span key={idx} style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-hairline-strong)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                          {crit.name}: <strong style={{ color: 'var(--accent-cyan)' }}>{crit.max_marks}M</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {studentMarks.map((student) => (
                    <div
                      key={student.student_id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface)',
                        border: student.is_leader ? '1px solid var(--border-hairline-strong)' : '1px solid var(--border-hairline)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <PiUserBold style={{ color: student.is_leader ? 'var(--accent-amber)' : 'var(--accent-cyan)', fontSize: 20 }} />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{student.full_name}</span>
                            <span className={`sd-role-badge ${student.is_leader ? 'sd-role-badge--leader' : 'sd-role-badge--member'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {student.role}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            USN: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{student.usn}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Marks:</span>
                        <input
                          type="number"
                          min="0"
                          max={student.max_marks || maxMarks}
                          step="0.5"
                          style={{
                            width: '75px',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-hairline-strong)',
                            background: 'var(--bg-canvas)',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '14px',
                            fontWeight: 700,
                            textAlign: 'center',
                            outline: 'none'
                          }}
                          value={student.marks_obtained !== null && student.marks_obtained !== undefined ? student.marks_obtained : ''}
                          onChange={(e) => handleMarkChange(student.student_id, e.target.value)}
                          placeholder="0"
                          required={action === 'APPROVED'}
                        />
                        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          / {student.max_marks || maxMarks}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Calculated Score Summary */}
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Total Evaluated Team Score:
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    Total: {studentMarks.reduce((acc, s) => acc + (parseFloat(s.marks_obtained) || 0), 0)} / {studentMarks.reduce((acc, s) => acc + (parseFloat(s.max_marks || maxMarks) || 10), 0)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Feedback Text Area */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: action === 'REJECTED' ? '#ff6259' : 'var(--text-muted)' }}>
              Faculty Feedback &amp; Rejection Reason {action === 'REJECTED' ? '*' : ''}
            </label>
            <textarea
              rows={4}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: action === 'REJECTED' ? '1px solid #ff6259' : '1px solid var(--border-hairline-strong)',
                background: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '13.5px',
                outline: 'none',
                resize: 'vertical'
              }}
              placeholder={action === 'REJECTED' ? "Provide specific reason for rejection and instructions on required revisions..." : "Provide constructive feedback, required changes, or approval recommendations for the project team..."}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required={action === 'REJECTED'}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <button
              type="button"
              className="gd-btn gd-btn-outline"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gd-btn gd-btn-primary"
              style={{ flex: 1.5, background: action === 'REJECTED' ? '#ff6259' : undefined, borderColor: action === 'REJECTED' ? '#ff6259' : undefined }}
              disabled={submitting}
            >
              <PiPaperPlaneRight /> {submitting ? 'Submitting...' : action === 'APPROVED' ? 'Approve & Save Marks' : 'Reject Document'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

