import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BusinessSettings {
  name: string;
  email: string;
  phone: string;
}

interface PricingSettings {
  base_delivery_fee: number;
  express_surcharge: number;
  per_km_rate: number;
}

interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  auto_assign_riders: boolean;
}

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [business, setBusiness] = useState<BusinessSettings>({
    name: "Pro Errands",
    email: "support@proerrands.co.ke",
    phone: "+254 700 123 456",
  });

  const [pricing, setPricing] = useState<PricingSettings>({
    base_delivery_fee: 200,
    express_surcharge: 100,
    per_km_rate: 20,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_enabled: true,
    sms_enabled: false,
    auto_assign_riders: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*");

      if (error) throw error;

      if (data) {
        data.forEach((setting: any) => {
          if (setting.key === "business" && setting.value) {
            setBusiness(setting.value as BusinessSettings);
          } else if (setting.key === "pricing" && setting.value) {
            setPricing(setting.value as PricingSettings);
          } else if (setting.key === "notifications" && setting.value) {
            setNotifications(setting.value as NotificationSettings);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updates = [
        { key: "business", value: business },
        { key: "pricing", value: pricing },
        { key: "notifications", value: notifications },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("settings")
          .update({ value: update.value as any })
          .eq("key", update.key);

        if (error) throw error;
      }

      toast({ title: "Settings saved successfully" });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ title: "Error saving settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Update your business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="businessEmail">Support Email</Label>
              <Input
                id="businessEmail"
                type="email"
                value={business.email}
                onChange={(e) => setBusiness({ ...business, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="businessPhone">Support Phone</Label>
              <Input
                id="businessPhone"
                value={business.phone}
                onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Configure delivery fees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="baseDeliveryFee">Base Delivery Fee (KES)</Label>
              <Input
                id="baseDeliveryFee"
                type="number"
                value={pricing.base_delivery_fee}
                onChange={(e) => setPricing({ ...pricing, base_delivery_fee: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="expressSurcharge">Express Delivery Surcharge (KES)</Label>
              <Input
                id="expressSurcharge"
                type="number"
                value={pricing.express_surcharge}
                onChange={(e) => setPricing({ ...pricing, express_surcharge: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="perKmRate">Per Kilometer Rate (KES)</Label>
              <Input
                id="perKmRate"
                type="number"
                value={pricing.per_km_rate}
                onChange={(e) => setPricing({ ...pricing, per_km_rate: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications & Automation</CardTitle>
            <CardDescription>Configure system behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Send order updates to customers via email
                </p>
              </div>
              <Switch
                checked={notifications.email_enabled}
                onCheckedChange={(checked) => setNotifications({ ...notifications, email_enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Send order updates via SMS
                </p>
              </div>
              <Switch
                checked={notifications.sms_enabled}
                onCheckedChange={(checked) => setNotifications({ ...notifications, sms_enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Auto-assign Riders</p>
                <p className="text-sm text-muted-foreground">
                  Automatically assign available riders to new orders
                </p>
              </div>
              <Switch
                checked={notifications.auto_assign_riders}
                onCheckedChange={(checked) => setNotifications({ ...notifications, auto_assign_riders: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full sm:w-auto" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </AdminLayout>
  );
}