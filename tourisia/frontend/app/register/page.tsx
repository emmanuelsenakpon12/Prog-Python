"use client";

import { useState } from "react";
import { Plane, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

const passwordChecks = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/register.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullname: fullName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Inscription réussie ! Vous pouvez maintenant vous connecter.",
        );
        window.location.href = "/login";
      } else {
        toast.error(data.message || "Erreur lors de l'inscription.");
      }
    } catch (error) {
      console.error("Register error:", error);
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
        toast.success("Inscription et connexion Google réussies !");
        window.location.href = "/";
      } else {
        toast.error(data.message || "Erreur lors de l'inscription Google.");
      }
    } catch (error) {
      console.error("Google register error:", error);
      toast.error("Erreur de connexion au serveur Google Auth.");
    } finally {
      setIsLoading(false);
    }
  };

  const allChecksPassed = passwordChecks.every((c) => c.test(password));

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/santorini.jpg"
              alt="Travel destination"
              fill
              className="object-cover"
              priority
            />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-bold text-foreground">
            Créer votre compte
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Commencez à explorer le monde avec Traveler dès aujourd'hui.
          </p>

          {/* Social login */}
          <div className="mt-8 flex flex-col gap-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Échec de la connexion Google")}
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              ou inscrivez-vous par email
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="fullname"
                className="block text-sm font-medium text-foreground"
              >
                Nom complet
              </label>
              <input
                id="fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Mot de passe
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Créez un mot de passe fort"
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

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-2">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full ${check.test(password) ? "bg-emerald-500" : "bg-muted"
                          }`}
                      >
                        {check.test(password) && (
                          <Check className="h-2.5 w-2.5 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs ${check.test(password)
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                          }`}
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 rounded border-border text-[#2563eb] accent-[#2563eb] focus:ring-[#2563eb]"
              />
              <label
                htmlFor="terms"
                className="text-xs text-muted-foreground leading-relaxed"
              >
                J'accepte les{" "}
                <a
                  href="#"
                  className="font-medium text-[#2563eb] hover:text-[#1d4ed8]"
                >
                  Conditions d'utilisation
                </a>{" "}
                et{" "}
                <a
                  href="#"
                  className="font-medium text-[#2563eb] hover:text-[#1d4ed8]"
                >
                  Politique de confidentialité
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || (password.length > 0 && !allChecksPassed)}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Créer un compte
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Vous avez déjà un compte?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/images/santorini.jpg"
          alt="Beautiful Santorini"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-[#2563eb]/80 via-[#2563eb]/50 to-transparent" />

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <div className="flex justify-end">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/Logo-Tourisia-Blanc.png"
                alt="Tourisia"
                width={260}
                height={160}
                priority
              />
            </Link>
          </div>

          <div className="max-w-md self-end text-right">
            <h2 className="text-3xl font-bold text-white leading-tight text-balance">
              Commencez votre voyage dès aujourd'hui.
            </h2>
            <p className="mt-4 text-sm text-white/80 leading-relaxed">
              Créez votre compte gratuit et accédez à des offres exclusives, des
              recommandations personnalisées et des expériences inoubliables
              dans le monde entier.
            </p>

            {/* Testimonial */}
            <div className="mt-8 rounded-xl bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm text-white/90 leading-relaxed italic">
                {
                  '"Tourisia a complètement changé ma façon de planifier mes voyages. Les offres sont incroyables et le processus de réservation est sans faille."'
                }
              </p>
              <div className="mt-3 flex items-center justify-end gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    Sarah Jenkins
                  </p>
                  <p className="text-xs text-white/70">Travel Photographer</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
                  SJ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
