"use client"

import { useState, useCallback, useEffect } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { OffersSection } from "@/components/offers-section"
import { PersonalizedSection } from "@/components/personalized-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  const [showSplash, setShowSplash] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem("splash_shown")
    if (!hasShownSplash) {
      setShowSplash(true)
    }
    setIsReady(true)
  }, [])

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false)
    sessionStorage.setItem("splash_shown", "true")
  }, [])

  if (!isReady) return null;

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <div
        className={`transition-opacity duration-500 ${showSplash ? "opacity-0" : "opacity-100"
          }`}
      >
        <Navbar />
        <main>
          <HeroSection />
          <OffersSection />
          <PersonalizedSection />
          <TestimonialsSection />
          <CtaSection />
        </main>
        <Footer />
      </div>
    </>
  )
}
