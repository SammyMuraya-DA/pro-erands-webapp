 import { useEffect, useState } from "react";
 import { Shield, ShieldCheck, ShieldOff, Search, UserPlus, Lock } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import AdminLayout from "./AdminLayout";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from "@/components/ui/alert-dialog";
 import { useToast } from "@/hooks/use-toast";
 import { useAuth } from "@/hooks/useAuth";
 
 // Primary super admin that cannot be demoted or deleted
 const PROTECTED_SUPER_ADMIN_EMAIL = "smuraya750@gmail.com";
 
 interface UserWithRole {
   id: string;
   user_id: string;
   full_name: string | null;
   email: string | null;
   phone: string | null;
   created_at: string;
   role: "admin" | "moderator" | "user" | null;
   role_id: string | null;
 }
 
 export default function UserManagement() {
   const [users, setUsers] = useState<UserWithRole[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [confirmDialog, setConfirmDialog] = useState<{
     open: boolean;
     action: "grant" | "revoke";
     user: UserWithRole | null;
   }>({ open: false, action: "grant", user: null });
   const { toast } = useToast();
   const { user: currentUser } = useAuth();
 
   useEffect(() => {
     fetchUsers();
   }, []);
 
   async function fetchUsers() {
     try {
       // Fetch all profiles
       const { data: profiles, error: profilesError } = await supabase
         .from("profiles")
         .select("*")
         .order("created_at", { ascending: false });
 
       if (profilesError) throw profilesError;
 
       // Fetch all user roles
       const { data: roles, error: rolesError } = await supabase
         .from("user_roles")
         .select("*");
 
       if (rolesError) throw rolesError;
 
       // Merge profiles with roles
       const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
         const userRole = roles?.find((r) => r.user_id === profile.user_id);
         return {
           ...profile,
           role: userRole?.role || null,
           role_id: userRole?.id || null,
         };
       });
 
       setUsers(usersWithRoles);
     } catch (error) {
       console.error("Error fetching users:", error);
       toast({ title: "Error loading users", variant: "destructive" });
     } finally {
       setLoading(false);
     }
   }
 
   async function handleGrantAdmin(user: UserWithRole) {
     try {
       const { error } = await supabase.from("user_roles").insert({
         user_id: user.user_id,
         role: "admin" as const,
       });
 
       if (error) throw error;
 
       toast({ title: `Admin privileges granted to ${user.full_name || user.email}` });
       fetchUsers();
     } catch (error) {
       console.error("Error granting admin:", error);
       toast({ title: "Error granting admin privileges", variant: "destructive" });
     } finally {
       setConfirmDialog({ open: false, action: "grant", user: null });
     }
   }
 
   async function handleRevokeAdmin(user: UserWithRole) {
     // Protect primary super admin
     if (user.email === PROTECTED_SUPER_ADMIN_EMAIL) {
       toast({
         title: "Cannot revoke primary super admin",
         description: "This account is protected and cannot be demoted.",
         variant: "destructive",
       });
       return;
     }
 
     try {
       if (!user.role_id) return;
 
       const { error } = await supabase
         .from("user_roles")
         .delete()
         .eq("id", user.role_id);
 
       if (error) throw error;
 
       toast({ title: `Admin privileges revoked from ${user.full_name || user.email}` });
       fetchUsers();
     } catch (error) {
       console.error("Error revoking admin:", error);
       toast({ title: "Error revoking admin privileges", variant: "destructive" });
     } finally {
       setConfirmDialog({ open: false, action: "revoke", user: null });
     }
   }
 
   const filteredUsers = users.filter(
     (user) =>
       user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.phone?.includes(searchQuery)
   );
 
   const adminUsers = filteredUsers.filter((u) => u.role === "admin");
   const regularUsers = filteredUsers.filter((u) => u.role !== "admin");
 
   const isProtectedAdmin = (email: string | null) => email === PROTECTED_SUPER_ADMIN_EMAIL;
 
   return (
     <AdminLayout title="User Management">
       <div className="space-y-6">
         {/* Header */}
         <div className="flex flex-col sm:flex-row gap-4 justify-between">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search users by name, email, or phone..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10"
             />
           </div>
         </div>
 
         {/* Stats */}
         <div className="grid gap-4 sm:grid-cols-3">
           <div className="bg-card rounded-xl border border-border p-4">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                 <ShieldCheck className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <p className="text-2xl font-bold text-foreground">{adminUsers.length}</p>
                 <p className="text-sm text-muted-foreground">Admin Users</p>
               </div>
             </div>
           </div>
           <div className="bg-card rounded-xl border border-border p-4">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                 <Shield className="h-5 w-5 text-muted-foreground" />
               </div>
               <div>
                 <p className="text-2xl font-bold text-foreground">{regularUsers.length}</p>
                 <p className="text-sm text-muted-foreground">Regular Users</p>
               </div>
             </div>
           </div>
           <div className="bg-card rounded-xl border border-border p-4">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                 <Lock className="h-5 w-5 text-success" />
               </div>
               <div>
                 <p className="text-2xl font-bold text-foreground">1</p>
                 <p className="text-sm text-muted-foreground">Protected Super Admin</p>
               </div>
             </div>
           </div>
         </div>
 
         {loading ? (
           <div className="flex items-center justify-center h-64">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </div>
         ) : (
           <div className="space-y-6">
             {/* Admin Users Section */}
             <div>
               <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                 <ShieldCheck className="h-5 w-5 text-primary" />
                 Administrators ({adminUsers.length})
               </h3>
               {adminUsers.length === 0 ? (
                 <p className="text-muted-foreground text-sm">No administrators found</p>
               ) : (
                 <div className="grid gap-3">
                   {adminUsers.map((user) => (
                     <div
                       key={user.id}
                       className={`bg-card rounded-xl border p-4 flex items-center justify-between ${
                         isProtectedAdmin(user.email)
                           ? "border-primary/50 bg-primary/5"
                           : "border-border"
                       }`}
                     >
                       <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                           {isProtectedAdmin(user.email) ? (
                             <Lock className="h-5 w-5 text-primary" />
                           ) : (
                             <ShieldCheck className="h-5 w-5 text-primary" />
                           )}
                         </div>
                         <div>
                           <div className="flex items-center gap-2">
                             <p className="font-medium text-foreground">
                               {user.full_name || "No name"}
                             </p>
                             {isProtectedAdmin(user.email) && (
                               <Badge className="bg-primary/10 text-primary border-0 text-xs">
                                 Super Admin
                               </Badge>
                             )}
                           </div>
                           <p className="text-sm text-muted-foreground">{user.email}</p>
                           {user.phone && (
                             <p className="text-xs text-muted-foreground">{user.phone}</p>
                           )}
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <Badge className="bg-success/10 text-success border-0">Admin</Badge>
                         {!isProtectedAdmin(user.email) && (
                           <Button
                             variant="outline"
                             size="sm"
                             className="text-destructive hover:text-destructive"
                             onClick={() =>
                               setConfirmDialog({ open: true, action: "revoke", user })
                             }
                           >
                             <ShieldOff className="h-4 w-4 mr-1" />
                             Revoke
                           </Button>
                         )}
                         {isProtectedAdmin(user.email) && (
                           <Badge variant="outline" className="text-xs">
                             <Lock className="h-3 w-3 mr-1" />
                             Protected
                           </Badge>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
 
             {/* Regular Users Section */}
             <div>
               <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                 <Shield className="h-5 w-5 text-muted-foreground" />
                 Regular Users ({regularUsers.length})
               </h3>
               {regularUsers.length === 0 ? (
                 <p className="text-muted-foreground text-sm">No regular users found</p>
               ) : (
                 <div className="grid gap-3">
                   {regularUsers.map((user) => (
                     <div
                       key={user.id}
                       className="bg-card rounded-xl border border-border p-4 flex items-center justify-between"
                     >
                       <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                           <Shield className="h-5 w-5 text-muted-foreground" />
                         </div>
                         <div>
                           <p className="font-medium text-foreground">
                             {user.full_name || "No name"}
                           </p>
                           <p className="text-sm text-muted-foreground">{user.email}</p>
                           {user.phone && (
                             <p className="text-xs text-muted-foreground">{user.phone}</p>
                           )}
                         </div>
                       </div>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() =>
                           setConfirmDialog({ open: true, action: "grant", user })
                         }
                       >
                         <UserPlus className="h-4 w-4 mr-1" />
                         Make Admin
                       </Button>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
         )}
       </div>
 
       {/* Confirmation Dialog */}
       <AlertDialog
         open={confirmDialog.open}
         onOpenChange={(open) =>
           setConfirmDialog({ ...confirmDialog, open })
         }
       >
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>
               {confirmDialog.action === "grant"
                 ? "Grant Admin Privileges"
                 : "Revoke Admin Privileges"}
             </AlertDialogTitle>
             <AlertDialogDescription>
               {confirmDialog.action === "grant" ? (
                 <>
                   Are you sure you want to make{" "}
                   <strong>
                     {confirmDialog.user?.full_name || confirmDialog.user?.email}
                   </strong>{" "}
                   an administrator? They will have full access to the admin dashboard.
                 </>
               ) : (
                 <>
                   Are you sure you want to revoke admin privileges from{" "}
                   <strong>
                     {confirmDialog.user?.full_name || confirmDialog.user?.email}
                   </strong>
                   ? They will lose access to the admin dashboard.
                 </>
               )}
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction
               onClick={() => {
                 if (confirmDialog.user) {
                   if (confirmDialog.action === "grant") {
                     handleGrantAdmin(confirmDialog.user);
                   } else {
                     handleRevokeAdmin(confirmDialog.user);
                   }
                 }
               }}
               className={
                 confirmDialog.action === "revoke"
                   ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                   : ""
               }
             >
               {confirmDialog.action === "grant" ? "Grant Admin" : "Revoke Admin"}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </AdminLayout>
   );
 }