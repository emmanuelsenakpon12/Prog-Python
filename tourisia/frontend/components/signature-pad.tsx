"use client";

import React, { useRef, useState, useEffect } from "react";
import { Trash2, Upload, Check, Pencil } from "lucide-react";

interface SignaturePadProps {
    onSave: (dataUrl: string) => void;
    defaultValue?: string;
}

export function SignaturePad({ onSave, defaultValue }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [mode, setMode] = useState<"draw" | "import">("draw");

    useEffect(() => {
        if (defaultValue && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    setHasSignature(true);
                };
                img.src = defaultValue.startsWith('http') ? defaultValue : `${process.env.NEXT_PUBLIC_API_URL}${defaultValue}`;
            }
        }
    }, [defaultValue]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        if (canvasRef.current) {
            onSave(canvasRef.current.toDataURL("image/png"));
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ("touches" in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        setHasSignature(true);
    };

    const clear = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            setHasSignature(false);
            onSave("");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                if (canvasRef.current) {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext("2d");
                    const img = new Image();
                    img.onload = () => {
                        ctx?.clearRect(0, 0, canvas.width, canvas.height);
                        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                        setHasSignature(true);
                        onSave(dataUrl);
                    };
                    img.src = dataUrl;
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setMode("draw")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === "draw" ? "bg-[#2563eb] text-white" : "bg-muted text-muted-foreground"}`}
                >
                    <Pencil className="h-3 w-3" /> Dessiner
                </button>
                <button
                    type="button"
                    onClick={() => setMode("import")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === "import" ? "bg-[#2563eb] text-white" : "bg-muted text-muted-foreground"}`}
                >
                    <Upload className="h-3 w-3" /> Importer
                </button>
            </div>

            <div className="relative group">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className={`w-full h-[150px] border-2 border-dashed border-border rounded-xl bg-white cursor-crosshair touch-none ${mode === "import" ? "pointer-events-none opacity-50" : ""}`}
                />

                {mode === "import" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <label className="flex flex-col items-center gap-2 cursor-pointer bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-border hover:bg-white transition-all shadow-sm">
                            <Upload className="h-6 w-6 text-[#2563eb]" />
                            <span className="text-xs font-bold">Choisir une image</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                )}

                {hasSignature && mode === "draw" && (
                    <button
                        type="button"
                        onClick={clear}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
            <p className="text-[10px] text-muted-foreground italic">
                {mode === "draw" ? "Utilisez votre souris ou votre doigt pour signer dans le cadre." : "Importez une image de votre signature (PNG recommandé)."}
            </p>
        </div>
    );
}
