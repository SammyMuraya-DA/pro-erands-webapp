import { useEffect, useState } from "react";
import { Search, User, Mail, Phone, Package, Edit, Trash2, Eye, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  order_count: number;
}

interface Address {
  id: string;
  label: string;
  address_line: string;
  area: string | null;
  city: string;
  is_default: boolean;
}

interface Order {
  id: string;
  order_number: string;
  service_type: string;
  status: string;
  created_at: string;
  total_amount: number | null;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerAddresses, setCustomerAddresses] = useState<Address[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const customersWithOrders = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.user_id);

          return {
            ...profile,
            order_count: count || 0,
          };
        })
      );

      setCustomers(customersWithOrders);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomerDetails(customer: Customer) {
    try {
      const [addressesRes, ordersRes] = await Promise.all([
        supabase
          .from("addresses")
          .select("*")
          .eq("user_id", customer.user_id)
          .order("is_default", { ascending: false }),
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", customer.user_id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (addressesRes.error) throw addressesRes.error;
      if (ordersRes.error) throw ordersRes.error;

      setCustomerAddresses(addressesRes.data || []);
      setCustomerOrders(ordersRes.data || []);
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
        })
        .eq("id", selectedCustomer.id);

      if (error) throw error;

      setCustomers(customers.map(c =>
        c.id === selectedCustomer.id
          ? { ...c, ...formData }
          : c
      ));

      setEditDialogOpen(false);
      toast({ title: "Customer updated successfully" });
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({ title: "Error updating customer", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!selectedCustomer) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", selectedCustomer.id);

      if (error) throw error;

      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
      toast({ title: "Customer deleted successfully" });
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({ title: "Error deleting customer", variant: "destructive" });
    }
  }

  function openEditDialog(customer: Customer) {
    setSelectedCustomer(customer);
    setFormData({
      full_name: customer.full_name || "",
      email: customer.email || "",
      phone: customer.phone || "",
    });
    setEditDialogOpen(true);
  }

  async function openViewDialog(customer: Customer) {
    setSelectedCustomer(customer);
    await fetchCustomerDetails(customer);
    setViewDialogOpen(true);
  }

  const filteredCustomers = customers.filter(customer =>
    (customer.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (customer.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (customer.phone || "").includes(searchQuery)
  );

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-muted text-muted-foreground",
      confirmed: "bg-primary/10 text-primary",
      assigned: "bg-primary/10 text-primary",
      picked_up: "bg-warning/10 text-warning",
      in_transit: "bg-accent/10 text-accent",
      delivered: "bg-success/10 text-success",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return (
      <Badge className={`${colors[status] || 'bg-muted text-muted-foreground'} capitalize border-0`}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <AdminLayout title="Customers">
      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No customers found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">
                          {customer.full_name || "Unnamed"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.email || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.phone || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {customer.order_count} orders
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openViewDialog(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Customer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCustomer.full_name || "Unnamed Customer"}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                    {selectedCustomer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {selectedCustomer.email}
                      </span>
                    )}
                    {selectedCustomer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {selectedCustomer.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {customerAddresses.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Saved Addresses
                  </h4>
                  <div className="space-y-2">
                    {customerAddresses.map((address) => (
                      <div
                        key={address.id}
                        className="p-3 bg-muted/50 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{address.label}</span>
                          {address.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          {address.address_line}
                          {address.area && `, ${address.area}`}
                          {address.city && `, ${address.city}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {customerOrders.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Recent Orders
                  </h4>
                  <div className="space-y-2">
                    {customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 bg-muted/50 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono text-sm font-medium">
                            {order.order_number}
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {order.service_type.replace("-", " ")}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          {order.total_amount && (
                            <p className="text-xs text-muted-foreground mt-1">
                              KES {order.total_amount}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCustomer?.full_name || "this customer"}?
              This will remove their profile but not their orders. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}