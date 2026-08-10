import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package, MapPin, Calendar, Clock, CheckCircle, ArrowRight, ArrowLeft,
  Bike, ShoppingBag, Receipt, Briefcase, Sparkles, Truck, User, Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const services = [
  { id: "delivery", name: "Same-day Delivery", icon: Bike, description: "Fast courier service across Nairobi", price: "From KES 200" },
  { id: "shopping", name: "Grocery & Pharmacy", icon: ShoppingBag, description: "We shop and deliver to you", price: "From KES 300" },
  { id: "pickup-drop", name: "Pickup & Drop", icon: Package, description: "Documents and parcels delivery", price: "From KES 150" },
  { id: "bills-payments", name: "Bills & Payments", icon: Receipt, description: "Pay your bills hassle-free", price: "From KES 100" },
  { id: "concierge", name: "Errand Concierge", icon: Sparkles, description: "Personal assistant services", price: "From KES 500" },
  { id: "corporate", name: "Corporate Solutions", icon: Briefcase, description: "Business delivery solutions", price: "Custom pricing" },
];

const timeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
  "ASAP (Express +KES 100)",
];

const orderSchema = z.object({
  service: z.string().min(1, "Please select a service"),
  pickupAddress: z.string().min(5, "Please enter a valid pickup address"),
  pickupArea: z.string().min(2, "Please enter the area"),
  pickupPhone: z.string().min(9, "Please enter a valid phone number"),
  pickupInstructions: z.string().optional(),
  deliveryAddress: z.string().min(5, "Please enter a valid delivery address"),
  deliveryArea: z.string().min(2, "Please enter the area"),
  deliveryPhone: z.string().min(9, "Please enter a valid phone number"),
  deliveryInstructions: z.string().optional(),
  packageDescription: z.string().min(3, "Please describe your package"),
  packageSize: z.string().min(1, "Please select package size"),
  packageValue: z.string().optional(),
  scheduledDate: z.date({ required_error: "Please select a date" }),
  scheduledTime: z.string().min(1, "Please select a time slot"),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface SavedAddress {
  id: string;
  label: string;
  address_line: string;
  area: string | null;
  instructions: string | null;
}

const steps = [
  { id: 1, title: "Service", icon: Package },
  { id: 2, title: "Pickup", icon: MapPin },
  { id: 3, title: "Delivery", icon: Truck },
  { id: 4, title: "Package", icon: Package },
  { id: 5, title: "Schedule", icon: Calendar },
  { id: 6, title: "Confirm", icon: CheckCircle },
];

export default function Order() {
  const [currentStep, setCurrentStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      service: "",
      pickupAddress: "",
      pickupArea: "",
      pickupPhone: "",
      pickupInstructions: "",
      deliveryAddress: "",
      deliveryArea: "",
      deliveryPhone: "",
      deliveryInstructions: "",
      packageDescription: "",
      packageSize: "",
      packageValue: "",
      scheduledTime: "",
    },
  });

  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user?.id);
    if (data) setSavedAddresses(data);
  };

  const calculatePrice = () => {
    const service = form.watch("service");
    const packageSize = form.watch("packageSize");
    const time = form.watch("scheduledTime");
    
    let basePrice = 200;
    if (service === "shopping") basePrice = 300;
    if (service === "concierge") basePrice = 500;
    if (service === "bills-payments") basePrice = 100;
    if (service === "pickup-drop") basePrice = 150;
    if (service === "corporate") basePrice = 400;
    
    if (packageSize === "medium") basePrice += 100;
    if (packageSize === "large") basePrice += 200;
    if (packageSize === "extra-large") basePrice += 350;
    
    if (time?.includes("ASAP")) basePrice += 100;
    
    return basePrice;
  };

  const validateStep = async () => {
    let fieldsToValidate: (keyof OrderFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["service"];
        break;
      case 2:
        fieldsToValidate = ["pickupAddress", "pickupArea", "pickupPhone"];
        break;
      case 3:
        fieldsToValidate = ["deliveryAddress", "deliveryArea", "deliveryPhone"];
        break;
      case 4:
        fieldsToValidate = ["packageDescription", "packageSize"];
        break;
      case 5:
        fieldsToValidate = ["scheduledDate", "scheduledTime"];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const values = form.getValues();
    const totalAmount = calculatePrice();
    
    if (user) {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          service_type: values.service,
          pickup_address: `${values.pickupAddress}, ${values.pickupArea}`,
          delivery_address: `${values.deliveryAddress}, ${values.deliveryArea}`,
          package_description: values.packageDescription,
          total_amount: totalAmount,
          order_number: `PE-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`,
        })
        .select("order_number")
        .single();

      if (error) {
        toast({ title: "Error", description: "Failed to place order", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      setOrderNumber(data.order_number);
    } else {
      // Generate a temporary order number for guests
      setOrderNumber(`PE-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`);
    }
    
    setOrderConfirmed(true);
    setIsSubmitting(false);
  };

  const applySavedAddress = (address: SavedAddress, type: "pickup" | "delivery") => {
    if (type === "pickup") {
      form.setValue("pickupAddress", address.address_line);
      form.setValue("pickupArea", address.area || "");
      form.setValue("pickupInstructions", address.instructions || "");
    } else {
      form.setValue("deliveryAddress", address.address_line);
      form.setValue("deliveryArea", address.area || "");
      form.setValue("deliveryInstructions", address.instructions || "");
    }
  };

  if (orderConfirmed) {
    return (
      <Layout>
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background min-h-screen">
          <div className="container-custom">
            <div className="max-w-lg mx-auto text-center">
              <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-slide-up">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Order Placed Successfully!
              </h1>
              <p className="text-muted-foreground mb-6">
                Your order has been received and is being processed. Our rider will contact you shortly.
              </p>
              
              <div className="bg-card rounded-xl border border-border p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-2">Order Number</p>
                <p className="font-mono text-2xl font-bold text-primary">{orderNumber}</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Total: <span className="font-semibold text-foreground">KES {calculatePrice().toLocaleString()}</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" onClick={() => navigate(`/track?order=${orderNumber}`)}>
                  Track Order
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
              
              {!user && (
                <p className="text-sm text-muted-foreground mt-6">
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/auth")}>
                    Create an account
                  </Button>
                  {" "}to save your addresses and view order history.
                </p>
              )}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 md:py-12 bg-gradient-to-b from-muted/50 to-background min-h-screen">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">Place Your Order</h1>
            <p className="text-muted-foreground mt-2">Complete the steps below to get started</p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                        currentStep >= step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-xs mt-2 hidden sm:block",
                      currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "h-1 w-8 sm:w-16 mx-2",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                      Select a Service
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Choose the type of errand you need help with
                    </p>
                  </div>
                  
                  <RadioGroup
                    value={form.watch("service")}
                    onValueChange={(value) => form.setValue("service", value)}
                    className="grid gap-3"
                  >
                    {services.map((service) => (
                      <Label
                        key={service.id}
                        htmlFor={service.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          form.watch("service") === service.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <RadioGroupItem value={service.id} id={service.id} className="sr-only" />
                        <div className={cn(
                          "h-12 w-12 rounded-lg flex items-center justify-center",
                          form.watch("service") === service.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}>
                          <service.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <span className="text-sm font-medium text-primary">{service.price}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                  {form.formState.errors.service && (
                    <p className="text-sm text-destructive">{form.formState.errors.service.message}</p>
                  )}
                </div>
              )}

              {/* Step 2: Pickup Address */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                      Pickup Location
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Where should we pick up your item?
                    </p>
                  </div>

                  {savedAddresses.length > 0 && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Use saved address</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {savedAddresses.map((addr) => (
                          <Button
                            key={addr.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applySavedAddress(addr, "pickup")}
                          >
                            {addr.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pickupAddress">Address / Building Name</Label>
                      <Input
                        id="pickupAddress"
                        placeholder="e.g., ABC Building, Ngong Road"
                        className="mt-1"
                        {...form.register("pickupAddress")}
                      />
                      {form.formState.errors.pickupAddress && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.pickupAddress.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pickupArea">Area / Neighborhood</Label>
                      <Input
                        id="pickupArea"
                        placeholder="e.g., Westlands, Kilimani, CBD"
                        className="mt-1"
                        {...form.register("pickupArea")}
                      />
                      {form.formState.errors.pickupArea && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.pickupArea.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pickupPhone">Contact Phone</Label>
                      <Input
                        id="pickupPhone"
                        placeholder="+254 7XX XXX XXX"
                        className="mt-1"
                        {...form.register("pickupPhone")}
                      />
                      {form.formState.errors.pickupPhone && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.pickupPhone.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pickupInstructions">Instructions (Optional)</Label>
                      <Textarea
                        id="pickupInstructions"
                        placeholder="Gate code, floor number, landmarks..."
                        className="mt-1"
                        rows={2}
                        {...form.register("pickupInstructions")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Delivery Address */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                      Delivery Location
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Where should we deliver your item?
                    </p>
                  </div>

                  {savedAddresses.length > 0 && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Use saved address</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {savedAddresses.map((addr) => (
                          <Button
                            key={addr.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applySavedAddress(addr, "delivery")}
                          >
                            {addr.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="deliveryAddress">Address / Building Name</Label>
                      <Input
                        id="deliveryAddress"
                        placeholder="e.g., XYZ Apartments, Mombasa Road"
                        className="mt-1"
                        {...form.register("deliveryAddress")}
                      />
                      {form.formState.errors.deliveryAddress && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.deliveryAddress.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="deliveryArea">Area / Neighborhood</Label>
                      <Input
                        id="deliveryArea"
                        placeholder="e.g., South B, Karen, Kasarani"
                        className="mt-1"
                        {...form.register("deliveryArea")}
                      />
                      {form.formState.errors.deliveryArea && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.deliveryArea.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="deliveryPhone">Recipient Phone</Label>
                      <Input
                        id="deliveryPhone"
                        placeholder="+254 7XX XXX XXX"
                        className="mt-1"
                        {...form.register("deliveryPhone")}
                      />
                      {form.formState.errors.deliveryPhone && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.deliveryPhone.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="deliveryInstructions">Instructions (Optional)</Label>
                      <Textarea
                        id="deliveryInstructions"
                        placeholder="Gate code, floor number, landmarks..."
                        className="mt-1"
                        rows={2}
                        {...form.register("deliveryInstructions")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Package Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                      Package Details
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Tell us about what you're sending
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="packageDescription">Package Description</Label>
                      <Textarea
                        id="packageDescription"
                        placeholder="Describe your package (e.g., documents, food, electronics...)"
                        className="mt-1"
                        rows={3}
                        {...form.register("packageDescription")}
                      />
                      {form.formState.errors.packageDescription && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.packageDescription.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Package Size</Label>
                      <RadioGroup
                        value={form.watch("packageSize")}
                        onValueChange={(value) => form.setValue("packageSize", value)}
                        className="grid grid-cols-2 gap-3 mt-2"
                      >
                        {[
                          { value: "small", label: "Small", desc: "Fits in a backpack", extra: "+KES 0" },
                          { value: "medium", label: "Medium", desc: "Fits in a car seat", extra: "+KES 100" },
                          { value: "large", label: "Large", desc: "Needs trunk space", extra: "+KES 200" },
                          { value: "extra-large", label: "Extra Large", desc: "Requires van/pickup", extra: "+KES 350" },
                        ].map((size) => (
                          <Label
                            key={size.value}
                            htmlFor={size.value}
                            className={cn(
                              "flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all",
                              form.watch("packageSize") === size.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <RadioGroupItem value={size.value} id={size.value} className="sr-only" />
                            <span className="font-semibold text-foreground">{size.label}</span>
                            <span className="text-xs text-muted-foreground">{size.desc}</span>
                            <span className="text-xs text-primary mt-1">{size.extra}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                      {form.formState.errors.packageSize && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.packageSize.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="packageValue">Estimated Value (Optional)</Label>
                      <Input
                        id="packageValue"
                        placeholder="KES"
                        className="mt-1"
                        {...form.register("packageValue")}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        For insurance purposes on high-value items
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Scheduling */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                      Schedule Delivery
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      When do you want us to pick up?
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Pickup Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !form.watch("scheduledDate") && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {form.watch("scheduledDate") ? (
                              format(form.watch("scheduledDate"), "PPP")
                            ) : (
                              <span>Select a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={form.watch("scheduledDate")}
                            onSelect={(date) => date && form.setValue("scheduledDate", date)}
                            disabled={(date) =>
                              date < new Date() || date > addDays(new Date(), 30)
                            }
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {form.formState.errors.scheduledDate && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.scheduledDate.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Preferred Time Slot</Label>
                      <Select
                        value={form.watch("scheduledTime")}
                        onValueChange={(value) => form.setValue("scheduledTime", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.scheduledTime && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.scheduledTime.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Confirmation */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                      Order Summary
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Review your order details before confirming
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Service */}
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                      <Package className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Service</p>
                        <p className="font-semibold text-foreground capitalize">
                          {services.find(s => s.id === form.watch("service"))?.name}
                        </p>
                      </div>
                    </div>

                    {/* Pickup */}
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                      <MapPin className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pickup</p>
                        <p className="font-semibold text-foreground">{form.watch("pickupAddress")}</p>
                        <p className="text-sm text-muted-foreground">{form.watch("pickupArea")}</p>
                        <p className="text-sm text-muted-foreground">{form.watch("pickupPhone")}</p>
                      </div>
                    </div>

                    {/* Delivery */}
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                      <Truck className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery</p>
                        <p className="font-semibold text-foreground">{form.watch("deliveryAddress")}</p>
                        <p className="text-sm text-muted-foreground">{form.watch("deliveryArea")}</p>
                        <p className="text-sm text-muted-foreground">{form.watch("deliveryPhone")}</p>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                      <Clock className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Schedule</p>
                        <p className="font-semibold text-foreground">
                          {form.watch("scheduledDate") && format(form.watch("scheduledDate"), "EEEE, MMMM d, yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground">{form.watch("scheduledTime")}</p>
                      </div>
                    </div>

                    {/* Package */}
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                      <Package className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Package</p>
                        <p className="font-semibold text-foreground">{form.watch("packageDescription")}</p>
                        <p className="text-sm text-muted-foreground capitalize">Size: {form.watch("packageSize")}</p>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-foreground">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">
                          KES {calculatePrice().toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Payment on delivery (Cash or M-Pesa)
                      </p>
                    </div>
                  </div>

                  {!user && (
                    <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <User className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Create an account?</p>
                        <p className="text-sm text-muted-foreground">
                          Sign up to save addresses and track all your orders.{" "}
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary"
                            onClick={() => navigate("/auth")}
                          >
                            Sign up now
                          </Button>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {currentStep < 6 ? (
                  <Button type="button" variant="hero" onClick={nextStep}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="hero"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Order
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
