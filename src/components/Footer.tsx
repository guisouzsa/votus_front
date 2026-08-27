export default function Footer() {
  return (
    <footer className="mt-12 flex items-center justify-center gap-20 border-t border-line py-6">
      <a href="mailto:contato@votus.com.br" aria-label="E-mail" className="hover:opacity-70 transition-opacity">
        <img src="/email.svg" alt="" className="h-15 w-15" />
      </a>

      <a href="#" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
        <img src="/instagram.svg" alt="" className="h-15 w-15" />
      </a>

      <a href="#" aria-label="X (Twitter)" className="hover:opacity-70 transition-opacity">
        <img src="/x.svg" alt="" className="h-15 w-15" />
      </a>

      <a href="#" aria-label="WhatsApp" className="hover:opacity-70 transition-opacity">
        <img src="/whatsapp.svg" alt="" className="h-15 w-15" />
      </a>
    </footer>
  );
}