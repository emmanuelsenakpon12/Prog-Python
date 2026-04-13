"use client";

import { useState } from "react";
import { Plane, Eye, EyeOff, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user)); // Sauvegarder l'utilisateur
        toast.success("Connexion réussie !");
        window.location.href = "/";
      } else {
        toast.error(data.message || "Erreur lors de la connexion.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Une erreur est survenue lors de la connexion au serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}auth/google_auth.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Connexion Google réussie !");
        window.location.href = "/";
      } else {
        toast.error(data.message || "Erreur lors de la connexion Google.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Erreur de connexion au serveur Google Auth.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/images/auth-bg.jpg"
          alt="Travel destination"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/80 via-[#2563eb]/70 to-transparent" />

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/Logo-Tourisia-Blanc.png"
              alt="Tourisia"
              width={260}
              height={160}
              priority
            />
          </Link>

          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-white leading-tight text-balance">
              Votre prochaine aventure est à portée de clic.
            </h2>
            <p className="mt-4 text-sm text-white/80 leading-relaxed">
              Rejoignez plus de 10 millions de voyageurs qui font confiance à
              Traveler pour découvrir des expériences uniques et des trésors
              cachés dans plus de 130 destinations.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold text-white">130+</p>
                <p className="text-xs text-white/70">destinations</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <p className="text-2xl font-bold text-white">10M+</p>
                <p className="text-xs text-white/70">Voyageurs</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <p className="text-2xl font-bold text-white">50K+</p>
                <p className="text-xs text-white/70">Experiences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/Logo-Tourisia--Principal.png"
              alt="Traveler"
              width={160}
              height={60}
              priority
            />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-bold text-foreground">
            Content de te revoir
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous à votre compte pour continuer votre exploration.
          </p>

          {/* Social login */}
          <div className="mt-8 flex flex-col gap-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Échec de la connexion Google")}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              ou continuez par courriel
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Adresse Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tourisia@gmail.com"
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Mot de passe
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8]"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrer votre mot de passe"
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-[#2563eb] accent-[#2563eb] focus:ring-[#2563eb]"
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground"
              >
                Souviens-toi de moi pendant 30 jours
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Se Connecter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Vous n'avez pas de compte ? "}{" "}
            <Link
              href="/register"
              className="font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
            >
              Créez-en un
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
