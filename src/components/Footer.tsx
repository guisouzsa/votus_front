import { Mail } from "lucide-react";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.828l-5.35-6.24L4.5 22H1.24l8.03-9.18L1 2h6.994l4.83 5.71L18.244 2Zm-1.196 18h1.688L7.03 3.9H5.22L17.048 20Z" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20.5 3.5a10 10 0 0 0-16.9 10.4L2 21l7.3-1.9A10 10 0 1 0 20.5 3.5Z" />
      <path d="M8.5 8.7c.2-.5.5-.5.8-.5h.6c.2 0 .4 0 .6.5.2.5.7 1.6.7 1.7.1.1.1.3 0 .4-.1.2-.1.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.3.1.5.1.7-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.7c.2.1.4.2.4.4.1.5-.1 1.1-.4 1.4-.4.4-1 .7-1.7.7-.9 0-2.6-.4-4.4-1.9-2.2-1.8-3.4-3.9-3.6-4.3-.2-.4-.9-1.6-.9-2.5s.4-1.3.6-1.5Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-12 flex items-center justify-center gap-8 border-t border-line py-6">
      <a href="mailto:contato@votus.com.br" aria-label="E-mail" className="text-brasil-gold hover:opacity-70 transition-opacity">
        <Mail size={22} strokeWidth={1.8} />
      </a>

      <a href="#" aria-label="Instagram" className="text-brasil-gold hover:opacity-70 transition-opacity">
        <InstagramIcon width={22} height={22} />
      </a>

      <a href="#" aria-label="X (Twitter)" className="text-brasil-gold hover:opacity-70 transition-opacity">
        <XIcon width={20} height={20} />
      </a>

      <a href="#" aria-label="WhatsApp" className="text-brasil-gold hover:opacity-70 transition-opacity">
        <WhatsAppIcon width={22} height={22} />
      </a>
    </footer>
  );
}