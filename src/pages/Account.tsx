import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { 
  User, MapPin, Package, LogOut, Plus, Edit2, Trash2, 
  Clock, CheckCircle, Truck, XCircle 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

interface Address {
  id: string;
  label: string;
  address_line: string;
  city: string;
  area: string | null;
  instructions: string | null;
  is_default: boolean;
}

interface Order {
  id: string;
  order_number: string;
  service_type: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  package_description: string | null;
  total_amount: number | null;
  created_at: string;
}

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ full_name: "", phone: "" });
  const [newAddress, setNewAddress] = useState({ label: "", address_line: "", area: "", instructions: "" });
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAddresses();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user?.id)
      .maybeSingle();
    
    if (data) {
      setProfile(data);
      setEditedProfile({ full_name: data.full_name || "", phone: data.phone || "" });
    }
  };

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user?.id)
      .order("is_default", { ascending: false });
    
    if (data) setAddresses(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    
    if (data) setOrders(data);
  };

  const updateProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editedProfile.full_name,
        phone: editedProfile.phone,
      })
      .eq("user_id", user?.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your profile has been saved." });
      fetchProfile();
      setIsEditing(false);
    }
  };

  const addAddress = async () => {
    if (!newAddress.address_line || !newAddress.label) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("addresses").insert({
      user_id: user?.id,
      label: newAddress.label,
      address_line: newAddress.address_line,
      city: "Nairobi",
      area: newAddress.area || null,
      instructions: newAddress.instructions || null,
      is_default: addresses.length === 0,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to add address", variant: "destructive" });
    } else {
      toast({ title: "Address added", description: "Your new address has been saved." });
      fetchAddresses();
      setNewAddress({ label: "", address_line: "", area: "", instructions: "" });
      setIsAddressDialogOpen(false);
    }
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (!error) {
      toast({ title: "Address deleted" });
      fetchAddresses();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast({ title: "Signed out", description: "You have been signed out successfully." });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-warning" />;
      case "in_progress": return <Truck className="h-4 w-4 text-primary" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      in_progress: "default",
      completed: "outline",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 md:py-16 bg-gradient-to-b from-muted/50 to-background min-h-screen">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">My Account</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {profile?.full_name || user?.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Addresses</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="bg-card rounded-xl border border-border p-6 max-w-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold">Profile Information</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.full_name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-foreground mt-1">{profile?.full_name || "Not set"}</p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-foreground mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        placeholder="+254 7XX XXX XXX"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-foreground mt-1">{profile?.phone || "Not set"}</p>
                    )}
                  </div>
                  
                  {isEditing && (
                    <Button onClick={updateProfile} variant="hero" className="mt-4">
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold">Saved Addresses</h2>
                  <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="hero" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Label (e.g., Home, Office)</Label>
                          <Input
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                            placeholder="Home"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Input
                            value={newAddress.address_line}
                            onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                            placeholder="Building name, Street, Landmark"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Area/Neighborhood</Label>
                          <Input
                            value={newAddress.area}
                            onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                            placeholder="Westlands, Kilimani, etc."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Delivery Instructions (Optional)</Label>
                          <Input
                            value={newAddress.instructions}
                            onChange={(e) => setNewAddress({ ...newAddress, instructions: e.target.value })}
                            placeholder="Gate code, floor, etc."
                            className="mt-1"
                          />
                        </div>
                        <Button onClick={addAddress} variant="hero" className="w-full">
                          Save Address
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {addresses.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No addresses saved</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Add your frequently used addresses for faster ordering
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                      <div 
                        key={address.id} 
                        className="bg-card rounded-xl border border-border p-5 relative"
                      >
                        {address.is_default && (
                          <Badge className="absolute top-4 right-4" variant="secondary">Default</Badge>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground">{address.label}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{address.address_line}</p>
                            {address.area && (
                              <p className="text-sm text-muted-foreground">{address.area}, {address.city}</p>
                            )}
                            {address.instructions && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                "{address.instructions}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteAddress(address.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold">Order History</h2>
                  <Button variant="hero" asChild>
                    <Link to="/order/start">New Order</Link>
                  </Button>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No orders yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Place your first order and it will appear here
                    </p>
                    <Button variant="hero" asChild>
                      <Link to="/order/start">Start Order</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-card rounded-xl border border-border p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-foreground">
                                {order.order_number}
                              </span>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          {order.total_amount && (
                            <span className="font-semibold text-foreground">
                              KES {order.total_amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid gap-3 sm:grid-cols-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Service:</span>
                            <span className="ml-2 text-foreground capitalize">
                              {order.service_type.replace("-", " ")}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">From:</span>
                            <span className="ml-2 text-foreground">{order.pickup_address}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground">To:</span>
                            <span className="ml-2 text-foreground">{order.delivery_address}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/track?order=${order.order_number}`}>Track Order</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}
