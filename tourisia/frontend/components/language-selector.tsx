"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";

const languages = [
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "zh-CN", name: "中文", flag: "🇨🇳" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
];

export function LanguageSelector() {
    const [currentLang, setCurrentLang] = useState("fr");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Read googtrans cookie
        const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
        if (match) {
            const val = match[2];
            const parts = val.split('/');
            if (parts.length === 3) {
                setCurrentLang(parts[2]);
            }
        }
    }, []);

    const handleChange = (langCode: string) => {
        if (langCode === currentLang) {
            setIsOpen(false);
            return;
        }

        if (langCode === "fr") {
            // Remove cookies to revert to default
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}; path=/;`;
        } else {
            // Set google translate cookie (/fr/langCode)
            document.cookie = `googtrans=/fr/${langCode}; path=/;`;
            document.cookie = `googtrans=/fr/${langCode}; domain=.${window.location.hostname}; path=/;`;
        }

        // Reload to apply translation
        window.location.reload();
    };

    const current = languages.find(l => l.code === currentLang) || languages[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium hover:bg-muted transition-colors min-w-[110px]"
                aria-label="Sélectionner la langue"
            >
                <span className="flex items-center gap-2">
                    <span className="text-base">{current.flag}</span>
                    <span className="hidden xl:inline">{current.name}</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-40 rounded-2xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-[9999] py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleChange(lang.code)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors ${currentLang === lang.code ? "bg-muted/50 font-bold text-foreground" : "text-muted-foreground font-medium"
                                    }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <span className="text-base drop-shadow-sm">{lang.flag}</span>
                                    {lang.name}
                                </span>
                                {currentLang === lang.code && <Check className="h-4 w-4 text-[#2563eb]" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
