"use client";

import { Menu, X, User, LogOut, Loader2, Sun, Moon, Home, Car, Map, Plane } from "lucide-react";
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

function FerrisWheelIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="2" />
      <line x1="12" y1="2" x2="12" y2="10" />
      <line x1="12" y1="14" x2="12" y2="22" />
      <line x1="2" y1="12" x2="10" y2="12" />
      <line x1="14" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="14.83" y2="9.17" />
      <line x1="9.17" y1="14.83" x2="4.93" y2="19.07" />
    </svg>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    fullname: string;
    role?: string;
  } | null>(null);
  const [hasPartnerAccount, setHasPartnerAccount] = useState(false);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        checkPartnerStatus(parsedUser.id);
      } catch { localStorage.removeItem("user"); }
    }
  }, []);

  const checkPartnerStatus = async (userId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}partners/check_partner_status.php?user_id=${userId}`,
      );
      const data = await res.json();
      if (data.hasPartnerAccount) setHasPartnerAccount(true);
    } catch { /* silencieux */ }
  };

  // Gère le clic sur le bouton partenaire selon les 3 cas
  const handlePartnerClick = async () => {
    // CAS 1 — non connecté → inscription d'abord, puis formulaire partenaire
    if (!user) {
      window.location.href = "/register?from=partner";
      return;
    }
    // CAS 2 — connecté mais pas encore partenaire
    if (!hasPartnerAccount) {
      window.location.href = "/devenir_partenaire";
      return;
    }
    // CAS 3 — déjà partenaire → auto-login et redirection directe
    setIsPartnerLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}partners/get_partner_by_user.php?user_id=${user.id}`,
      );
      const data = await res.json();
      if (data.partner) {
        localStorage.setItem("partner_session", JSON.stringify(data.partner));
        window.location.href = "/espace_partenaire";
      } else {
        toast.error("Impossible d'accéder à l'espace partenaire.");
      }
    } catch {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setIsPartnerLoading(false);
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

  const [navSearchQuery, setNavSearchQuery] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') setNavSearchQuery(window.location.search);
  }, [pathname]);

  const navTabs = [
    { label: 'Hébergements', href: '/offers?type=hebergement', Icon: Home },
    { label: 'Transport',    href: '/offers?type=transport',   Icon: Car },
    { label: 'Activités',   href: '/offers?type=activite',    Icon: FerrisWheelIcon },
    { label: 'Circuits',    href: '/circuits',                Icon: Map },
    { label: 'Vols',        href: '/vols',                    Icon: Plane },
  ];

  const isNavTabActive = (href: string) => {
    if (!href.includes('?')) return pathname === href;
    const [p, q] = href.split('?');
    return pathname === p && navSearchQuery === '?' + q;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm">

        {/* ══════════════════════════════════════════
            LIGNE 1 — Logo + Actions utilisateur
        ══════════════════════════════════════════ */}
        <div className="border-b border-border">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">

            {/* Logo */}
            <a href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src={mounted && resolvedTheme === "dark"
                  ? "/images/Logo-Tourisia-Blanc.png"
                  : "/images/Logo-Tourisia--Principal.png"}
                alt="Tourisia"
                width={140}
                height={52}
                priority
              />
            </a>

            {/* ── Desktop actions ── */}
            <div className="hidden items-center gap-3 md:flex">
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-purple-600 text-purple-600 px-4 py-1.5 text-sm font-bold transition-all hover:bg-purple-600 hover:text-white"
                >
                  Admin
                </Link>
              )}

              {user?.role !== "admin" && (
                hasPartnerAccount ? (
                  <button
                    onClick={handlePartnerClick}
                    disabled={isPartnerLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-[#2563eb] text-[#2563eb] px-4 py-1.5 text-sm font-bold transition-all hover:bg-[#2563eb] hover:text-white disabled:opacity-60"
                  >
                    {isPartnerLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Espace Partenaire
                  </button>
                ) : (
                  <button
                    onClick={handlePartnerClick}
                    className={`rounded-lg border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted ${isActive("/devenir_partenaire") ? "font-bold bg-muted/70" : ""}`}
                  >
                    Devenir Partenaire
                  </button>
                )
              )}

              <LanguageSelector />

              {user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                  {mounted && (
                    <button
                      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      title={resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
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
                    <span className="text-sm font-medium text-foreground">{user.fullname}</span>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-destructive transition-colors" title="Déconnexion">
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
                        <AlertDialogAction onClick={handleLogout} className="bg-destructive text-white hover:bg-destructive/90">
                          Déconnexion
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                  <Link
                    href="/login"
                    className={`text-sm font-medium transition-colors hover:text-foreground ${isActive("/login") ? "font-bold text-foreground" : "text-muted-foreground"}`}
                  >
                    Se Connecter
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-[#2563eb] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8]"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile : contrôles droite + hamburger ── */}
            <div className="flex items-center gap-3 md:hidden">
              <LanguageSelector />
              {user && mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              )}
              {user && <NotificationBell />}
              <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                {mobileOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
              </button>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════
            LIGNE 2 — Onglets services
            (visible desktop + mobile en scroll)
        ══════════════════════════════════════════ */}
        <div className="bg-[#2563eb]">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide py-2">
              {navTabs.map((tab) => (
                <a
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap ${
                    isNavTabActive(tab.href)
                      ? 'border-2 border-white bg-white/10'
                      : 'border-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  <tab.Icon className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-medium">{tab.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            MENU MOBILE (hamburger)
            Contient : partenaire, admin, profil, auth
            Les onglets sont déjà visibles en ligne 2
        ══════════════════════════════════════════ */}
        {mobileOpen && (
          <div className="border-t border-border bg-card px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-purple-600 text-purple-600 px-4 py-2 text-sm font-bold text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Admin
                </Link>
              )}

              {user?.role !== "admin" && (
                hasPartnerAccount ? (
                  <button
                    onClick={() => { setMobileOpen(false); handlePartnerClick(); }}
                    disabled={isPartnerLoading}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-[#2563eb] text-[#2563eb] px-4 py-2 text-sm font-bold disabled:opacity-60"
                  >
                    {isPartnerLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Espace Partenaire
                  </button>
                ) : (
                  <button
                    onClick={() => { setMobileOpen(false); handlePartnerClick(); }}
                    className={`rounded-lg border border-border px-4 py-2 text-sm font-medium text-center ${isActive("/devenir_partenaire") ? "font-bold bg-muted/50" : ""}`}
                  >
                    Devenir Partenaire
                  </button>
                )
              )}

              {user ? (
                <div className="flex flex-col gap-3 border-t border-border pt-3">
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
                        <AlertDialogDescription>Voulez-vous vraiment vous déconnecter ?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Déconnecter
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <div className="flex flex-col gap-2 border-t border-border pt-3">
                  <Link
                    href="/login"
                    className={`text-sm font-medium px-3 py-2 ${isActive("/login") ? "font-bold text-foreground" : "text-muted-foreground"}`}
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
                </div>
              )}

            </div>
          </div>
        )}

      </header>
    </>
  );
}
