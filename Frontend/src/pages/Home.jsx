import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"
import Hero from "../components/sections/Hero"
import StatsBar from "../components/sections/StatsBar"
import QuickReport from "../components/sections/QuickReport"
import HowItWorks from "../components/sections/HowItWorks"
import Features from "../components/sections/Features"
import CTASection from "../components/sections/CTASection"

export default function Home() {
  return (
    <div className="bg-black">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <StatsBar />
        <QuickReport />
        <HowItWorks />
        <Features />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}