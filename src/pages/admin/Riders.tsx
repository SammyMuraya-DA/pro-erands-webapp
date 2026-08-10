import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Phone, Mail, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import RiderTrackingMap from "@/components/admin/RiderTrackingMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle_type: string;
  vehicle_plate: string | null;
  status: string;
  created_at: string;
  current_latitude: number | null;
  current_longitude: number | null;
}

const vehicleTypes = ["motorcycle", "bicycle", "car", "van"];

export default function Riders() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicle_type: "motorcycle",
    vehicle_plate: "",
    status: "available",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRiders();
  }, []);

  async function fetchRiders() {
    try {
      const { data, error } = await supabase
        .from("riders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRiders((data || []) as Rider[]);
    } catch (error) {
      console.error("Error fetching riders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (selectedRider) {
        const { error } = await supabase
          .from("riders")
          .update(formData)
          .eq("id", selectedRider.id);

        if (error) throw error;
        toast({ title: "Rider updated successfully" });
      } else {
        const { error } = await supabase
          .from("riders")
          .insert(formData);

        if (error) throw error;
        toast({ title: "Rider added successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchRiders();
    } catch (error) {
      console.error("Error saving rider:", error);
      toast({ title: "Error saving rider", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!selectedRider) return;

    try {
      const { error } = await supabase
        .from("riders")
        .delete()
        .eq("id", selectedRider.id);

      if (error) throw error;

      setRiders(riders.filter(r => r.id !== selectedRider.id));
      setDeleteDialogOpen(false);
      setSelectedRider(null);
      toast({ title: "Rider deleted successfully" });
    } catch (error) {
      console.error("Error deleting rider:", error);
      toast({ title: "Error deleting rider", variant: "destructive" });
    }
  }

  function openEditDialog(rider: Rider) {
    setSelectedRider(rider);
    setFormData({
      name: rider.name,
      phone: rider.phone,
      email: rider.email || "",
      vehicle_type: rider.vehicle_type,
      vehicle_plate: rider.vehicle_plate || "",
      status: rider.status,
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setSelectedRider(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      vehicle_type: "motorcycle",
      vehicle_plate: "",
      status: "available",
    });
  }

  const filteredRiders = riders.filter(rider =>
    rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.phone.includes(searchQuery)
  );

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      available: "bg-success/10 text-success",
      busy: "bg-warning/10 text-warning",
      offline: "bg-muted text-muted-foreground",
    };
    return (
      <Badge className={`${colors[status]} capitalize border-0`}>
        {status}
      </Badge>
    );
  };

  return (
    <AdminLayout title="Riders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search riders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showMap ? "default" : "outline"}
              onClick={() => setShowMap(!showMap)}
            >
              <Map className="h-4 w-4 mr-2" />
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rider
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedRider ? "Edit Rider" : "Add New Rider"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle_type">Vehicle Type</Label>
                  <Select
                    value={formData.vehicle_type}
                    onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map(v => (
                        <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicle_plate">License Plate (Optional)</Label>
                  <Input
                    id="vehicle_plate"
                    value={formData.vehicle_plate}
                    onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                  />
                </div>
                {selectedRider && (
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedRider ? "Update" : "Add"} Rider
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Live Map Section */}
        {showMap && (
          <RiderTrackingMap 
            onRiderSelect={(rider) => {
              // Find the full rider data by ID
              const fullRider = riders.find(r => r.id === rider.id);
              if (fullRider) {
                setSelectedRider(fullRider);
              }
            }}
          />
        )}
        {/* Riders Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
            No riders found
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRiders.map((rider) => (
              <div
                key={rider.id}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{rider.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {rider.vehicle_type} {rider.vehicle_plate && `• ${rider.vehicle_plate}`}
                    </p>
                  </div>
                  {getStatusBadge(rider.status)}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {rider.phone}
                  </div>
                  {rider.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {rider.email}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditDialog(rider)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setSelectedRider(rider);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRider?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
