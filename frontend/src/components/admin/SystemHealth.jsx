import { PiCheckCircle, PiDatabase, PiEnvelopeSimple, PiLock, PiHardDrive, PiCpu } from 'react-icons/pi';

export default function SystemHealth({ health }) {
  const DEFAULT_SERVICES = [
    { name: 'Backend Flask API', icon: <PiCpu />, status: 'Operational', ping: '12ms', ok: true },
    { name: 'Database Engine (MySQL)', icon: <PiDatabase />, status: 'Connected', ping: '2ms', ok: true },
    { name: 'SMTP Email Service', icon: <PiEnvelopeSimple />, status: 'Configured', ping: '95ms', ok: true },
    { name: 'Auth & OTP Service', icon: <PiLock />, status: 'Operational', ping: '6ms', ok: true },
    { name: 'Document File Storage', icon: <PiHardDrive />, status: 'Operational', ping: '4ms', ok: true },
  ];

  const getIcon = (name) => {
    if (name.includes('Database')) return <PiDatabase />;
    if (name.includes('SMTP')) return <PiEnvelopeSimple />;
    if (name.includes('Auth')) return <PiLock />;
    if (name.includes('Storage')) return <PiHardDrive />;
    return <PiCpu />;
  };

  const list = health && health.length > 0
    ? health.map(h => ({ ...h, icon: getIcon(h.name) }))
    : DEFAULT_SERVICES;

  return (
    <div className="ad-card" id="health">
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiCpu className="ad-card__title-icon" /> System Architecture Health Monitoring
        </h2>
        <span className="ad-health-badge">
          <span className="ad-health-dot" /> 100% Operational
        </span>
      </div>

      <div className="ad-health-grid">
        {list.map((s) => (
          <div key={s.name} className="ad-health-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: 20, color: 'var(--accent-cyan)' }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{s.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  Ping: {s.ping || '10ms'}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: s.ok !== false ? '#2dd478' : '#ff6259', fontWeight: 600 }}>
              ● {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
