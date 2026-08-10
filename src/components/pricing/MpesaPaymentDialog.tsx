 import { useState } from "react";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { useToast } from "@/hooks/use-toast";
 import { supabase } from "@/integrations/supabase/client";
 import { Loader2, Phone, CheckCircle2 } from "lucide-react";
 
 interface MpesaPaymentDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   plan: {
     name: string;
     price: string;
   } | null;
 }
 
 export function MpesaPaymentDialog({ open, onOpenChange, plan }: MpesaPaymentDialogProps) {
   const [phoneNumber, setPhoneNumber] = useState("");
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState(false);
   const { toast } = useToast();
 
   const extractAmount = (priceStr: string): number => {
     const match = priceStr.match(/\d+/);
     return match ? parseInt(match[0], 10) : 0;
   };
 
   const handlePayment = async () => {
     if (!phoneNumber || !plan) return;
 
     const amount = extractAmount(plan.price);
     if (amount === 0) {
       toast({
         title: "Invalid Plan",
         description: "This plan doesn't have a valid price.",
         variant: "destructive",
       });
       return;
     }
 
     setLoading(true);
     try {
       const { data, error } = await supabase.functions.invoke('initiate-mpesa-payment', {
         body: {
           phone_number: phoneNumber,
           amount: amount,
           plan_name: plan.name,
         },
       });
 
       if (error) throw error;
       if (!data.success) throw new Error(data.error);
 
       setSuccess(true);
       toast({
         title: "STK Push Sent!",
         description: "Check your phone and enter your M-Pesa PIN to complete payment.",
       });
 
       // Reset after 5 seconds
       setTimeout(() => {
         setSuccess(false);
         onOpenChange(false);
         setPhoneNumber("");
       }, 5000);
 
     } catch (error: any) {
       console.error('Payment error:', error);
       toast({
         title: "Payment Failed",
         description: error.message || "Failed to initiate M-Pesa payment. Please try again.",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <Phone className="h-5 w-5 text-primary" />
             M-Pesa Payment
           </DialogTitle>
           <DialogDescription>
             {plan && `Pay ${plan.price} for ${plan.name} subscription`}
           </DialogDescription>
         </DialogHeader>
 
         {success ? (
           <div className="flex flex-col items-center py-8 gap-4">
             <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
               <CheckCircle2 className="h-8 w-8 text-success" />
             </div>
             <div className="text-center">
               <h3 className="font-semibold text-lg">STK Push Sent!</h3>
               <p className="text-muted-foreground text-sm mt-1">
                 Check your phone and enter your M-Pesa PIN to complete payment.
               </p>
             </div>
           </div>
         ) : (
           <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label htmlFor="phone">M-Pesa Phone Number</Label>
               <Input
                 id="phone"
                 placeholder="0712345678 or 254712345678"
                 value={phoneNumber}
                 onChange={(e) => setPhoneNumber(e.target.value)}
                 disabled={loading}
               />
               <p className="text-xs text-muted-foreground">
                 Enter the phone number registered with M-Pesa
               </p>
             </div>
 
             <Button
               onClick={handlePayment}
               disabled={!phoneNumber || loading}
               className="w-full bg-[#00A650] hover:bg-[#008541] text-white"
             >
               {loading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Sending STK Push...
                 </>
               ) : (
                 <>Pay with M-Pesa</>
               )}
             </Button>
 
             <p className="text-xs text-center text-muted-foreground">
               You will receive a prompt on your phone to complete the payment
             </p>
           </div>
         )}
       </DialogContent>
     </Dialog>
   );
 }