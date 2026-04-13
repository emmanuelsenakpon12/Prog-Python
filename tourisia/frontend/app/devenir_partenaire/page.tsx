"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Globe,
  Users,
  TrendingUp,
  Shield,
  BarChart3,
  Headphones,
  CreditCard,
  Star,
  ArrowRight,
  Check,
  ChevronDown,
  Building2,
  Zap,
  Eye,
  FileText,
  User,
  Wallet,
  Loader2,
  X,
  Upload,
} from "lucide-react";

// --- Data Constants ---
const stats = [
  { value: "50K+", label: "Prestataires actifs" },
  { value: "10M+", label: "Voyageurs par mois" },
  { value: "130+", label: "Destinations" },
  { value: "95%", label: "Taux de satisfaction" },
];

const plans = [
  {
    name: "Gratuit",
    price: "Gratuit",
    features: [
      "Jusqu’à 5 annonces",
      "Statistiques de base",
      "Support standard",
      "Paiements sécurisés",
    ],
    cta: "Commencer maintenant",
    highlighted: false,
  },
  {
    name: "Professionnel",
    price: "29 $",
    features: [
      "Annonces illimitées",
      "Statistiques avancées",
      "Support prioritaire",
      "Messagerie avec voyageurs",
      "Importation en masse",
      "Mise en avant premium",
      "Outils promotionnels",
    ],
    cta: "Commencer maintenant",
    highlighted: true,
  },
  {
    name: "Entreprise",
    price: "99 $",
    features: [
      "Tout ce que comporte le pack professionnel",
      "Gestionnaire dédié",
      "Accès API",
      "White-label",
      "Gestion d’équipe",

    ],
    cta: "Commencer maintenant",
    highlighted: false,
  },
];

// --- Sub-components ---

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in zoom-in-95 duration-300 rounded-3xl bg-card p-8 shadow-2xl border border-border text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Demande envoyée !
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Votre demande de compte partenaire a été reçue avec succès. Notre
          équipe va l'étudier et vous recevrez une réponse sous 24h.
        </p>
        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-[#2563eb] py-4 text-sm font-bold text-white transition-all hover:bg-[#1d4ed8]"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

export default function BecomeProviderPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    business_name: "",
    activity_type: "hôtel",
    description: "",
    logo: "",
    address: "",
    city: "",
    country: "",
    business_phone: "",
    business_email: "",
    website: "",
    social_networks: "",
    // Step 2
    rccm_number: "",
    ifu_number: "",
    legal_status: "SARL",
    identity_document: "",
    existence_certificate: "",
    // Step 3
    manager_name: "",
    manager_phone: "",
    manager_email: "",
    manager_role: "admin",
    manager_login: "",
    manager_password: "",
    // Step 4
    account_holder: "",
    bank_name: "",
    iban: "",
    mobile_money_number: "",
    currency: "FCFA",
    is_vat_applicable: false,
    vat_rate: "18",
    billing_address: "",
    selected_plan: "Gratuit",
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  const handleStart = (planName: string = "Gratuit") => {
    if (!currentUser) {
      toast.info("Veuillez vous connecter pour continuer.");
      window.location.href = "/login?redirect=/devenir_partenaire";
      return;
    }
    updateField("selected_plan", planName);
    setIsFormOpen(true);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const upData = new FormData();
    upData.append("file", file);
    upData.append("type", type);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}partners/upload_docs.php`,
        {
          method: "POST",
          body: upData,
        },
      );
      const data = await res.json();
      if (res.ok) {
        updateField(
          type === "logo"
            ? "logo"
            : type === "rccm"
              ? "identity_document"
              : "existence_certificate",
          data.path,
        );
        toast.success("Fichier téléchargé !");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Erreur de téléchargement.");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Simulation chargement 5s comme demandé
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}partners/register_partner.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, user_id: currentUser.id }),
        },
      );

      if (res.ok) {
        setShowSuccess(true);
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess)
    return <SuccessModal onClose={() => (window.location.href = "/")} />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {!isFormOpen ? (
          <>
            {/* --- Landing Page Content --- */}
            <section className="relative overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src="/images/provider-hero.png"
                  alt="Hero"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
              </div>
              <div className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-36">
                <div className="max-w-2xl">
                  <h1 className="text-4xl font-bold text-white sm:text-6xl text-balance">
                    Développez votre activité touristique
                  </h1>
                  <p className="mt-6 max-w-lg bg-white/10 backdrop-blur-md text-white leading-relaxed p-6 rounded-2xl border border-white/20">
                    Rejoignez Tourisia et proposez vos services à des millions
                    de voyageurs. Plusieurs plans adaptés à votre croissance.
                  </p>
                  <button
                    onClick={() => handleStart("Débutant")}
                    className="mt-8 flex items-center gap-2 rounded-xl bg-[#2563eb] px-8 py-4 text-sm font-bold text-white hover:bg-[#1d4ed8] shadow-lg shadow-[#2563eb]/30"
                  >
                    Commencer à publier maintenant{" "}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">Choisissez votre plan</h2>
              </div>
              <div className="grid gap-8 lg:grid-cols-3">
                {plans.map((plan, i) => (
                  <div
                    key={i}
                    className={`rounded-3xl border p-8 flex flex-col ${plan.highlighted ? "border-[#2563eb] ring-2 ring-[#2563eb]/20 shadow-xl" : "border-border bg-card"}`}
                  >
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-4 text-3xl font-bold text-[#2563eb]">
                      {plan.price}
                    </div>
                    <ul className="mt-6 space-y-3 flex-1">
                      {plan.features.map((f, j) => (
                        <li
                          key={j}
                          className="flex items-center gap-3 text-sm text-muted-foreground"
                        >
                          <Check className="h-4 w-4 text-[#2563eb]" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleStart(plan.name)}
                      className={`mt-8 w-full rounded-xl py-3 text-sm font-bold transition-all ${plan.highlighted ? "bg-[#2563eb] text-white" : "bg-muted text-foreground hover:bg-border"}`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* --- Multi-step Form --- */
          <section className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Inscription Partenaire</h1>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full p-2 hover:bg-muted text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-4">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${step >= s ? "bg-[#2563eb]" : "bg-border"}`}
                    />
                    <p
                      className={`mt-2 text-xs font-semibold ${step >= s ? "text-[#2563eb]" : "text-muted-foreground"}`}
                    >
                      Étape {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 lg:p-12 shadow-sm min-h-[500px] flex flex-col">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-[#2563eb]" />
                  </div>
                  <p className="font-semibold text-lg">
                    Envoi de votre demande...
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Merci de patienter quelques secondes pendant que nous
                    préparons votre dossier.
                  </p>
                </div>
              ) : (
                <>
                  {/* STEP 1: PROFIL ENTREPRISE */}
                  {step === 1 && (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold">Profil Entreprise</h2>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Nom commercial
                          </label>
                          <input
                            type="text"
                            value={formData.business_name}
                            onChange={(e) =>
                              updateField("business_name", e.target.value)
                            }
                            placeholder="Ex: Tourisia Travel"
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Type d'activité
                          </label>
                          <select
                            value={formData.activity_type}
                            onChange={(e) =>
                              updateField("activity_type", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                          >
                            <option value="hôtel">Hôtel / Hébergement</option>
                            <option value="resto">
                              Restaurant / Gastronomie
                            </option>
                            <option value="agence">Agence de voyage</option>
                            <option value="guide">Guide touristique</option>
                            <option value="location">
                              Location de véhicule
                            </option>
                          </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium">
                            Description du service
                          </label>
                          <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) =>
                              updateField("description", e.target.value)
                            }
                            placeholder="Présentez brièvement votre entreprise..."
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Adresse complète
                          </label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) =>
                              updateField("address", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Ville / Pays
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                              updateField("city", e.target.value)
                            }
                            placeholder="Ex: Paris, France"
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Email professionnel
                          </label>
                          <input
                            type="email"
                            value={formData.business_email}
                            onChange={(e) =>
                              updateField("business_email", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Téléphone pro
                          </label>
                          <input
                            type="tel"
                            value={formData.business_phone}
                            onChange={(e) =>
                              updateField("business_phone", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Logo</label>
                          <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-border hover:border-[#2563eb]/50 transition-colors p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "logo")}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {formData.logo ? (
                              <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium">
                                <Check className="h-4 w-4" /> Logo chargé
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  PNG, JPG ou SVG
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: INFOS LEGALES */}
                  {step === 2 && (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold">
                          Informations Légales
                        </h2>
                      </div>

                      <div className="grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Numéro RCCM
                            </label>
                            <input
                              type="text"
                              value={formData.rccm_number}
                              onChange={(e) =>
                                updateField("rccm_number", e.target.value)
                              }
                              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              IFU / NIF
                            </label>
                            <input
                              type="text"
                              value={formData.ifu_number}
                              onChange={(e) =>
                                updateField("ifu_number", e.target.value)
                              }
                              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Statut juridique
                          </label>
                          <select
                            value={formData.legal_status}
                            onChange={(e) =>
                              updateField("legal_status", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          >
                            <option value="SARL">SARL / SAS</option>
                            <option value="individuelle">
                              Entreprise individuelle
                            </option>
                            <option value="ONG">ONG / Association</option>
                          </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Pièce d'identité du responsable (PDF)
                            </label>
                            <div className="relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleFileUpload(e, "rccm")}
                                className="absolute inset-0 opacity-0"
                              />
                              <div className="flex flex-col items-center gap-1">
                                {formData.identity_document ? (
                                  <Check className="text-emerald-500" />
                                ) : (
                                  <Upload className="h-5 w-5 text-muted-foreground" />
                                )}
                                <span className="text-xs">
                                  {formData.identity_document
                                    ? "Cliqué"
                                    : "Choisir un PDF"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Attestation légale (PDF)
                            </label>
                            <div className="relative rounded-xl border-2 border-dashed p-6 text-center hover:bg-muted/50 transition-colors">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) =>
                                  handleFileUpload(e, "existence")
                                }
                                className="absolute inset-0 opacity-0"
                              />
                              <div className="flex flex-col items-center gap-1">
                                {formData.existence_certificate ? (
                                  <Check className="text-emerald-500" />
                                ) : (
                                  <Upload className="h-5 w-5 text-muted-foreground" />
                                )}
                                <span className="text-xs">Choisir un PDF</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: RESPONSABLE */}
                  {step === 3 && (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold">
                          Responsable du compte
                        </h2>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Nom & prénom
                          </label>
                          <input
                            type="text"
                            value={formData.manager_name}
                            onChange={(e) =>
                              updateField("manager_name", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <input
                            type="email"
                            value={formData.manager_email}
                            onChange={(e) =>
                              updateField("manager_email", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={formData.manager_phone}
                            onChange={(e) =>
                              updateField("manager_phone", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Rôle</label>
                          <select
                            value={formData.manager_role}
                            onChange={(e) =>
                              updateField("manager_role", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          >
                            <option value="admin">Administrateur</option>
                            <option value="manager">Manager</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Login dashboard
                          </label>
                          <input
                            type="text"
                            value={formData.manager_login}
                            onChange={(e) =>
                              updateField("manager_login", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Mot de passe
                          </label>
                          <input
                            type="password"
                            value={formData.manager_password}
                            onChange={(e) =>
                              updateField("manager_password", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: FINANCIER */}
                  {step === 4 && (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold">
                          Informations financières
                        </h2>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Titulaire du compte
                          </label>
                          <input
                            type="text"
                            value={formData.account_holder}
                            onChange={(e) =>
                              updateField("account_holder", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Banque</label>
                          <input
                            type="text"
                            value={formData.bank_name}
                            onChange={(e) =>
                              updateField("bank_name", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            IBAN / RIB
                          </label>
                          <input
                            type="text"
                            value={formData.iban}
                            onChange={(e) =>
                              updateField("iban", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Mobile Money (Optional)
                          </label>
                          <input
                            type="tel"
                            value={formData.mobile_money_number}
                            onChange={(e) =>
                              updateField("mobile_money_number", e.target.value)
                            }
                            placeholder="Ex: +229 97000000"
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Devise</label>
                          <select
                            value={formData.currency}
                            onChange={(e) =>
                              updateField("currency", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          >
                            <option value="FCFA">CFA (XOF/XAF)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="USD">Dollar (USD)</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-3 md:mt-8">
                          <input
                            type="checkbox"
                            checked={formData.is_vat_applicable}
                            onChange={(e) =>
                              updateField("is_vat_applicable", e.target.checked)
                            }
                            className="h-5 w-5 rounded-md border-border text-[#2563eb] focus:ring-[#2563eb]"
                          />
                          <label className="text-sm font-medium">
                            Assujetti à la TVA ?
                          </label>
                        </div>
                        {formData.is_vat_applicable && (
                          <div className="space-y-2 animate-in slide-in-from-top duration-300">
                            <label className="text-sm font-medium">
                              Taux TVA (%)
                            </label>
                            <input
                              type="number"
                              value={formData.vat_rate}
                              onChange={(e) =>
                                updateField("vat_rate", e.target.value)
                              }
                              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                            />
                          </div>
                        )}
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium">
                            Adresse de facturation
                          </label>
                          <textarea
                            rows={2}
                            value={formData.billing_address}
                            onChange={(e) =>
                              updateField("billing_address", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORM ACTIONS */}
                  <div className="mt-auto pt-10 flex items-center justify-between border-t border-border mt-10">
                    <button
                      type="button"
                      onClick={() =>
                        step === 1
                          ? setIsFormOpen(false)
                          : setStep((s) => s - 1)
                      }
                      className="px-6 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {step === 1 ? "Annuler" : "Précédent"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        step === 4 ? handleSubmit() : setStep((s) => s + 1)
                      }
                      className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#1d4ed8] hover:shadow-lg shadow-[#2563eb]/20"
                    >
                      {step === 4 ? "Finaliser l'inscription" : "Suivant"}
                      {step !== 4 && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
