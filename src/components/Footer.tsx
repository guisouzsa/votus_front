export default function Footer() {
  return (
    <footer className="mt-12 flex items-center justify-center gap-8 border-t border-line py-10 sm:gap-12">
      <a href="mailto:contato@votus.com.br" aria-label="E-mail" className="hover:opacity-70 transition-opacity">
        <img src="/email.svg" alt="" className="h-5 w-5" />
      </a>
      <a href="#" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
        <img src="/instagram.svg" alt="" className="h-5 w-5" />
      </a>
      <a href="#" aria-label="X (Twitter)" className="hover:opacity-70 transition-opacity">
        <img src="/x.svg" alt="" className="h-5 w-5" />
      </a>
      <a href="#" aria-label="WhatsApp" className="hover:opacity-70 transition-opacity">
        <img src="/whatsapp.svg" alt="" className="h-5 w-5" />
      </a>
    </footer>
  );
}