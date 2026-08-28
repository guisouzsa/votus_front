import LandingHeader from '@/components/LandingHeader';
import HeroSection from '@/components/HeroSection';
import NewsPreviewSection from '@/components/NewsPreviewSection';
import AudienceCategoriesSection from '@/components/AudienceCategoriesSection';
import FeaturesSection from '@/components/FeaturesSection';
import IaUseSection from '@/components/IaUseSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import ParrotBannerSection from '@/components/ParrotBannerSection';
import DevelopersSection from '@/components/DevelopersSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingHeader />
      
      <HeroSection />
      
      <NewsPreviewSection />
      
      <AudienceCategoriesSection />

      <IaUseSection />
      
      <FeaturesSection />
      
      <HowItWorksSection />

      <ParrotBannerSection />
      
      <DevelopersSection />
      
      <Footer />
    </main>
  );
}
