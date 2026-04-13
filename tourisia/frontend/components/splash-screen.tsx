"use client";

import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import Image from "next/image";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setFadeOut(true);
        setTimeout(() => {
          onFinish();
        }, 600);
      }
      setProgress(current);
    }, interval);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#007bff] transition-opacity duration-600 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-[#3b82f6] opacity-30 blur-3xl animate-pulse" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-[#1d4ed8] opacity-20 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 animate-[fadeInUp_0.8s_ease-out]">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Plane className="h-8 w-8 text-white" />
          </div>
          <span className="text-4xl font-bold tracking-tight text-white">
            <Image
              src="/images/Logo-Tourisia-Blanc.png"
              alt="Traveler"
              width={160}
              height={60}
              priority
            />
          </span>
        </div>

        {/* Tagline */}
        <p className="animate-[fadeInUp_0.8s_ease-out_0.3s_both] text-lg text-white/80">
          Explorez le monde, à votre façon.
        </p>

        {/* Progress bar */}
        <div className="w-64 animate-[fadeInUp_0.8s_ease-out_0.6s_both]">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-center text-sm text-white/60">
            {progress < 30
              ? "Découvrir des destinations..."
              : progress < 60
                ? "Trouver les meilleures offres..."
                : progress < 90
                  ? "Préparer votre voyage..."
                  : "Presque prêt !"}
          </p>
        </div>

        {/* Animated plane */}
        <div
          className="absolute -top-20 animate-[fly_3s_ease-in-out_infinite]"
          style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
        >
          <Plane className="h-5 w-5 rotate-[-30deg] text-white/40" />
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fly {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-10px) translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
