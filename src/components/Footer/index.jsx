import Image from 'next/image';
import Link from 'next/link';
import './index.css';

const quickLinks = [
  { label: 'Shop Now', href: '/shop' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Deal of the Week', href: '/deals' },
  { label: 'Contact', href: '/contact-us' },
];

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/' },
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'X', href: 'https://x.com/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { label: 'YouTube', href: 'https://www.youtube.com/' },
];

function ContactItem({ icon, iconWidth, iconHeight, children, href }) {
  const content = (
    <>
      <span
        className="nana-footer__contact-icon"
        style={{ width: iconWidth, height: iconHeight }}
        aria-hidden="true"
      >
        <Image src={icon} alt="" width={iconWidth} height={iconHeight} />
      </span>
      <span>{children}</span>
    </>
  );

  return href ? (
    <a className="nana-footer__contact-item" href={href}>
      {content}
    </a>
  ) : (
    <div className="nana-footer__contact-item">{content}</div>
  );
}

export default function Footer() {
  return (
    <footer className="nana-footer">
      <div className="nana-footer__main">
        <div className="nana-footer__grid">
          <div className="nana-footer__brand">
            <Image
              src="/footerLogo.svg"
              alt="Nana Organics"
              width={106}
              height={92}
              className="nana-footer__logo"
            />
          </div>

          <nav className="nana-footer__section" aria-labelledby="footer-quick-links">
            <h2 id="footer-quick-links" className="nana-footer__heading">
              Quick Links
            </h2>
            <ul className="nana-footer__quick-links">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <section className="nana-footer__section" aria-labelledby="footer-contact">
            <h2 id="footer-contact" className="nana-footer__heading">
              Get In Touch
            </h2>
            <div className="nana-footer__contact-list">
              <ContactItem icon="/footer/location.svg" iconWidth={14} iconHeight={17}>
                123 Street Name, City, State, ZIP
              </ContactItem>
              <ContactItem
                icon="/footer/email.svg"
                iconWidth={15}
                iconHeight={12}
                href="mailto:support@nanaorganics.com"
              >
                support@nanaorganics.com
              </ContactItem>
              <ContactItem
                icon="/footer/phone.svg"
                iconWidth={13}
                iconHeight={15}
                href="tel:+91123456789"
              >
                +91 123 456 789
              </ContactItem>
            </div>
          </section>

          <section className="nana-footer__section" aria-labelledby="footer-social">
            <h2 id="footer-social" className="nana-footer__heading">
              Social Connection
            </h2>
            <div className="nana-footer__socials">
              <Image
                src="/footer/social-icons.svg"
                alt=""
                width={192}
                height={16}
                aria-hidden="true"
              />
              {socialLinks.map((social, index) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  style={{ left: index * 44 }}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="nana-footer__legal">
        <p>© 2025 Nana Organics. All rights reserved.</p>
        <p>Privacy Policy. Terms of Service. Cookie Settings.</p>
      </div>
    </footer>
  );
}
