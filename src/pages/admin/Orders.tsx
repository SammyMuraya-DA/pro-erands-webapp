import { useEffect, useState } from "react";
import { Search, Filter, RefreshCw, Eye, Trash2, Plus, Mail, UserPlus, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import RiderAssignmentDialog from "@/components/admin/RiderAssignmentDialog";

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  service_type: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  package_description: string | null;
  total_amount: number | null;
  assigned_rider_id: string | null;
  estimated_delivery_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  payment_status: string;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
}

interface Rider {
  id: string;
  name: string;
  phone: string;
  status: string;
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "searching", label: "Searching" },
  { value: "confirmed", label: "Confirmed" },
  { value: "assigned", label: "Assigned" },
  { value: "picked_up", label: "Picked Up" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const paymentStatusOptions = [
  { value: "pending", label: "Pending", color: "bg-muted text-muted-foreground" },
  { value: "paid", label: "Paid", color: "bg-success/10 text-success" },
  { value: "failed", label: "Failed", color: "bg-destructive/10 text-destructive" },
  { value: "refunded", label: "Refunded", color: "bg-warning/10 text-warning" },
];

const paymentMethodOptions = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

const serviceTypes = [
  { value: "same-day-delivery", label: "Same Day Delivery" },
  { value: "pickup-dropoff", label: "Pickup & Dropoff" },
  { value: "shopping", label: "Shopping Assistance" },
  { value: "bills", label: "Bill Payments" },
  { value: "corporate", label: "Corporate Services" },
  { value: "concierge", label: "Concierge" },
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [ridersMap, setRidersMap] = useState<Map<string, Rider>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sendingReceipt, setSendingReceipt] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState<string | null>(null);
  const [newOrderData, setNewOrderData] = useState({
    service_type: "same-day-delivery",
    pickup_address: "",
    delivery_address: "",
    package_description: "",
    total_amount: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchRiders();

    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order change:', payload);
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new as unknown as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o =>
              o.id === (payload.new as any).id ? payload.new as unknown as Order : o
            ));
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRiders() {
    try {
      const { data, error } = await supabase
        .from("riders")
        .select("*")
        .order("name");

      if (error) throw error;
      const ridersList = (data || []) as Rider[];
      setRiders(ridersList.filter(r => r.status === 'available'));
      
      // Create a map for quick lookup of rider names
      const map = new Map<string, Rider>();
      ridersList.forEach(r => map.set(r.id, r));
      setRidersMap(map);
    } catch (error) {
      console.error("Error fetching riders:", error);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const updateData: Record<string, any> = { status: newStatus };

      if (newStatus === 'picked_up') {
        updateData.picked_up_at = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, ...updateData } : o
      ));

      toast({ title: "Order status updated" });
    } catch (error) {
      console.error("Error updating order:", error);
      toast({ title: "Error updating order", variant: "destructive" });
    }
  }

  function handleRiderAssigned(orderId: string, riderId: string) {
    const estimatedDelivery = new Date();
    estimatedDelivery.setHours(estimatedDelivery.getHours() + 1);

    setOrders(orders.map(o =>
      o.id === orderId ? {
        ...o,
        assigned_rider_id: riderId,
        status: "assigned",
        estimated_delivery_at: estimatedDelivery.toISOString()
      } : o
    ));
    setRiders(riders.filter(r => r.id !== riderId));
    setAssignDialogOpen(false);
    setSelectedOrder(null);
    fetchRiders(); // Refresh riders list
  }

  async function handleDeleteOrder() {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", selectedOrder.id);

      if (error) throw error;

      setOrders(orders.filter(o => o.id !== selectedOrder.id));
      setDeleteDialogOpen(false);
      setSelectedOrder(null);
      toast({ title: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({ title: "Error deleting order", variant: "destructive" });
    }
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const orderNumber = `PE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      const { error } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          service_type: newOrderData.service_type,
          pickup_address: newOrderData.pickup_address,
          delivery_address: newOrderData.delivery_address,
          package_description: newOrderData.package_description || null,
          total_amount: newOrderData.total_amount ? parseFloat(newOrderData.total_amount) : null,
          status: "pending",
        });

      if (error) throw error;

      setCreateDialogOpen(false);
      setNewOrderData({
        service_type: "same-day-delivery",
        pickup_address: "",
        delivery_address: "",
        package_description: "",
        total_amount: "",
      });
      fetchOrders();
      toast({ title: "Order created successfully" });
    } catch (error) {
      console.error("Error creating order:", error);
      toast({ title: "Error creating order", variant: "destructive" });
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickup_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-muted text-muted-foreground",
      searching: "bg-warning/10 text-warning",
      confirmed: "bg-primary/10 text-primary",
      assigned: "bg-primary/10 text-primary",
      picked_up: "bg-warning/10 text-warning",
      in_transit: "bg-accent/10 text-accent",
      delivered: "bg-success/10 text-success",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return (
      <Badge className={`${colors[status] || 'bg-muted text-muted-foreground'} capitalize border-0`}>
        {status === 'searching' ? '🔍 Searching' : status.replace("_", " ")}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const option = paymentStatusOptions.find(o => o.value === paymentStatus);
    return (
      <Badge className={`${option?.color || 'bg-muted text-muted-foreground'} capitalize border-0`}>
        {paymentStatus}
      </Badge>
    );
  };

  async function updatePaymentStatus(orderId: string, paymentStatus: string, paymentMethod?: string, sendReceipt?: boolean) {
    try {
      const updateData: Record<string, any> = { payment_status: paymentStatus };

      if (paymentStatus === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }
      if (paymentMethod) {
        updateData.payment_method = paymentMethod;
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, ...updateData } : o
      ));

      toast({ title: `Payment marked as ${paymentStatus}` });

      // If payment is marked as paid and sendReceipt is true, send receipt email
      if (paymentStatus === 'paid' && sendReceipt) {
        await sendPaymentReceipt(orderId);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({ title: "Error updating payment status", variant: "destructive" });
    }
  }

  async function sendPaymentReceipt(orderId: string, customerEmail?: string) {
    setSendingReceipt(orderId);
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error("Order not found");

      // Get customer email from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", order.user_id)
        .single();

      const email = customerEmail || profile?.email;
      if (!email) {
        toast({ 
          title: "No email address found", 
          description: "Customer email is required to send receipt",
          variant: "destructive" 
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("send-payment-receipt", {
        body: {
          orderId: order.id,
          customerEmail: email,
          customerName: profile?.full_name,
        },
      });

      if (error) throw error;

      toast({ 
        title: "Receipt sent!", 
        description: `Payment receipt sent to ${email}` 
      });
    } catch (error) {
      console.error("Error sending receipt:", error);
      toast({ 
        title: "Failed to send receipt", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setSendingReceipt(null);
    }
  }

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Real-time updates enabled
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="hidden lg:table-cell">Pickup</TableHead>
                  <TableHead className="hidden lg:table-cell">Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">
                      {order.order_number}
                    </TableCell>
                    <TableCell className="capitalize">
                      {order.service_type.replace("-", " ")}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-48 truncate">
                      {order.pickup_address}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-48 truncate">
                      {order.delivery_address}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          {getStatusBadge(order.status)}
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.payment_status || 'pending'}
                        onValueChange={(value) => updatePaymentStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          {getPaymentStatusBadge(order.payment_status || 'pending')}
                        </SelectTrigger>
                        <SelectContent>
                          {paymentStatusOptions.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedOrder(order);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!order.assigned_rider_id && (order.status === "pending" || order.status === "confirmed") && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={async () => {
                                setDispatching(order.id);
                                try {
                                  const { data, error } = await supabase.functions.invoke('auto-dispatch', {
                                    body: { orderId: order.id },
                                  });
                                  if (error) throw error;
                                  if (data?.success) {
                                    toast({ title: `🚀 Dispatched to ${data.rider.name}`, description: `${data.rider.distance?.toFixed(1) || '?'}km away • ${data.remainingRiders} riders remaining` });
                                  } else {
                                    toast({ title: data?.error || 'No riders available', variant: 'destructive' });
                                  }
                                } catch (e) {
                                  toast({ title: 'Dispatch failed', variant: 'destructive' });
                                } finally {
                                  setDispatching(null);
                                  fetchOrders();
                                }
                              }}
                              disabled={dispatching === order.id}
                            >
                              <Zap className="h-4 w-4 mr-1" />
                              {dispatching === order.id ? 'Dispatching...' : 'Auto-Dispatch'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setAssignDialogOpen(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Manual
                            </Button>
                          </>
                        )}
                        {order.status === "searching" && (
                          <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20 animate-pulse">
                            🔍 Finding rider...
                          </Badge>
                        )}
                        {order.assigned_rider_id && (
                          <Badge variant="outline" className="text-xs">
                            {ridersMap.get(order.assigned_rider_id)?.name || 'Rider assigned'}
                          </Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedOrder(order);
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

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono font-medium">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="capitalize">{selectedOrder.service_type.replace("-", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p>{selectedOrder.total_amount ? `KES ${selectedOrder.total_amount}` : "-"}</p>
                </div>
              </div>

              {/* Payment Section */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Payment Information</h4>
                  {selectedOrder.payment_status === 'paid' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendPaymentReceipt(selectedOrder.id)}
                      disabled={sendingReceipt === selectedOrder.id}
                    >
                      {sendingReceipt === selectedOrder.id ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-1" />
                      )}
                      Send Receipt
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <div className="mt-1">
                      <Select
                        value={selectedOrder.payment_status || 'pending'}
                        onValueChange={(value) => {
                          const shouldSendReceipt = value === 'paid' && selectedOrder.payment_status !== 'paid';
                          updatePaymentStatus(selectedOrder.id, value, undefined, shouldSendReceipt);
                          setSelectedOrder({ ...selectedOrder, payment_status: value, paid_at: value === 'paid' ? new Date().toISOString() : selectedOrder.paid_at });
                        }}
                      >
                        <SelectTrigger className="w-full h-9">
                          {getPaymentStatusBadge(selectedOrder.payment_status || 'pending')}
                        </SelectTrigger>
                        <SelectContent>
                          {paymentStatusOptions.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <div className="mt-1">
                      <Select
                        value={selectedOrder.payment_method || ''}
                        onValueChange={(value) => {
                          updatePaymentStatus(selectedOrder.id, selectedOrder.payment_status || 'pending', value);
                          setSelectedOrder({ ...selectedOrder, payment_method: value });
                        }}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethodOptions.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                {selectedOrder.payment_reference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Reference</p>
                    <p className="font-mono text-sm">{selectedOrder.payment_reference}</p>
                  </div>
                )}
                {selectedOrder.paid_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Paid At</p>
                    <p className="text-sm">{new Date(selectedOrder.paid_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Pickup Address</p>
                <p>{selectedOrder.pickup_address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p>{selectedOrder.delivery_address}</p>
              </div>
              {selectedOrder.package_description && (
                <div>
                  <p className="text-sm text-muted-foreground">Package Description</p>
                  <p>{selectedOrder.package_description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                {selectedOrder.estimated_delivery_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Delivery</p>
                    <p className="text-sm">{new Date(selectedOrder.estimated_delivery_at).toLocaleString()}</p>
                  </div>
                )}
                {selectedOrder.picked_up_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Picked Up</p>
                    <p className="text-sm">{new Date(selectedOrder.picked_up_at).toLocaleString()}</p>
                  </div>
                )}
                {selectedOrder.delivered_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Delivered</p>
                    <p className="text-sm">{new Date(selectedOrder.delivered_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Rider Dialog */}
      <RiderAssignmentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        order={selectedOrder}
        onAssigned={handleRiderAssigned}
      />

      {/* Create Order Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrder} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="service_type">Service Type</Label>
              <Select
                value={newOrderData.service_type}
                onValueChange={(value) => setNewOrderData({ ...newOrderData, service_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pickup_address">Pickup Address</Label>
              <Input
                id="pickup_address"
                value={newOrderData.pickup_address}
                onChange={(e) => setNewOrderData({ ...newOrderData, pickup_address: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="delivery_address">Delivery Address</Label>
              <Input
                id="delivery_address"
                value={newOrderData.delivery_address}
                onChange={(e) => setNewOrderData({ ...newOrderData, delivery_address: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="package_description">Package Description (Optional)</Label>
              <Textarea
                id="package_description"
                value={newOrderData.package_description}
                onChange={(e) => setNewOrderData({ ...newOrderData, package_description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="total_amount">Amount (KES)</Label>
              <Input
                id="total_amount"
                type="number"
                value={newOrderData.total_amount}
                onChange={(e) => setNewOrderData({ ...newOrderData, total_amount: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Order</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order {selectedOrder?.order_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
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