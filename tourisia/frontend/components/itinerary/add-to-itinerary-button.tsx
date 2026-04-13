"use client";

import React, { useState, useEffect } from "react";
import { Plus, Notebook as Journal, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Itinerary {
    id: string;
    title: string;
}

interface AddToItineraryButtonProps {
    offerId: string;
}

export const AddToItineraryButton = ({ offerId }: AddToItineraryButtonProps) => {
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingToId, setAddingToId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [showNewInput, setShowNewInput] = useState(false);

    const handleOpenDialog = () => {
        if (!localStorage.getItem("user")) {
            toast.error("Veuillez vous connecter pour ajouter des offres à un carnet.");
            return;
        }
        setIsOpen(true);
    };

    const fetchItineraries = async () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}itineraries/itinerary_manager.php?user_id=${user.id}`);
            const data = await resp.json();
            setItineraries(data);
        } catch (error) {
            console.error("Error fetching itineraries:", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchItineraries();
        }
    }, [isOpen]);

    const handleAddToItinerary = async (itineraryId: string) => {
        setAddingToId(itineraryId);
        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}itineraries/itinerary_items.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itinerary_id: itineraryId, offer_id: offerId }),
            });
            const data = await resp.json();
            if (data.success) {
                toast.success("Ajouté au carnet !");
                setIsOpen(false);
            } else {
                toast.error("Erreur lors de l'ajout.");
            }
        } catch (error) {
            toast.error("Erreur de connexion.");
        } finally {
            setAddingToId(null);
        }
    };

    const handleCreateAndAdd = async () => {
        if (!newTitle.trim()) return;
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}itineraries/itinerary_manager.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, title: newTitle }),
            });
            const data = await resp.json();
            if (data.success) {
                await handleAddToItinerary(data.id);
            }
        } catch (error) {
            toast.error("Erreur création carnet.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    onClick={handleOpenDialog}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                >
                    <Journal className="h-3.5 w-3.5" />
                    Carnet
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Journal className="h-5 w-5 text-blue-600" />
                        Ajouter à un carnet de voyage
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                        {itineraries.map((it) => (
                            <button
                                key={it.id}
                                onClick={() => handleAddToItinerary(it.id)}
                                disabled={addingToId !== null}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-blue-200 hover:bg-blue-50/50 transition-all text-sm group"
                            >
                                <span className="font-medium">{it.title}</span>
                                {addingToId === it.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                ) : (
                                    <Plus className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                )}
                            </button>
                        ))}
                        {itineraries.length === 0 && !loading && (
                            <p className="text-center text-sm text-muted-foreground py-4">
                                Vous n'avez pas encore de carnet.
                            </p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-border">
                        {!showNewInput ? (
                            <button
                                onClick={() => setShowNewInput(true)}
                                className="w-full py-2.5 flex items-center justify-center gap-2 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium border border-dashed border-blue-200"
                            >
                                <Plus className="h-4 w-4" />
                                Créer un nouveau carnet
                            </button>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    placeholder="Nom du carnet (ex: Vacances Été)"
                                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleCreateAndAdd()}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowNewInput(false)}
                                        className="flex-1 py-2 rounded-xl text-sm border border-border hover:bg-muted transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleCreateAndAdd}
                                        disabled={!newTitle.trim() || loading}
                                        className="flex-[2] py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        Créer et ajouter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
