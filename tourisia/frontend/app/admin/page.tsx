"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Users,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  CreditCard,
  Briefcase,
  User,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    partners: 0,
    pending_partners: 0,
  });
  const [pendingPartners, setPendingPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== "admin") {
      toast.error("Accès refusé.");
      window.location.href = "/";
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}admin/get_stats.php`);
      const statsData = await statsRes.json();
      setStats(statsData);

      const partnersRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}admin/get_partners.php`,
      );
      const partnersData = await partnersRes.json();
      setPendingPartners(
        partnersData.filter((p: any) => Number(p.validation) === 0),
      );
    } catch (err) {
      toast.error("Erreur de récupération des données.");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePartnerStatus = async (partnerId: string, status: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}admin/update_partner_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partner_id: partnerId, status }),
        },
      );
      if (res.ok) {
        toast.success(
          status === 1 ? "Partenaire validé !" : "Partenaire refusé.",
        );
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Erreur de mise à jour.");
    }
  };

  const openPartnerDetails = (partner: any) => {
    setSelectedPartner(partner);
    setShowModal(true);
  };

  const getFileUrl = (path: string) => {
    if (!path) return "";
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  const isPdf = (path: string) => path?.toLowerCase().endsWith(".pdf");
  const isImage = (path: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(path);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-foreground">
              Vue d'ensemble
            </h1>
            <p className="mt-2 text-muted-foreground">
              Résumé des performances et validations en attente.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
            <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <Link
                  href="/admin/users"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Utilisateurs
              </p>
              <p className="text-2xl font-bold">{stats.users}</p>
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <Link
                  href="/admin/partners"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Partenaires Validés
              </p>
              <p className="text-2xl font-bold">
                {stats.partners - stats.pending_partners}
              </p>
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                En attente de validation
              </p>
              <p className="text-2xl font-bold">{stats.pending_partners}</p>
            </div>
          </div>

          <section className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Validations en attente</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Nouveaux partenaires à valider pour accès pro.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-6 py-4">Entreprise</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Manager</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingPartners.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-muted-foreground"
                      >
                        Aucune demande en attente.
                      </td>
                    </tr>
                  ) : (
                    pendingPartners.map((partner: any) => (
                      <tr
                        key={partner.id}
                        className="text-sm hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium">
                            {partner.business_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {partner.city}, {partner.country}
                          </div>
                        </td>
                        <td className="px-6 py-4 capitalize text-muted-foreground">
                          {partner.activity_type}
                        </td>
                        <td className="px-6 py-4">{partner.user_name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openPartnerDetails(partner)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors font-medium text-xs"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                              Voir dossier
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Partner Details Modal */}
      {showModal && selectedPartner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border bg-card/95 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb]">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedPartner.business_name}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground capitalize">
                      {selectedPartner.activity_type}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className={`font-medium ${Number(selectedPartner.validation) === 1 ? "text-green-600" : "text-amber-600"}`}>
                      {Number(selectedPartner.validation) === 1 ? "Partenaire Validé" : "En attente de validation"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-12">
              {/* Infos Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#2563eb]" />
                    Informations Entreprise
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Adresse</p>
                        <p className="text-muted-foreground">
                          {selectedPartner.address || "N/A"},{" "}
                          {selectedPartner.city}, {selectedPartner.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Téléphone professionnel</p>
                        <p className="text-muted-foreground">
                          {selectedPartner.business_phone || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Email professionnel</p>
                        <p className="text-muted-foreground">
                          {selectedPartner.business_email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Site Web</p>
                        <p className="text-muted-foreground text-[#2563eb]">
                          {selectedPartner.website || "Non renseigné"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">RCCM</p>
                      <p className="font-medium">{selectedPartner.rccm_number || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">IFU / NIF</p>
                      <p className="font-medium">{selectedPartner.ifu_number || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-[#2563eb]" />
                    Responsable (Manager)
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="bg-muted/30 p-4 rounded-xl border border-border">
                      <p className="font-bold text-foreground text-base">
                        {selectedPartner.manager_name}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedPartner.manager_role}
                      </p>
                      <div className="grid grid-cols-1 gap-2 mt-3">
                        <p className="text-xs flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />{" "}
                          {selectedPartner.manager_email}
                        </p>
                        <p className="text-xs flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />{" "}
                          {selectedPartner.manager_phone}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                        Plan choisi
                      </p>
                      <span className="px-3 py-1 bg-[#2563eb] text-white text-xs font-bold rounded-full">
                        {selectedPartner.selected_plan || "Débutant"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#2563eb]" />
                  Documents Légaux
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* identity_document */}
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-muted-foreground">
                      Document d'identité
                    </p>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-border overflow-hidden bg-muted/20 flex items-center justify-center">
                      {selectedPartner.identity_document ? (
                        <>
                          {isPdf(selectedPartner.identity_document) ? (
                            <iframe
                              src={getFileUrl(
                                selectedPartner.identity_document,
                              )}
                              className="w-full h-full border-none"
                              title="ID PDF"
                            />
                          ) : (
                            <img
                              src={getFileUrl(
                                selectedPartner.identity_document,
                              )}
                              alt="ID"
                              className="w-full h-full object-contain"
                            />
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Aucun document
                        </span>
                      )}
                    </div>
                    <a
                      href={getFileUrl(selectedPartner.identity_document)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#2563eb] hover:underline flex items-center gap-1"
                    >
                      Ouvrir en plein écran
                    </a>
                  </div>

                  {/* existence_certificate */}
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-muted-foreground">
                      Certificat d'existence
                    </p>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-border overflow-hidden bg-muted/20 flex items-center justify-center">
                      {selectedPartner.existence_certificate ? (
                        <>
                          {isPdf(selectedPartner.existence_certificate) ? (
                            <iframe
                              src={getFileUrl(
                                selectedPartner.existence_certificate,
                              )}
                              className="w-full h-full border-none"
                              title="Cert PDF"
                            />
                          ) : (
                            <img
                              src={getFileUrl(
                                selectedPartner.existence_certificate,
                              )}
                              alt="Cert"
                              className="w-full h-full object-contain"
                            />
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Aucun document
                        </span>
                      )}
                    </div>
                    <a
                      href={getFileUrl(selectedPartner.existence_certificate)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#2563eb] hover:underline flex items-center gap-1"
                    >
                      Ouvrir en plein écran
                    </a>
                  </div>
                </div>
              </div>

              {/* Financial Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#2563eb]" />
                  Informations Financières
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-muted/10 border border-border text-sm">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      IBAN / Compte
                    </p>
                    <p className="font-medium mt-1">
                      {selectedPartner.iban || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Banque
                    </p>
                    <p className="font-medium mt-1">
                      {selectedPartner.bank_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Mobile Money
                    </p>
                    <p className="font-medium mt-1">
                      {selectedPartner.mobile_money_number || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 p-6 border-t border-border bg-card/95 backdrop-blur-sm flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold border border-border hover:bg-muted transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => updatePartnerStatus(selectedPartner.id, 2)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-red-600 border border-red-600/20 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Rejeter
              </button>
              <button
                onClick={() => updatePartnerStatus(selectedPartner.id, 1)}
                className="px-8 py-3 rounded-xl text-sm font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-lg shadow-[#2563eb]/20 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Valider le partenaire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
