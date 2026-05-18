"use client";

import { Menu, X, User, LogOut, Loader2, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { NotificationBell } from "@/components/notification-bell";
import { LanguageSelector } from "@/components/language-selector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    fullname: string;
    role?: string;
  } | null>(null);
  const [hasPartnerAccount, setHasPartnerAccount] = useState(false);
  const [showPartnerLogin, setShowPartnerLogin] = useState(false);
  const [partnerLoginData, setPartnerLoginData] = useState({
    login: "",
    password: "",
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      checkPartnerStatus(parsedUser.id);
    }
  }, []);

  const checkPartnerStatus = async (userId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}partners/check_partner_status.php?user_id=${userId}`,
      );
      const data = await res.json();
      if (data.hasPartnerAccount) {
        setHasPartnerAccount(true);
      }
    } catch (err) {
      console.error("Error checking partner status:", err);
    }
  };

  const handlePartnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}partners/partner_login.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partnerLoginData),
        },
      );
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("partner_session", JSON.stringify(data.partner));
        toast.success("Espace partenaire ouvert !");
        setShowPartnerLogin(false);
        window.location.href = "/espace_partenaire";
      } else {
        toast.error(data.message || "Identifiants incorrects.");
      }
    } catch (err) {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("partner_session");
    setUser(null);
    setHasPartnerAccount(false);
    window.location.href = "/login";
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname === path;
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <Image
              src={mounted && resolvedTheme === "dark" ? "/images/Logo-Tourisia-Blanc.png" : "/images/Logo-Tourisia--Principal.png"}
              alt="Traveler"
              width={160}
              height={60}
              priority
            />
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="/"
              className={`text-sm font-medium transition-colors hover:text-foreground ${isActive("/")
                ? "font-bold text-foreground"
                : "text-muted-foreground"
                }`}
            >
              Explorer
            </a>
            <a
              href="/offers"
              className={`text-sm font-medium transition-colors hover:text-foreground ${isActive("/offers")
                ? "font-bold text-foreground"
                : "text-muted-foreground"
                }`}
            >
              Offres
            </a>
            {/*
            <a
              href="/destinations"
              className={`text-sm font-medium transition-colors hover:text-foreground ${isActive("/destinations")
                ? "font-bold text-foreground"
                : "text-muted-foreground"
                }`}
            >
              Destinations
            </a>
            */}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-lg border border-purple-600 text-purple-600 px-4 py-2 text-sm font-bold transition-all hover:bg-purple-600 hover:text-white"
              >
                Admin
              </Link>
            )}

            {user?.role !== "admin" &&
              (hasPartnerAccount ? (
                <button
                  onClick={() => {
                    if (pathname !== "/espace_partenaire") {
                      setShowPartnerLogin(true);
                    }
                  }}
                  className="rounded-lg border border-[#2563eb] text-[#2563eb] px-4 py-2 text-sm font-bold transition-all hover:bg-[#2563eb] hover:text-white"
                >
                  Espace Partenaire
                </button>
              ) : (
                <Link
                  href="/devenir_partenaire"
                  className={`rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted ${isActive("/devenir_partenaire") ? "font-bold bg-muted/70" : ""}`}
                >
                  Devenir Partenaire
                </Link>
              ))}

            <div className="flex items-center gap-4">
              <LanguageSelector />
            </div>

            {user ? (
              <div className="flex items-center gap-4 ml-2 pl-4 border-l border-border">
                {/* Theme toggle */}
                {mounted && (
                  <button
                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    title={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                  >
                    {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                )}
                <NotificationBell />
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563eb]/10 text-[#2563eb]">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {user.fullname}
                  </span>
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Déconnexion"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Vous allez être déconnecté de votre compte Tourisia.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Déconnexion
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-medium transition-colors hover:text-foreground ${isActive("/login")
                    ? "font-bold text-foreground"
                    : "text-muted-foreground"
                    }`}
                >
                  Se Connecter
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile: bell + lang + menu button */}
          <div className="flex items-center gap-4 md:hidden">
            <LanguageSelector />
            {user && mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                title={resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-border bg-card px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a
                href="/"
                className={`text-sm font-medium ${isActive("/")
                  ? "font-bold text-foreground"
                  : "text-muted-foreground"
                  }`}
                onClick={() => setMobileOpen(false)}
              >
                Explorer
              </a>
              <a
                href="/offers"
                className={`text-sm font-medium ${isActive("/offers")
                  ? "font-bold text-foreground"
                  : "text-muted-foreground"
                  }`}
                onClick={() => setMobileOpen(false)}
              >
                Offres
              </a>
              {/*
              <a
                href="/destinations"
                className={`text-sm font-medium ${isActive("/destinations")
                  ? "font-bold text-foreground"
                  : "text-muted-foreground"
                  }`}
                onClick={() => setMobileOpen(false)}
              >
                Destinations
              </a>
              */}
              <hr className="border-border" />

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-purple-600 text-purple-600 px-4 py-2 text-sm font-bold text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Admin
                </Link>
              )}

              {user?.role !== "admin" &&
                (hasPartnerAccount ? (
                  <button
                    onClick={() => {
                      if (pathname !== "/espace_partenaire") {
                        setShowPartnerLogin(true);
                      }
                      setMobileOpen(false);
                    }}
                    className="rounded-lg border border-[#2563eb] text-[#2563eb] px-4 py-2 text-sm font-bold text-center"
                  >
                    Espace Partenaire
                  </button>
                ) : (
                  <Link
                    href="/devenir_partenaire"
                    className={`rounded-lg border border-border px-4 py-2 text-sm font-medium text-center ${isActive("/devenir_partenaire") ? "font-bold bg-muted/50" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    Devenir Partenaire
                  </Link>
                ))}

              {user ? (
                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 hover:bg-muted/80 transition-colors"
                  >
                    <User className="h-4 w-4 text-[#2563eb]" />
                    <span className="text-sm font-medium">{user.fullname}</span>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive">
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[calc(100%-2rem)]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Déconnexion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Voulez-vous vraiment vous déconnecter ?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleLogout}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Déconnecter
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`text-sm font-medium ${isActive("/login")
                      ? "font-bold text-foreground"
                      : "text-muted-foreground"
                      }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    Se Connecter
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-[#2563eb] px-4 py-2 text-center text-sm font-medium text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Partner Login Modal */}
      {showPartnerLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Connexion Partenaire</h2>
              <button
                onClick={() => setShowPartnerLogin(false)}
                className="hover:text-foreground text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handlePartnerLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                  Login Manager
                </label>
                <input
                  type="text"
                  required
                  value={partnerLoginData.login}
                  onChange={(e) =>
                    setPartnerLoginData({
                      ...partnerLoginData,
                      login: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                  placeholder="Manager ID"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={partnerLoginData.password}
                  onChange={(e) =>
                    setPartnerLoginData({
                      ...partnerLoginData,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full rounded-xl bg-[#2563eb] py-4 text-sm font-bold text-white transition-all hover:bg-[#1d4ed8] shadow-lg shadow-[#2563eb]/20 flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Se connecter à l'espace"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
