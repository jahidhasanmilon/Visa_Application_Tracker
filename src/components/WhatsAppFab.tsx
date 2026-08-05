import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { subscribeHelp } from '../services/siteContentService';

// Always-visible floating button linking to the community WhatsApp group —
// mounted in both AppShell (signed in) and PublicLayout (signed out).
// Renders nothing until admin has set a link via the Help editor.
export default function WhatsAppFab() {
  const [link, setLink] = useState('');

  useEffect(() => subscribeHelp(h => setLink(h.whatsappLink)), []);

  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      title="Join the WhatsApp group"
      aria-label="Join the WhatsApp group"
      style={{
        position: 'fixed', bottom: 22, right: 22, zIndex: 40,
        width: 52, height: 52, borderRadius: '50%',
        background: '#25D366', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(0,0,0,0.22)', textDecoration: 'none',
      }}
    >
      <MessageCircle size={26} fill="#fff" color="#25D366" />
    </a>
  );
}
