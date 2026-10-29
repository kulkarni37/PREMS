import { PiGridFour } from 'react-icons/pi';

export default function DomainDistributionCard({ domains = [] }) {
  const DEFAULT_EMPTY = [
    { name: 'Artificial Intelligence & ML', count: 0 },
    { name: 'Web Development', count: 0 },
    { name: 'Data Science', count: 0 },
    { name: 'Cyber Security', count: 0 },
    { name: 'Cloud Computing', count: 0 },
    { name: 'IoT & Embedded Systems', count: 0 },
  ];

  const list = Array.isArray(domains) && domains.length > 0 ? domains : DEFAULT_EMPTY;

  return (
    <div className="cd-card" id="domains">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiGridFour className="cd-card__title-icon" /> Project Domain Distribution
        </h2>
      </div>

      <div className="cd-domain-grid">
        {list.map((d) => (
          <div key={d.name} className="cd-domain-box">
            <span className="cd-domain-name">{d.name}</span>
            <span className="cd-domain-count">{d.count} Teams</span>
          </div>
        ))}
      </div>
    </div>
  );
}
