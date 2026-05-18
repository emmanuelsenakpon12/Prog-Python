"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  Settings,
  LogOut,
  ArrowUpRight,
  Building2,
  FileText,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Save,
  Loader2,
  Eye,
  Download,
  X,
  Plus,
  Upload,
  Trash2,
  Image as ImageIcon,
  Video,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MessageSquare,
  Send,
  ArrowLeft,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function PartnerDashboard() {
  const [partner, setPartner] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [settingsSubTab, setSettingsSubTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractHtml, setContractHtml] = useState("");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Form states
  const [formData, setFormData] = useState<any>({});
  const [offers, setOffers] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImportOffers, setPendingImportOffers] = useState<any[] | null>(null);

  // Offer Modal states
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newOffer, setNewOffer] = useState({
    type: "herbergement",
    title: "",
    description: "",
    location: "",
    price: "",
    currency: "CFA",
    images: [] as string[],
    video: "",
    details: {},
  });

  // Delete & Details states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOfferDetails, setSelectedOfferDetails] = useState<any>(null);

  // Messaging states
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const storedPartner = localStorage.getItem("partner_session");
    if (!storedPartner) {
      window.location.href = "/devenir_partenaire";
      return;
    }
    const data = JSON.parse(storedPartner);
    setPartner(data);
    setFormData(data);
    fetchOffers(data.id);
  }, []);

  // Real-time Polling for Partner Messaging
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activeTab === "messagerie" && partner) {
      // Immediate fetch when switching to tab
      fetchConversations(partner.id);

      // Set interval for every 5 seconds
      interval = setInterval(() => {
        // Refresh conversations list
        fetchConversations(partner.id, true); // true = silent refresh

        // If a conversation is open, refresh its messages
        if (selectedConversation) {
          refreshMessages(selectedConversation.user_id);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, partner, selectedConversation]);

  const fetchOffers = async (partnerId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}offers/get_offers.php?partner_id=${partnerId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des offres", err);
    }
  };

  const fetchConversations = async (partnerId: number, silent = false) => {
    if (!silent) setLoadingConversations(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}messages/get_conversations.php?partner_id=${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setConversations(data);
      }
    } catch (err) {
      console.error("Error fetching conversations", err);
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  const refreshMessages = async (userId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}messages/get_messages.php?user_id=${userId}&partner_id=${partner.id}&mark_read=1&viewer_type=partner`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      }
    } catch (err) {
      console.error("Error polling messages", err);
    }
  };

  const openConversation = async (conv: any) => {
    setSelectedConversation(conv);
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}messages/get_messages.php?user_id=${conv.user_id}&partner_id=${partner.id}&mark_read=1&viewer_type=partner`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !partner) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}messages/send_message.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: partner.id,
          receiver_id: selectedConversation.user_id,
          sender_type: "partner",
          message: messageInput.trim(),
        }),
      });
      if (res.ok) {
        setMessageInput("");
        // Refresh messages
        const resMsg = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}messages/get_messages.php?user_id=${selectedConversation.user_id}&partner_id=${partner.id}&viewer_type=partner`
        );
        const data = await resMsg.json();
        if (Array.isArray(data)) setMessages(data);
      }
    } catch (err) {
      toast.error("Erreur lors de l'envoi du message.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("partner_session");
    window.location.href = "/";
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}partners/update_partner.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, partner_id: partner.id }),
        },
      );
      const result = await res.json();
      if (res.ok) {
        toast.success("Profil mis à jour !");
        setPartner(result.partner);
        localStorage.setItem("partner_session", JSON.stringify(result.partner));
      } else {
        toast.error(result.message || "Erreur de mise à jour");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContract = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}partners/generate_contract.php?partner_id=${partner.id}`,
      );
      const result = await res.json();
      if (res.ok) {
        setContractHtml(result.contract_html);
        setShowContractModal(true);
      } else {
        toast.error("Impossible de générer le contrat.");
      }
    } catch (err) {
      toast.error("Erreur serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
                <html>
                    <head>
                        <title>Contrat de prestation - ${partner.business_name}</title>
                        <style>
                            body { margin: 0; padding: 20px; font-family: sans-serif; }
                            @media print {
                                @page { margin: 1cm; }
                            }
                        </style>
                    </head>
                    <body>
                        ${contractHtml}
                        <script>
                            window.onload = function() {
                                window.print();
                                setTimeout(() => window.close(), 500);
                            };
                        </script>
                    </body>
                </html>
            `);
      printWindow.document.close();
    }
  };

  const handleDownloadExcelFormat = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Template
    const templateData = [
      ["type", "titre", "description", "location", "prix", "devise", "caracteristiques", "images"],
      ["herbergement", "Hôtel de la Plage", "Un magnifique hôtel avec vue sur mer.", "Dakar, Sénégal", "50000", "CFA", "Wifi: Oui | Piscine: Oui | Petit déjeuner: Inclus", "chambre.jpg, vue_mer.png"],
      ["activite", "Visite de l'île de Gorée", "Une visite guidée complète.", "Dakar, Sénégal", "15000", "CFA", "Guide: Inclus | Transport: Non inclus | Durée: 3h", "goree1.jpg, goree2.jpg"],
    ];
    const wsTemplate = XLSX.utils.aoa_to_sheet(templateData);

    wsTemplate['!cols'] = [
      { wch: 15 }, { wch: 30 }, { wch: 50 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 60 }, { wch: 40 }
    ];
    XLSX.utils.book_append_sheet(wb, wsTemplate, "Modèle_Import");

    // Sheet 2: Instructions
    const instructionsData = [
      ["Instructions pour l'importation"],
      [""],
      ["Colonne", "Description", "Exemple"],
      ["type", "Le type de l'offre (herbergement, activite, vol, transport).", "herbergement"],
      ["titre", "Le nom de votre offre.", "Hôtel de la Plage"],
      ["description", "Une description détaillée (sans sauts de ligne).", "Bel hôtel..."],
      ["location", "L'adresse ou la ville.", "Dakar, Sénégal"],
      ["prix", "Le prix unitaire (uniquement des chiffres).", "50000"],
      ["devise", "La devise (CFA, EUR, USD). Par défaut: CFA.", "CFA"],
      ["caracteristiques", "Paires clé:valeur séparées par des pipelines (|).", "Wifi: Oui | Piscine: Oui"],
      ["images", "Noms exacts des fichiers images séparés par une virgule. Vous devrez sélectionner le dossier les contenant à l'étape suivante.", "chambre.jpg, facade.png"],
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 20 }, { wch: 70 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

    XLSX.writeFile(wb, "Modele_Import_Offres.xlsx");
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !partner) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast.error("Veuillez sélectionner un fichier Excel (.xlsx ou .xls).");
      return;
    }

    setIsImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const formattedOffers = json.map((row: any) => {
        const detailsObj: any = {};
        if (row.caracteristiques && typeof row.caracteristiques === 'string') {
          const pairs = row.caracteristiques.split('|');
          pairs.forEach((pair: string) => {
            const [key, val] = pair.split(':');
            if (key && val) {
              detailsObj[key.trim()] = val.trim();
            }
          });
        }

        let imageNames: string[] = [];
        if (row.images && typeof row.images === 'string') {
          imageNames = row.images.split(',').map((img: string) => img.trim()).filter((img: string) => img.length > 0);
        }

        return { ...row, caracteristiques: detailsObj, images: imageNames };
      });

      // Save for step 2 (folder selection)
      setPendingImportOffers(formattedOffers);
      setIsImporting(false);

    } catch (err) {
      toast.error("Erreur de traitement du fichier Excel : " + err);
      setIsImporting(false);
    } finally {
      e.target.value = '';
    }
  };

  const handleFolderImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!pendingImportOffers || !partner) {
      setIsImporting(false);
      return;
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("partner_id", partner.id);
      formDataUpload.append("offers_json", JSON.stringify(pendingImportOffers));

      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          formDataUpload.append("images[]", file);
        });
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/import_offers.php`, {
        method: "POST",
        body: formDataUpload, // multipart/form-data
      });
      const responseData = await res.json();

      if (responseData.success) {
        toast.success(responseData.message);
        fetchOffers(partner.id);
      } else {
        toast.error(responseData.message || "Erreur lors de l'importation.");
      }

      if (responseData.errors && responseData.errors.length > 0) {
        const errorList = responseData.errors.slice(0, 3).join("\n");
        toast.warning(`Certaines lignes ont échoué :\n${errorList}`);
      }
    } catch (err) {
      toast.error("Erreur d'envoi des données au serveur : " + err);
    } finally {
      setIsImporting(false);
      setPendingImportOffers(null);
      e.target.value = '';
    }
  };

  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "image" && newOffer.images.length >= 5) {
      toast.error("Maximum 5 images autorisées.");
      return;
    }

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}offers/upload_media.php`,
        {
          method: "POST",
          body: formDataUpload,
        },
      );
      const data = await res.json();
      if (data.success) {
        if (type === "image") {
          setNewOffer((prev) => ({
            ...prev,
            images: [...prev.images, data.path],
          }));
        } else {
          setNewOffer((prev) => ({ ...prev, video: data.path }));
        }
        toast.success(
          `${type === "image" ? "Image" : "Vidéo"} chargée avec succès.`,
        );
      } else {
        toast.error(data.message || "Erreur lors du chargement.");
      }
    } catch (err) {
      toast.error("Erreur serveur lors du chargement.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setNewOffer((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.title || !newOffer.price || !newOffer.location) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }

    setIsLoading(true);
    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}offers/update_offer.php`
        : `${process.env.NEXT_PUBLIC_API_URL}offers/add_offer.php`;

      const res = await fetch(url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newOffer,
            partner_id: partner.id,
            id: editingId // for update
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Offre mise à jour !" : "Offre publiée !");
        setShowOfferModal(false);
        setEditingId(null);
        setNewOffer({
          type: "herbergement",
          title: "",
          description: "",
          location: "",
          price: "",
          currency: "CFA",
          images: [],
          video: "",
          details: {},
        });
        fetchOffers(partner.id);
      } else {
        toast.error(data.message || "Erreur lors de la publication.");
      }
    } catch (err) {
      toast.error("Erreur serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOffer = (offer: any) => {
    setEditingId(offer.id);
    setNewOffer({
      type: offer.type,
      title: offer.title,
      description: offer.description,
      location: offer.location,
      price: offer.price,
      currency: offer.currency,
      images: offer.images || [],
      video: offer.video || "",
      details: offer.details || {},
    });
    setShowOfferModal(true);
  };

  const confirmDeleteOffer = (offerId: number) => {
    setOfferToDelete(offerId);
    setShowDeleteModal(true);
  };

  const handleDeleteOffer = async () => {
    if (!offerToDelete) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/delete_offer.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer_id: offerToDelete,
          partner_id: partner.id
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Publication supprimée.");
        setShowDeleteModal(false);
        setOfferToDelete(null);
        fetchOffers(partner.id);
      } else {
        toast.error(data.message || "Erreur lors de la suppression.");
      }
    } catch (err) {
      toast.error("Erreur serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const openOfferDetails = (offer: any) => {
    setSelectedOfferDetails(offer);
    setShowDetailsModal(true);
  };

  const OfferCarousel = ({ images, title }: { images: string[], title: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
        </div>
      );
    }

    const next = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prev = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
      <div className="relative w-full h-full overflow-hidden group/carousel">
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${images[currentIndex]}`}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 backdrop-blur-md text-white opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-black/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 backdrop-blur-md text-white opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-black/50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${i === currentIndex ? "bg-white w-3" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (!partner) return null;

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "publications", label: "Publications", icon: Package },
    ...(partner.selected_plan !== "Gratuit" ? [{ id: "messagerie", label: "Messagerie", icon: MessageSquare }] : []),
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <Building2 className="h-7 w-7 md:h-8 md:w-8 text-[#2563eb] shrink-0" />
                <span className="break-words line-clamp-1">
                  {partner.business_name}
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Espace professionnel · {partner.activity_type}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase ${Number(partner.validation) === 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}
              >
                {Number(partner.validation) === 0
                  ? "Validation en attente"
                  : "Compte Validé"}
              </div>

              <button
                onClick={handleLogout}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted transition-colors text-destructive ml-auto md:ml-0"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-border">
            <div className="flex items-center gap-1 min-w-max">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === item.id
                    ? "text-[#2563eb]"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {activeTab === item.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563eb] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "dashboard" && (
            <>
              {/* Stats Grid */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Réservations",
                    value: "0",
                    icon: Calendar,
                    color: "text-blue-600",
                    bg: "bg-blue-100",
                  },
                  {
                    label: "Offres actives",
                    value: offers.length.toString(),
                    icon: Package,
                    color: "text-emerald-600",
                    bg: "bg-emerald-100",
                  },
                  {
                    label: "Revenus (CFA)",
                    value: "0",
                    icon: LayoutDashboard,
                    color: "text-amber-600",
                    bg: "bg-amber-100",
                  },
                  {
                    label: "Clients",
                    value: "0",
                    icon: Users,
                    color: "text-purple-600",
                    bg: "bg-purple-100",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`rounded-xl ${stat.bg} p-2.5 ${stat.color}`}
                      >
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                        +0% <ArrowUpRight className="h-3 w-3 ml-0.5" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {/* Startup Checklist */}
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563eb]/5 rounded-full -mr-16 -mt-16 sm:block hidden" />
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                      <Check className="h-5 w-5 text-[#2563eb]" />
                      Checklist de démarrage
                    </h3>
                    <div className="space-y-4 relative z-10">
                      {[
                        { label: "Profil complété", completed: !!(partner.business_name && partner.business_email), icon: Building2 },
                        { label: "Identité vérifiée", completed: Number(partner.validation) !== 0, icon: Check },
                        { label: "Première offre publiée", completed: offers.length > 0, icon: Package },
                        { label: "Informations bancaires renseignées", completed: !!partner.selected_plan, icon: CreditCard },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/5 group hover:bg-muted/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${item.completed ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                              <item.icon className="h-4 w-4" />
                            </div>
                            <span className={`text-sm font-medium ${item.completed ? "text-foreground" : "text-muted-foreground"}`}>
                              {item.label}
                            </span>
                          </div>
                          {item.completed ? (
                            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-border" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Success Tips Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: "De belles photos",
                        desc: "Les offres avec plus de 3 photos HD reçoivent 40% plus de réservations.",
                        color: "text-amber-600",
                        bg: "bg-amber-50"
                      },
                      {
                        title: "Prix compétitifs",
                        desc: "Analysez le marché pour proposer des tarifs attractifs en saison basse.",
                        color: "text-blue-600",
                        bg: "bg-blue-50"
                      }
                    ].map((tip, i) => (
                      <div key={i} className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-[#2563eb]/30 transition-all cursor-default group">
                        <div className={`h-10 w-10 rounded-xl ${tip.bg} ${tip.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-sm mb-2">{tip.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tip.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {offers.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-[#2563eb]/5 flex flex-col items-center">
                      <p className="text-sm font-medium text-[#2563eb] mb-4">Vous n'avez pas encore d'offre publiée</p>
                      <button
                        disabled={Number(partner.validation) !== 1}
                        onClick={() => {
                          setEditingId(null);
                          setNewOffer({
                            type: "herbergement",
                            title: "",
                            description: "",
                            location: "",
                            price: "",
                            currency: "CFA",
                            images: [],
                            video: "",
                            details: {},
                          });
                          setShowOfferModal(true);
                        }}
                        className={`rounded-xl px-6 py-2.5 text-xs font-bold transition-all shadow-lg ${Number(partner.validation) !== 1
                          ? "bg-muted text-muted-foreground cursor-not-allowed grayscale"
                          : "bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-[#2563eb]/20"
                          }`}
                      >
                        Ajouter ma première offre
                      </button>
                      {Number(partner.validation) !== 1 && (
                        <p className="mt-4 text-[10px] text-amber-600 font-medium">
                          Votre compte doit être validé par un administrateur pour publier des offres.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="font-bold flex items-center gap-2 mb-6">
                      <FileText className="h-4 w-4 text-[#2563eb]" /> Résumé du
                      compte
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                          Abonnement
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold">
                            {partner.selected_plan || "Gratuit"}
                          </p>
                          <button className="text-[10px] text-[#2563eb] font-bold hover:underline">
                            Modifier
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                          Contact Pro
                        </p>
                        <p className="text-sm font-medium">
                          {partner.business_email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {partner.business_phone}
                        </p>
                      </div>
                      <button
                        onClick={fetchContract}
                        className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#2563eb]/10 py-3 text-xs font-bold text-[#2563eb] hover:bg-[#2563eb]/20 transition-all"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Contrat de prestation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "publications" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Mes Publications
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Gérez vos offres et services publiés sur la plateforme.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {partner.selected_plan !== "Gratuit" && (
                    <>
                      <button
                        onClick={handleDownloadExcelFormat}
                        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Format fichier</span>
                      </button>

                      <input
                        type="file"
                        id="excel-upload"
                        className="hidden"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleExcelImport}
                        disabled={isImporting || Number(partner.validation) === 0}
                      />
                      <input
                        type="file"
                        id="folder-upload"
                        className="hidden"
                        {...({ webkitdirectory: "", directory: "" } as any)}
                        multiple
                        onChange={handleFolderImport}
                      />
                      <button
                        onClick={() => document.getElementById("excel-upload")?.click()}
                        disabled={isImporting || Number(partner.validation) === 0}
                        className={`flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition-colors ${Number(partner.validation) === 0 || isImporting
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#2563eb]/10 hover:text-[#2563eb] hover:border-[#2563eb]/30"
                          }`}
                      >
                        {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <span className="hidden sm:inline">
                          {isImporting ? "Importation..." : "Importer"}
                        </span>
                      </button>
                    </>
                  )}

                  <button
                    disabled={Number(partner.validation) === 0}
                    onClick={() => {
                      setEditingId(null);
                      setNewOffer({
                        type: "herbergement",
                        title: "",
                        description: "",
                        location: "",
                        price: "",
                        currency: "CFA",
                        images: [],
                        video: "",
                        details: {},
                      });
                      setShowOfferModal(true);
                    }}
                    className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all shadow-lg flex items-center gap-2 ${Number(partner.validation) === 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-[#2563eb]/20"
                      }`}
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle Publication
                  </button>
                </div>
              </div>

              {offers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                    >
                      <div
                        className="relative aspect-video cursor-pointer"
                        onClick={() => openOfferDetails(offer)}
                      >
                        <OfferCarousel images={offer.images} title={offer.title} />
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md text-[10px] text-white font-bold uppercase">
                            {offer.type}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col min-h-[140px]">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-foreground line-clamp-1">
                            {offer.title}
                          </h4>
                          <span className="font-bold text-[#2563eb] shrink-0">
                            {offer.price} {offer.currency}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4 line-clamp-1">
                          <MapPin className="h-3 w-3" /> {offer.location}
                        </div>
                        <div className="mt-auto flex items-center gap-2">
                          <button
                            onClick={() => openOfferDetails(offer)}
                            className="flex-1 rounded-lg border border-border py-2 text-[10px] font-bold hover:bg-muted transition-colors"
                          >
                            Détails
                          </button>
                          <button
                            onClick={() => handleEditOffer(offer)}
                            className="rounded-lg border border-border p-2 text-foreground hover:bg-muted transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => confirmDeleteOffer(offer.id)}
                            className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm">
                  <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Prêt à publier votre première offre ?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
                    Ajoutez vos hôtels, circuits et expériences directement ici
                    pour attirer des voyageurs du monde entier.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "messagerie" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Messagerie</h2>
                  <p className="text-muted-foreground mt-1">Vos échanges avec les clients.</p>
                </div>
              </div>

              {selectedConversation ? (
                /* ── Vue Discussion ── */
                <div className="flex flex-col h-[72vh] rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card sticky top-0 z-10">
                    <button
                      onClick={() => {
                        setSelectedConversation(null);
                        fetchConversations(partner.id);
                      }}
                      className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb] font-bold text-sm shrink-0 uppercase">
                      {selectedConversation.user_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{selectedConversation.user_name}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedConversation.user_email}</p>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-muted/10">
                    {loadingMessages ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#2563eb]" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-4" />
                        <p className="text-sm text-muted-foreground">Aucun message. Envoyez une réponse pour démarrer.</p>
                      </div>
                    ) : (
                      messages.map((msg: any, idx: number) => (
                        <div key={idx} className={`flex ${msg.sender_type === "partner" ? "justify-end" : "justify-start"}`}>
                          {msg.sender_type !== "partner" && (
                            <div className="h-7 w-7 rounded-full bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb] text-xs font-bold mr-2 mt-1 shrink-0 uppercase">
                              {selectedConversation.user_name?.charAt(0)}
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender_type === "partner"
                              ? "bg-[#2563eb] text-white rounded-br-sm"
                              : "bg-card text-foreground border border-border rounded-bl-sm"
                              }`}
                          >
                            {msg.message}
                            <p className={`text-[10px] mt-1 ${msg.sender_type === "partner" ? "text-white/60" : "text-muted-foreground"} text-right`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input Bar */}
                  <div className="px-4 py-3 border-t border-border bg-card">
                    <div className="flex items-center gap-3 rounded-xl bg-muted/30 border border-border px-4 py-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Répondre au client..."
                        className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sendingMessage || !messageInput.trim()}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors shrink-0 disabled:opacity-50"
                      >
                        {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Liste des Conversations ── */
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  {loadingConversations ? (
                    <div className="flex h-64 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                      <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                        <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Aucune discussion</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
                        Quand un client vous envoie un message, la conversation apparaîtra ici.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {conversations.map((conv) => (
                        <button
                          key={conv.user_id}
                          onClick={() => openConversation(conv)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left group"
                        >
                          <div className="h-12 w-12 rounded-full bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb] font-bold text-lg shrink-0 uppercase">
                            {conv.user_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="font-bold text-foreground truncate group-hover:text-[#2563eb] transition-colors">
                                {conv.user_name}
                              </h4>
                              {conv.last_message_at && (
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                  {new Date(conv.last_message_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground truncate pr-4">
                                {conv.last_message}
                              </p>
                              {Number(conv.unread_count) > 0 && (
                                <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-bold text-white shadow-sm shadow-[#2563eb]/20">
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-500">
              {/* Apparence card */}
              {mounted && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2563eb]/10 text-[#2563eb]">
                        {resolvedTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Apparence</p>
                        <p className="text-xs text-muted-foreground">
                          {resolvedTheme === 'dark' ? 'Mode sombre activé' : 'Mode clair activé'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${resolvedTheme === 'dark' ? 'bg-[#2563eb]' : 'bg-muted'
                        }`}
                      role="switch"
                      aria-checked={resolvedTheme === 'dark'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
                {/* Settings Tab List - Mobile Friendly */}
                <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-border pb-4 lg:pb-0 lg:pr-6">
                  <nav className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">
                    <button
                      onClick={() => setSettingsSubTab("profile")}
                      className={`whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-lg transition-colors text-sm font-bold flex items-center gap-2 ${settingsSubTab === "profile"
                        ? "bg-[#2563eb]/10 text-[#2563eb]"
                        : "text-muted-foreground hover:bg-muted"
                        }`}
                    >
                      <Building2 className="h-4 w-4" /> Profil Entreprise
                    </button>
                    <button
                      onClick={() => setSettingsSubTab("banking")}
                      className={`whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-lg transition-colors text-sm font-bold flex items-center gap-2 ${settingsSubTab === "banking"
                        ? "bg-[#2563eb]/10 text-[#2563eb]"
                        : "text-muted-foreground hover:bg-muted"
                        }`}
                    >
                      <CreditCard className="h-4 w-4" /> Infos Bancaires
                    </button>
                    <button
                      onClick={fetchContract}
                      className="whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted text-sm font-medium flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" /> Contrat
                    </button>
                  </nav>
                </div>

                {/* Settings Content Area */}
                <div className="lg:col-span-3">
                  {settingsSubTab === "profile" ? (
                    <form
                      onSubmit={handleUpdateProfile}
                      className="bg-card rounded-2xl border border-border p-8 shadow-sm animate-in fade-in duration-300"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-xl font-bold text-foreground">
                            Profil Entreprise
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            Gérez vos informations publiques et de contact.
                          </p>
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8] shadow-lg shadow-[#2563eb]/20 transition-all disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Enregistrer
                        </button>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Nom de l'entreprise
                            </label>
                            <input
                              type="text"
                              value={formData.business_name || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  business_name: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/20 transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Type d'activité
                            </label>
                            <select
                              value={formData.activity_type || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  activity_type: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                            >
                              <option value="Hôtel">Hôtel / Hébergement</option>
                              <option value="Agence">Agence de voyage</option>
                              <option value="Circuit">Circuit touristique</option>
                              <option value="Location">
                                Location de voiture
                              </option>
                              <option value="Expérience">
                                Expériences / Activités
                              </option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Description
                            </label>
                            <textarea
                              rows={4}
                              value={formData.description || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Email Professionnel
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input
                                type="email"
                                value={formData.business_email || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    business_email: e.target.value,
                                  })
                                }
                                className="w-full pl-10 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Téléphone Pro
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input
                                type="tel"
                                value={formData.business_phone || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    business_phone: e.target.value,
                                  })
                                }
                                className="w-full pl-10 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Site Web
                            </label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input
                                type="text"
                                value={formData.website || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    website: e.target.value,
                                  })
                                }
                                placeholder="https://..."
                                className="w-full pl-10 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Adresse
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <textarea
                                rows={2}
                                value={formData.address || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    address: e.target.value,
                                  })
                                }
                                className="w-full pl-10 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <form
                      onSubmit={handleUpdateProfile}
                      className="bg-card rounded-2xl border border-border p-8 shadow-sm animate-in fade-in duration-300"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-xl font-bold text-foreground">
                            Informations Bancaires
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            Gérez vos coordonnées pour les reversements.
                          </p>
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8] shadow-lg shadow-[#2563eb]/20 transition-all disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Enregistrer
                        </button>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Titulaire du compte
                            </label>
                            <input
                              type="text"
                              value={formData.account_holder || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  account_holder: e.target.value,
                                })
                              }
                              placeholder="Nom complet ou société"
                              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Nom de la banque
                            </label>
                            <input
                              type="text"
                              value={formData.bank_name || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  bank_name: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              IBAN / RIB
                            </label>
                            <input
                              type="text"
                              value={formData.iban || ""}
                              onChange={(e) =>
                                setFormData({ ...formData, iban: e.target.value })
                              }
                              placeholder="BJ00 0000 0000 0000 0000"
                              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm font-mono focus:border-[#2563eb] focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Numéro Mobile Money
                            </label>
                            <input
                              type="text"
                              value={formData.mobile_money_number || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  mobile_money_number: e.target.value,
                                })
                              }
                              placeholder="+229 00 00 00 00"
                              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Devise de paiement
                            </label>
                            <select
                              value={formData.currency || "XOF"}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  currency: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                            >
                              <option value="XOF">FCFA (XOF)</option>
                              <option value="EUR">Euro (EUR)</option>
                              <option value="USD">Dollar (USD)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                              Adresse de facturation
                            </label>
                            <textarea
                              rows={2}
                              value={formData.billing_address || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  billing_address: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />

        {/* Contract Modal */}
        {
          showContractModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full sm:max-w-4xl h-full sm:h-[85vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-white sticky top-0">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Contrat de prestation de services
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Document officiel généré pour {partner.business_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadPdf}
                      className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d4ed8] shadow-lg shadow-[#2563eb]/20 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger PDF
                    </button>
                    <button
                      onClick={() => setShowContractModal(false)}
                      className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 bg-gray-50">
                  <div
                    className="bg-white p-6 sm:p-12 shadow-sm mx-auto"
                    dangerouslySetInnerHTML={{ __html: contractHtml }}
                  />
                </div>
              </div>
            </div>
          )
        }

        {/* Modern Add Offer Modal */}
        {
          showOfferModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full sm:max-w-3xl h-full sm:h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-white sticky top-0 z-10">
                  <div>
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Plus className="h-5 w-5 text-[#2563eb]" />
                      Nouvelle Publication
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Remplissez les détails de votre offre pour la mettre en ligne.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowOfferModal(false)}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
                  <form onSubmit={handleSubmitOffer} className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-foreground border-l-4 border-[#2563eb] pl-3">
                        Informations Générales
                      </h4>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase">
                            Type d'offre
                          </label>
                          <select
                            value={newOffer.type}
                            onChange={(e) =>
                              setNewOffer({ ...newOffer, type: e.target.value })
                            }
                            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-all"
                          >
                            <option value="herbergement">Hébergement</option>
                            <option value="transport">Transport</option>
                            <option value="activite">Activité</option>
                            <option value="circuit">Circuit</option>
                            <option value="autre">Autre</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase">
                            Titre de la publication *
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Villa de luxe au bord de mer"
                            required
                            value={newOffer.title}
                            onChange={(e) =>
                              setNewOffer({ ...newOffer, title: e.target.value })
                            }
                            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          Description
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Décrivez votre offre en détail..."
                          value={newOffer.description}
                          onChange={(e) =>
                            setNewOffer({ ...newOffer, description: e.target.value })
                          }
                          className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Pricing & Location */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          Lieu *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Ville, Quartier, Pays"
                            required
                            value={newOffer.location}
                            onChange={(e) =>
                              setNewOffer({ ...newOffer, location: e.target.value })
                            }
                            className="w-full pl-10 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          Prix *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="0.00"
                            required
                            value={newOffer.price}
                            onChange={(e) =>
                              setNewOffer({ ...newOffer, price: e.target.value })
                            }
                            className="flex-1 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-all"
                          />
                          <select
                            value={newOffer.currency}
                            onChange={(e) =>
                              setNewOffer({ ...newOffer, currency: e.target.value })
                            }
                            className="w-24 rounded-xl border border-border bg-muted/30 px-2 py-3 text-sm font-bold focus:border-[#2563eb] outline-none transition-all"
                          >
                            <option value="CFA">CFA</option>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Media Section */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-foreground border-l-4 border-[#2563eb] pl-3 flex items-center justify-between">
                        Médias (Images & Vidéo)
                        <span className="text-[10px] text-muted-foreground font-normal">
                          Max 5 images · 1 vidéo
                        </span>
                      </h4>

                      {/* Image Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {newOffer.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative aspect-square rounded-xl border border-border bg-muted overflow-hidden"
                          >
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}${img}`}
                              className="w-full h-full object-cover"
                              alt={`Preview ${idx + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {newOffer.images.length < 5 && (
                          <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-all hover:border-[#2563eb]/50">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                              Ajouter
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleMediaUpload(e, "image")}
                              disabled={isUploading}
                            />
                          </label>
                        )}
                      </div>

                      {/* Video Upload */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase block">
                          Vidéo promotionnelle
                        </label>
                        <div className="relative">
                          {newOffer.video ? (
                            <div className="flex items-center justify-between p-4 rounded-xl border border-[#2563eb]/30 bg-[#2563eb]/5">
                              <div className="flex items-center gap-3">
                                <Video className="h-5 w-5 text-[#2563eb]" />
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                  Vidéo chargée
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setNewOffer({ ...newOffer, video: "" })
                                }
                                className="text-xs font-bold text-red-500 hover:underline"
                              >
                                Supprimer
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-3 w-full p-6 rounded-xl border-2 border-dashed border-border hover:bg-muted/50 transition-all cursor-pointer">
                              <Video className="h-5 w-5 text-muted-foreground" />
                              <div className="text-left">
                                <p className="text-sm font-bold">Charger une vidéo</p>
                                <p className="text-xs text-muted-foreground">
                                  MP4, WebM ou MOV (Max 50MB)
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => handleMediaUpload(e, "video")}
                                disabled={isUploading}
                              />
                            </label>
                          )}
                          {isUploading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
                              <Loader2 className="h-6 w-6 animate-spin text-[#2563eb]" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-border mt-8 pt-6">
                      <button
                        type="button"
                        onClick={() => setShowOfferModal(false)}
                        className="flex-1 rounded-xl border border-border py-4 text-sm font-bold hover:bg-muted transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || isUploading}
                        className="flex-[2] rounded-xl bg-[#2563eb] py-4 text-sm font-bold text-white hover:bg-[#1d4ed8] shadow-lg shadow-[#2563eb]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Publier l'offre
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )
        }
        {/* Delete Confirmation Modal */}
        {
          showDeleteModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Supprimer cette offre ?</h3>
                <p className="text-sm text-muted-foreground mb-8">
                  Cette action est irréversible. Toutes les données liées à cette publication seront définitivement supprimées.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 rounded-xl border border-border py-3 text-sm font-bold hover:bg-muted transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteOffer}
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Details Modal */}

        {/* Folder Selection Modal */}
        {
          pendingImportOffers && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 text-[#2563eb] flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Dossier des images</h3>
                <p className="text-sm text-muted-foreground mb-8">
                  Fichier Excel validé avec succès ({pendingImportOffers.length} offre(s) trouvées).
                  <br /><br />
                  Veuillez maintenant sélectionner le dossier sur votre ordinateur contenant toutes les images évoquées dans le fichier.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPendingImportOffers(null);
                      const el = document.getElementById("excel-upload") as HTMLInputElement;
                      if (el) el.value = '';
                    }}
                    className="flex-1 rounded-xl border border-border py-3 text-sm font-bold hover:bg-muted transition-all"
                  >
                    Annuler l'import
                  </button>
                  <button
                    onClick={() => document.getElementById("folder-upload")?.click()}
                    className="flex-1 rounded-xl bg-[#2563eb] py-3 text-sm font-bold text-white hover:bg-[#1d4ed8] shadow-lg transition-all"
                  >
                    Sélectionner
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {showDetailsModal && selectedOfferDetails && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-4xl h-full sm:h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
              <div className="relative h-64 sm:h-96">
                <OfferCarousel images={selectedOfferDetails.images} title={selectedOfferDetails.title} />
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all z-20"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold uppercase shadow-lg">
                    {selectedOfferDetails.type}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-border pb-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {selectedOfferDetails.title}
                    </h2>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-[#2563eb]" /> {selectedOfferDetails.location}
                    </p>
                  </div>
                  <div className="bg-[#2563eb]/5 border border-[#2563eb]/20 rounded-2xl p-4 text-center min-w-[150px]">
                    <p className="text-[10px] text-[#2563eb] font-bold uppercase tracking-widest mb-1">Prix de l'offre</p>
                    <p className="text-2xl font-black text-[#2563eb]">
                      {selectedOfferDetails.price} {selectedOfferDetails.currency}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#2563eb]" /> Description du produit
                      </h4>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedOfferDetails.description || "Aucune description fournie."}
                      </p>
                    </div>

                    {selectedOfferDetails.details && typeof selectedOfferDetails.details === 'object' && Object.keys(selectedOfferDetails.details).length > 0 && (
                      <div className="pt-6">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                          Caractéristiques
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedOfferDetails.details).map(([key, val], idx) => (
                            <div key={idx} className="bg-muted/50 border border-border px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground flex items-center gap-2">
                              {key} <span className="text-muted-foreground font-normal">•</span> {String(val)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedOfferDetails.video && (
                      <div className="pt-6">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Video className="h-4 w-4 text-[#2563eb]" /> Vidéo Présentation
                        </h4>
                        <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-inner">
                          <video
                            controls
                            className="w-full h-full"
                            src={`${process.env.NEXT_PUBLIC_API_URL}${selectedOfferDetails.video}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-muted/20 p-6">
                      <h4 className="text-sm font-bold text-foreground mb-4">Statut</h4>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium">Active et visible</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border p-6 space-y-4">
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleEditOffer(selectedOfferDetails);
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-bold hover:bg-muted transition-all"
                      >
                        <Settings className="h-4 w-4" /> Modifier l'offre
                      </button>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          confirmDeleteOffer(selectedOfferDetails.id);
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-destructive hover:bg-destructive/5 transition-all"
                      >
                        <Trash2 className="h-4 w-4" /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
