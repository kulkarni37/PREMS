import { PiGridFour } from 'react-icons/pi';

export default function DomainDistributionCard() {
  const DOMAINS = [
    { name: 'Artificial Intelligence & ML', count: 14 },
    { name: 'Web Development', count: 10 },
    { name: 'Data Science', count: 8 },
    { name: 'Cyber Security', count: 6 },
    { name: 'Cloud Computing', count: 5 },
    { name: 'IoT & Embedded Systems', count: 5 },
  ];

  return (
    <div className="cd-card" id="domains">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiGridFour className="cd-card__title-icon" /> Project Domain Distribution
        </h2>
      </div>

      <div className="cd-domain-grid">
        {DOMAINS.map((d) => (
          <div key={d.name} className="cd-domain-box">
            <span className="cd-domain-name">{d.name}</span>
            <span className="cd-domain-count">{d.count} Teams</span>
          </div>
        ))}
      </div>
    </div>
  );
}
