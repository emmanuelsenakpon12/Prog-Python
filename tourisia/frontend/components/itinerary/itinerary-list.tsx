"use client";

import React, { useState, useEffect } from "react";
import {
    Notebook as Journal,
    Trash2,
    ChevronRight,
    MapPin,
    Calendar,
    Loader2,
    Package,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface Itinerary {
    id: string;
    title: string;
    description: string;
    items_count: number;
    created_at: string;
}

interface ItineraryItem {
    id: string;
    title: string;
    type: string;
    location: string;
    price: string;
    currency: string;
    image_url: string;
}

export const ItineraryList = () => {
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
    const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
    const [items, setItems] = useState<ItineraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemsLoading, setItemsLoading] = useState(false);

    const fetchItineraries = async () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}itineraries/itinerary_manager.php?user_id=${user.id}`);
            const data = await resp.json();
            setItineraries(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Erreur chargement itinéraires");
            setItineraries([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async (itineraryId: string) => {
        setItemsLoading(true);
        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}itineraries/itinerary_items.php?itinerary_id=${itineraryId}`);
            const data = await resp.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Erreur chargement détails");
            setItems([]);
        } finally {
            setItemsLoading(false);
        }
    };

    const getFileUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith('http')) return path;
        return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
    };

    useEffect(() => {
        fetchItineraries();
    }, []);

    const handleDeleteItinerary = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Supprimer ce carnet ?")) return;

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}itineraries/itinerary_manager.php`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await resp.json();
            if (data.success) {
                setItineraries(prev => prev.filter(it => it.id !== id));
                if (selectedItinerary?.id === id) setSelectedItinerary(null);
                toast.success("Carnet supprimé");
            }
        } catch (error) {
            toast.error("Erreur suppression");
        }
    };

    const handleRemoveItem = async (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation();
        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}itineraries/itinerary_items.php`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: itemId }),
            });
            const data = await resp.json();
            if (data.success) {
                setItems(prev => prev.filter(item => item.id !== itemId));
                toast.success("Offre retirée");
            }
        } catch (error) {
            toast.error("Erreur retrait");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-muted-foreground italic">Chargement de vos carnets...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!selectedItinerary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {itineraries.map((it) => (
                        <div
                            key={it.id}
                            onClick={() => {
                                setSelectedItinerary(it);
                                fetchItems(it.id);
                            }}
                            className="group bg-white rounded-2xl border border-border p-5 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleDeleteItinerary(e, it.id)}
                                    className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex flex-col h-full gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                    <Journal className="h-6 w-6" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{it.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {it.description || "Aucune description"}
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5 font-medium">
                                        <Package className="h-3.5 w-3.5" />
                                        {it.items_count} offre{it.items_count > 1 ? 's' : ''}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        Voir détails
                                        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {itineraries.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center text-center gap-4 bg-muted/30 border border-dashed border-border rounded-3xl">
                            <Journal className="h-12 w-12 text-muted-foreground/50" />
                            <div>
                                <h3 className="font-bold">Aucun carnet de voyage</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Commencez par ajouter des offres à un carnet pour planifier votre voyage idéal.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-left-4">
                    {/* Header & Back Button */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedItinerary(null)}
                                className="p-2.5 hover:bg-muted rounded-xl transition-colors border border-border"
                            >
                                <ArrowRight className="h-4 w-4 rotate-180" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold">{selectedItinerary.title}</h2>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                                        <Package className="h-3 w-3" />
                                        {items.length} offres
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        Créé le {new Date(selectedItinerary.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                        {itemsLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl border border-border p-4 flex gap-6 group hover:border-blue-200 hover:shadow-lg transition-all"
                                >
                                    <div className="relative h-32 w-48 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                                        {item.image_url ? (
                                            <img
                                                src={getFileUrl(item.image_url)}
                                                alt={item.title}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Package className="h-8 w-8 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] uppercase tracking-wider font-bold">
                                            {idx + 1}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{item.type}</span>
                                                <button
                                                    onClick={(e) => handleRemoveItem(e, item.id)}
                                                    className="p-1.5 hover:bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <h3 className="font-bold text-lg mt-1">{item.title}</h3>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {item.location}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="font-bold text-blue-600">
                                                {parseInt(item.price).toLocaleString()} {item.currency}
                                            </div>
                                            <button className="text-[11px] font-bold text-muted-foreground hover:text-blue-600 flex items-center gap-1 group/btn transition-colors">
                                                Voir l'annonce
                                                <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {!itemsLoading && items.length === 0 && (
                            <div className="py-20 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
                                <p className="text-muted-foreground text-sm">Ce carnet est vide pour le moment.</p>
                            </div>
                        )}
                    </div>

                    {/* Summary & Reservation CTA */}
                    {!itemsLoading && items.length > 0 && (() => {
                        const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
                        const currency = items[0]?.currency || 'DZD';
                        return (
                            <div className="mt-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-xl shadow-blue-500/20">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-blue-100 uppercase tracking-widest mb-1">
                                            Solde total du carnet
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-extrabold">
                                                {total.toLocaleString('fr-DZ')}
                                            </span>
                                            <span className="text-sm font-bold text-blue-200 uppercase">{currency}</span>
                                        </div>
                                        <p className="text-xs text-blue-200 mt-1">{items.length} offre{items.length > 1 ? 's' : ''} incluse{items.length > 1 ? 's' : ''}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!localStorage.getItem("user")) {
                                                toast.error("Veuillez vous connecter pour faire une réservation.");
                                                return;
                                            }
                                            toast.info("La réservation groupée sera bientôt disponible. Contactez les partenaires individuellement pour réserver.");
                                        }}
                                        className="flex items-center gap-2 bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 active:scale-95 transition-all shadow-lg text-sm whitespace-nowrap"
                                    >
                                        <Calendar className="h-4 w-4" />
                                        Faire la réservation
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};
