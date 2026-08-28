import Sidebar from "@/components/Sidebar";
import WovenRibbon from "@/components/WovenRibbon";
import WelcomeHeader from "@/components/WelcomeHeader";
import HighlightGrid from "@/components/Highlightgrid";
import FloatingAIButton from "@/components/FloatingAIButton";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />

      <main className="overflow-x-hidden md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <WelcomeHeader />
          <HighlightGrid />
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
}