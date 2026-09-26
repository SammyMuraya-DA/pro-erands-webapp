import { useEffect, useState } from "react";
import { Check, X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface RiderApplication {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  vehicle_type: string | null;
  vehicle_plate: string | null;
  status: string;
  created_at: string;
}

export default function RiderApplications() {
  const [applications, setApplications] = useState<RiderApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("rider_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications((data || []) as RiderApplication[]);
    } catch (error) {
      console.error("Error loading rider applications:", error);
      toast({ title: "Error loading applications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDecision = async (application: RiderApplication, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("rider_applications")
        .update({ status })
        .eq("id", application.id);

      if (error) throw error;

      if (status === "approved") {
        const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");

        const { error: riderError } = await supabase.from("riders").insert({
          name: application.name,
          phone: application.phone,
          email: application.email || null,
          vehicle_type: application.vehicle_type || "motorcycle",
          vehicle_plate: application.vehicle_plate || null,
          auth_token: token,
          status: "available",
        });

        if (riderError) throw riderError;
      }

      toast({
        title: status === "approved" ? "Application approved" : "Application rejected",
      });
      fetchApplications();
    } catch (error) {
      console.error("Error updating application:", error);
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  const filteredApplications = applications.filter((application) =>
    application.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    application.phone.includes(searchQuery) ||
    application.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Rider Applications">
      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, phone, or email"
            className="pl-9"
          />
        </div>

        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Loading applications...</p>
        ) : filteredApplications.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {searchQuery ? "No applications match your search." : "No rider applications yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-foreground">{application.name}</h2>
                    <Badge variant={application.status === "pending" ? "secondary" : "outline"}>
                      {application.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {application.phone}{application.email ? ` · ${application.email}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[application.city, application.vehicle_type, application.vehicle_plate]
                      .filter(Boolean)
                      .join(" · ") || "No location or vehicle details provided"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Applied {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>

                {application.status === "pending" && (
                  <div className="flex shrink-0 gap-2">
                    <Button onClick={() => handleDecision(application, "approved")}>
                      <Check className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDecision(application, "rejected")}
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}