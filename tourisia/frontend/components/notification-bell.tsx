"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, MessageSquare, Heart, Notebook, Info, Loader2, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
    id: string;
    type: string;
    title: string;
    content: string;
    link: string | null;
    is_read: number;
    created_at: string;
}

const typeIcons: Record<string, any> = {
    message: MessageSquare,
    favorite: Heart,
    itinerary: Notebook,
    system: Info,
};

const typeColors: Record<string, string> = {
    message: "bg-blue-100 text-blue-600",
    favorite: "bg-red-100 text-red-500",
    itinerary: "bg-emerald-100 text-emerald-600",
    system: "bg-gray-100 text-gray-600",
};

function timeAgo(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const getUserId = () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        return JSON.parse(userStr).id;
    };

    const fetchUnreadCount = async () => {
        const userId = getUserId();
        if (!userId) return;
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}notifications/notifications.php?user_id=${userId}&unread_count=1`
            );
            const data = await res.json();
            setUnreadCount(data.count || 0);
        } catch {
            // silent
        }
    };

    const fetchNotifications = async () => {
        const userId = getUserId();
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}notifications/notifications.php?user_id=${userId}`
            );
            const data = await res.json();
            setNotifications(Array.isArray(data) ? data : []);
        } catch {
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}notifications/notifications.php`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            // silent
        }
    };

    const markAllAsRead = async () => {
        const userId = getUserId();
        if (!userId) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}notifications/notifications.php`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, mark_all: true }),
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch {
            // silent
        }
    };

    const handleNotificationClick = (notif: Notification) => {
        if (!notif.is_read) markAsRead(notif.id);
        setIsOpen(false);
        if (notif.link) router.push(notif.link);
    };

    const deleteNotification = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}notifications/notifications.php`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const removed = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (removed && !removed.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            // silent
        }
    };

    const deleteAllNotifications = async () => {
        const userId = getUserId();
        if (!userId) return;
        // Delete all one by one via state, but we'll add a backend bulk delete
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}notifications/notifications.php`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, delete_all: true }),
            });
            setNotifications([]);
            setUnreadCount(0);
        } catch {
            // silent
        }
    };

    // Polling unread count every 15s
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 15000);
        return () => clearInterval(interval);
    }, []);

    // Load full list when dropdown opens
    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Don't render if not logged in
    if (!getUserId()) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-200">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[70vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Bell className="h-4 w-4 text-[#2563eb]" />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[11px] font-medium text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 transition-colors"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Tout lu
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={deleteAllNotifications}
                                    className="text-[11px] font-medium text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Tout suppr.
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto max-h-[calc(70vh-56px)] divide-y divide-border">
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="h-5 w-5 animate-spin text-[#2563eb]" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell className="mx-auto h-8 w-8 text-muted-foreground/30" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Aucune notification
                                </p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const Icon = typeIcons[notif.type] || Info;
                                const colorClass = typeColors[notif.type] || typeColors.system;
                                return (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors group ${!notif.is_read ? "bg-blue-50/50" : ""
                                            }`}
                                    >
                                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm truncate ${!notif.is_read ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && (
                                                    <span className="h-2 w-2 rounded-full bg-[#2563eb] shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                {notif.content}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/70 mt-1">
                                                {timeAgo(notif.created_at)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => deleteNotification(e, notif.id)}
                                            className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 hover:text-red-500 transition-all mt-0.5"
                                            title="Supprimer"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
