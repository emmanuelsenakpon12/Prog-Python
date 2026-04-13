"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Search,
  Users,
  Trash2,
  UserX,
  UserCheck,
  MoreVertical,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
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

interface User {
  id: string;
  fullname: string;
  email: string;
  is_active: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}admin/get_users.php`);
      if (!usersRes.ok) {
        console.error(
          "API response error:",
          usersRes.status,
          usersRes.statusText,
        );
        throw new Error(`Failed to fetch users: ${usersRes.status}`);
      }
      const usersData = await usersRes.json();
      console.log("Users fetched:", usersData);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Erreur de récupération des utilisateurs.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: any) => {
    setIsActionLoading(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}admin/update_user_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, is_active: !currentStatus }),
        },
      );
      if (res.ok) {
        toast.success(
          !currentStatus ? "Compte réactivé." : "Compte désactivé.",
        );
        fetchUsers();
      } else {
        toast.error("Échec de la mise à jour.");
      }
    } catch (err) {
      toast.error("Erreur serveur.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsActionLoading(userId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}admin/delete_user.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Utilisateur supprimé.");
        fetchUsers();
      } else {
        toast.error(data.message || "Erreur lors de la suppression.");
      }
    } catch (err) {
      toast.error("Erreur serveur.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (u: User) =>
      u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Gestion Voyageurs
              </h1>
              <p className="mt-2 text-muted-foreground">
                Supervision des comptes utilisateurs et actions de modération.
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-64 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>
          </header>

          <section className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-6 py-4">Utilisateur</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Inscription</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-muted-foreground"
                      >
                        Aucun voyageur trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <tr
                        key={user.id}
                        className="text-sm hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                              {user.fullname.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold">{user.fullname}</div>
                              <div className="text-xs text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${Number(user.is_active) ? "bg-green-500" : "bg-red-500"}`}
                            />
                            <span className="text-xs font-medium">
                              {Number(user.is_active) ? "Actif" : "Désactivé"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                toggleUserStatus(
                                  user.id,
                                  Number(user.is_active),
                                )
                              }
                              disabled={isActionLoading === user.id}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${Number(user.is_active) ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" : "bg-green-500/10 text-green-600 hover:bg-green-500/20"}`}
                              title={
                                Number(user.is_active)
                                  ? "Désactiver le compte"
                                  : "Activer le compte"
                              }
                            >
                              {isActionLoading === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : Number(user.is_active) ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  disabled={isActionLoading === user.id}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5 text-red-600" />
                                    Action irréversible
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Voulez-vous vraiment supprimer le compte de{" "}
                                    <strong>{user.fullname}</strong> ? Toutes
                                    ses données seront perdues définitivement.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUser(user.id)}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Supprimer le compte
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
    </div>
  );
}
