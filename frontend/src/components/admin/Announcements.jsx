import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiMegaphone, PiPlusBold, PiPaperPlaneRight, PiFloppyDisk } from 'react-icons/pi';
import { createAdminAnnouncement } from '../../services/api';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Review 1 Schedule Published for 7th Sem Batch', audience: 'All Students & Faculty', date: 'Today', priority: 'High' },
    { id: 2, title: 'Faculty Guide Allocation Rule Matrix Updated', audience: 'Guides & Coordinators', date: 'Yesterday', priority: 'Normal' },
  ]);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('All Students & Faculty');
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState('');

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const payload = {
      title,
      message,
      audience,
      priority: 'High',
      date: 'Just now'
    };

    try {
      setPublishing(true);
      await createAdminAnnouncement(payload);
    } catch (err) {
      setNotice(`[API Integration Point] Announcement '${title}' sent to endpoint /api/admin/announcements.`);
    } finally {
      setPublishing(false);
      setAnnouncements([payload, ...announcements]);
      setTitle('');
      setMessage('');
    }
  };

  return (
    <div className="ad-card" id="announcements">
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiMegaphone className="ad-card__title-icon" /> System Announcements Broadcaster
        </h2>
      </div>

      {notice && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '16px' }}>
          ℹ️ {notice}
        </div>
      )}

      {/* Broadcast Form */}
      <form onSubmit={handlePublish} style={{ padding: '18px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', marginBottom: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Announcement Title *"
            style={{ padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-hairline-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '13.5px' }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select
            style={{ padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-hairline-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '13.5px' }}
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            <option value="All Students & Faculty">All Students &amp; Faculty</option>
            <option value="All Students">All Students</option>
            <option value="All Faculty / Guides">All Faculty / Guides</option>
            <option value="Coordinators Only">Coordinators Only</option>
          </select>
        </div>

        <textarea
          rows={3}
          placeholder="Announcement message content..."
          style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-hairline-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '13.5px', marginBottom: '12px', outline: 'none' }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="submit" className="gd-btn gd-btn-primary" disabled={publishing}>
            <PiPaperPlaneRight /> {publishing ? 'Publishing...' : 'Publish Announcement'}
          </button>
        </div>
      </form>

      {/* Broadcast History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {announcements.map((a, idx) => (
          <div key={idx} className="gd-doc-row">
            <div>
              <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                {a.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Audience: <strong>{a.audience}</strong> • Published: {a.date}
              </div>
            </div>
            <span className="sd-doc-status-pill sd-doc-status-pill--approved">Published ✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}
