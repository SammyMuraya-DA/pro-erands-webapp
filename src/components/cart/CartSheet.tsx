import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2, Tag, Loader2, Store } from "lucide-react";
import { format } from "date-fns";

export function CartSheet() {
  const { items, itemCount, subtotal, deliveryFee, total, storeName, removeItem, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [tip, setTip] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [open, setOpen] = useState(false);

  const tipOptions = [0, 50, 100, 200];
  const grandTotal = total + tip;

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: "Please sign in to checkout", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setIsCheckingOut(true);
    try {
      const orderItems = items.map((i) => ({
        menu_item_id: i.menu_item_id,
        name: i.menu_item.name,
        price: i.menu_item.price,
        quantity: i.quantity,
      }));

      const orderNumber = `PE-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        order_number: orderNumber,
        service_type: "delivery",
        pickup_address: storeName || "Store",
        delivery_address: "To be confirmed",
        store_id: items[0]?.store_id,
        items: orderItems,
        subtotal,
        delivery_fee: deliveryFee,
        rider_tip: tip,
        promo_code: promoCode || null,
        total_amount: grandTotal,
        package_description: `${itemCount} item(s) from ${storeName}`,
      });

      if (error) throw error;

      await clearCart();
      setOpen(false);
      toast({ title: "Order placed! 🎉" });
      navigate(`/track?order=${orderNumber}`);
    } catch (e) {
      toast({ title: "Failed to place order", variant: "destructive" });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
            {storeName && (
              <span className="text-sm font-normal text-muted-foreground">• {storeName}</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button variant="outline" className="mt-4" onClick={() => { setOpen(false); navigate("/stores"); }}>
                Browse Stores
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-muted/50 rounded-xl p-3">
                  {item.menu_item.image_url && (
                    <img src={item.menu_item.image_url} alt={item.menu_item.name} className="h-16 w-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{item.menu_item.name}</p>
                    <p className="text-sm text-primary font-semibold">KES {item.menu_item.price}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="flex gap-2 py-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline">Apply</Button>
            </div>

            {/* Tip */}
            <div className="py-2">
              <p className="text-sm font-medium text-foreground mb-2">Tip your rider</p>
              <div className="flex gap-2">
                {tipOptions.map((t) => (
                  <Button
                    key={t}
                    variant={tip === t ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setTip(t)}
                  >
                    {t === 0 ? "None" : `KES ${t}`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery fee</span>
                <span>{deliveryFee === 0 ? "Free" : `KES ${deliveryFee}`}</span>
              </div>
              {tip > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Rider tip</span>
                  <span>KES {tip}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>KES {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout */}
            <Button className="w-full mt-3" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Place Order • KES {grandTotal.toLocaleString()}
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
