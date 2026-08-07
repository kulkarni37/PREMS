import { motion } from 'framer-motion';
import { PiEnvelopeSimple, PiPhone, PiMapPin } from 'react-icons/pi';
import '../styles/contact.css';

const CARDS = [
  { icon: <PiEnvelopeSimple />, title: 'Email', value: 'principalgndecb@gmail.com' },
  { icon: <PiPhone />, title: 'Phone', value: '+91  9741892834' },
  { icon: <PiMapPin />, title: 'Address', value: 'Guru Nanak Dev Engineering College, Bidar, Karnataka' },
];

export default function Contact() {
  return (
    <section id="contact" className="contact section-pad">
      <div className="container">
        <div className="section-head-row">
          <div>
            <span className="eyebrow">Contact</span>
            <h2 className="section-heading">Reach the PRMES team</h2>
          </div>
        </div>

        <div className="contact__layout">
          <div className="contact__cards">
            {CARDS.map((c, i) => (
              <motion.div
                key={c.title}
                className="contact-card card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <span className="contact-card__icon">{c.icon}</span>
                <div>
                  <div className="contact-card__title">{c.title}</div>
                  <div className="contact-card__value">{c.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="contact__map"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            
            <div className="contact__map">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3796.7314572391406!2d77.50726247490478!3d17.89800618789526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcec6e3ee7e6bbb%3A0xbe5504c72b86fb2b!2sGuru%20Nanak%20Dev%20Engineering%20College%20Bidar!5e0!3m2!1sen!2sin!4v1785679734480!5m2!1sen!2sin"
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="strict-origin-when-cross-origin"
    title="Guru Nanak Dev Engineering College Location"
  />
</div>
<div className="contact__map-action">
  <a
    href="https://maps.google.com/?q=Guru+Nanak+Dev+Engineering+College+Bidar"
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-outline"
  >
    📍 View on Google Maps
  </a>
</div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
