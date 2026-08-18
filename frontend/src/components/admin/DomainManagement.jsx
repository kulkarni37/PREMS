import { useState } from 'react';
import { PiGridFour, PiPlusBold, PiPencilSimple, PiXCircle } from 'react-icons/pi';

export default function DomainManagement() {
  const [domains, setDomains] = useState([
    { id: '1', name: 'Artificial Intelligence & Machine Learning', desc: 'Deep learning, computer vision, NLP, and predictive intelligent models.', teams: 14, guides: 6, status: 'Active' },
    { id: '2', name: 'Web Development', desc: 'Modern full-stack web applications, microservices, and performance.', teams: 10, guides: 5, status: 'Active' },
    { id: '3', name: 'Data Science', desc: 'Big data processing, analytics, data visualization, and statistical learning.', teams: 8, guides: 4, status: 'Active' },
    { id: '4', name: 'Cyber Security', desc: 'Network security, cryptography, vulnerability testing, and secure protocols.', teams: 6, guides: 3, status: 'Active' },
    { id: '5', name: 'Cloud Computing', desc: 'Distributed systems, serverless architectures, AWS/Azure, and DevOps.', teams: 5, guides: 4, status: 'Active' },
    { id: '6', name: 'IoT', desc: 'Smart embedded systems, sensors, robotics, and hardware automation.', teams: 5, guides: 3, status: 'Active' },
    { id: '7', name: 'Mobile Application Development', desc: 'Native & cross-platform mobile apps for Android & iOS.', teams: 4, guides: 3, status: 'Active' },
    { id: '8', name: 'Software Engineering', desc: 'Enterprise architecture, design patterns, testing frameworks, and agile.', teams: 4, guides: 3, status: 'Active' },
  ]);

  const handleAddDomain = () => {
    const name = prompt('Enter new project domain name:');
    if (name) {
      setDomains([...domains, { id: String(Date.now()), name, desc: 'Custom project domain.', teams: 0, guides: 2, status: 'Active' }]);
    }
  };

  return (
    <div className="ad-card" id="domains">
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiGridFour className="ad-card__title-icon" /> Academic Project Domains Management
        </h2>
        <button
          className="gd-btn gd-btn-primary"
          style={{ padding: '6px 14px', fontSize: '12.5px' }}
          onClick={handleAddDomain}
        >
          <PiPlusBold /> Add New Domain
        </button>
      </div>

      <div className="cd-table-container">
        <table className="cd-table">
          <thead>
            <tr>
              <th>Domain Name</th>
              <th>Description</th>
              <th>Registered Teams</th>
              <th>Available Specialization Guides</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr key={d.id}>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</td>
                <td style={{ color: 'var(--text-secondary)', maxWidth: 300, whiteSpace: 'normal' }}>{d.desc}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{d.teams} Teams</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{d.guides} Faculty</td>
                <td>
                  <span className="sd-doc-status-pill sd-doc-status-pill--approved">{d.status} ✓</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="gd-btn gd-btn-outline"
                      style={{ padding: '3px 8px', fontSize: '11.5px' }}
                      onClick={() => alert(`Editing domain ${d.name}`)}
                    >
                      <PiPencilSimple /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
