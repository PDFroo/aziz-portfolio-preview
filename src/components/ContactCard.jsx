import { STATIC } from "../base";
const placeholderValues = new Set(["", "#", "your-email@example.com", "+880 0000-000000"]);

function isPlaceholder(value = "") {
  return placeholderValues.has(String(value).trim().toLowerCase());
}

function normalizeExternalUrl(value = "") {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "#") return "";
  if (/^(https?:|mailto:|tel:|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function cleanPhone(value = "") {
  return value.replace(/[^\d+]/g, "");
}

function hasRealPhone(value = "") {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && !/^0+$/.test(digits);
}

function socialHref(item, phone) {
  const label = item.label.toLowerCase();
  const normalized = normalizeExternalUrl(item.url || "");

  if (normalized) return normalized;

  if (label.includes("whatsapp") && hasRealPhone(phone)) {
    return `https://wa.me/${cleanPhone(phone).replace(/^\+/, "")}`;
  }

  return "";
}

function ContactAction({ href, navigate, external = false, children }) {
  if (!href && STATIC) return <span className="contact-action">{children}</span>;
  if (!href) {
    return (
      <button className="contact-action" type="button" onClick={() => navigate("/admin")} title="Add this real link from the admin panel">
        {children}
      </button>
    );
  }

  return (
    <a className="contact-action" href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      {children}
    </a>
  );
}

export default function ContactCard({ content, navigate }) {
  const email = content.contact.email || "";
  const phone = content.contact.phone || "";
  const cvUrl = normalizeExternalUrl(content.contact.cvUrl || "");
  const emailHref = isPlaceholder(email) ? "" : `mailto:${email}`;
  const phoneHref = hasRealPhone(phone) ? `tel:${cleanPhone(phone)}` : "";

  return (
    <div className="contact-card motion-card" data-reveal>
      <ContactAction href={emailHref} navigate={navigate}>{email}</ContactAction>
      <ContactAction href={phoneHref} navigate={navigate}>{phone}</ContactAction>
      <ContactAction href={cvUrl} navigate={navigate} external={Boolean(cvUrl)}>Download CV</ContactAction>
      <div className="social-list">
        {content.socialLinks.map((item) => {
          const href = socialHref(item, phone);
          return (
            <ContactAction key={item.label} href={href} navigate={navigate} external={Boolean(href)}>
              {item.label}
            </ContactAction>
          );
        })}
      </div>
    </div>
  );
}
