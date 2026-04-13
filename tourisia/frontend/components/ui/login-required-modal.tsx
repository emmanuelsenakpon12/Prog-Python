"use client";

import { LogIn, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginRequiredModalProps {
    onClose: () => void;
    message?: string;
}

export const LoginRequiredModal = ({ onClose, message }: LoginRequiredModalProps) => {
    const router = useRouter();

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-card rounded-2xl shadow-2xl border border-border w-full max-w-sm p-6 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <div className="flex justify-end mb-2">
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Icon */}
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                        <LogIn className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Connexion requise</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {message || "Vous devez être connecté pour effectuer cette action."}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 w-full pt-2">
                        <button
                            onClick={() => router.push("/login")}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <LogIn className="h-4 w-4" />
                            Se connecter
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
