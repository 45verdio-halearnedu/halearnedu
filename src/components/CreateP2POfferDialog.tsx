import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CreateP2POfferDialogProps {
  existingListings?: any[];
  onCreated?: () => void;
}

const assets = ["USDT", "USDC", "ETH", "BTC"];
const currencies = ["USD", "KES", "NGN"];
const paymentMethods = ["M-Pesa", "Bank Transfer", "Cash", "Mobile Money"];

export const CreateP2POfferDialog: React.FC<CreateP2POfferDialogProps> = ({ existingListings = [], onCreated }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Prevent duplicate active listing (by type/asset/currency)
  const duplicate = existingListings?.some(
    (l) => l.user_id === user?.id && l.is_active && l.type === type && l.asset === asset && l.currency === currency
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Not signed in", description: "Please sign in to create an offer.", variant: "destructive" });
      return;
    }
    if (duplicate) {
      toast({ title: "Duplicate Offer", description: "You already have an active offer for this config.", variant: "destructive" });
      return;
    }
    if (!amount || !price || !asset || !currency || !paymentMethod) {
      toast({ title: "Required fields missing", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("p2p_listings")
      .insert([{
        user_id: user.id,
        type,
        asset,
        amount: Number(amount),
        price_per_unit: Number(price),
        currency,
        payment_method: paymentMethod,
        description,
        is_active: true,
      }]);
    setLoading(false);
    if (error) {
      toast({ title: "Failed to create offer", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Offer posted!", description: "Your offer is now live." });
      setOpen(false);
      setAmount("");
      setPrice("");
      setDescription("");
      if (onCreated) onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full md:w-auto">Create Offer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new P2P Offer</DialogTitle>
          <DialogDescription>
            Post a buy/sell offer for others to trade with you. Escrow and chat will protect your trades.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "buy" | "sell")}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Asset</Label>
              <Select value={asset} onValueChange={setAsset}>
                <SelectTrigger>
                  <SelectValue placeholder="Asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Amount</Label>
              <Input type="number" min={0.01} step={0.01} required placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label>Price per unit</Label>
              <Input type="number" min={0.01} step={0.01} required placeholder="Price per unit" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => <SelectItem key={pm} value={pm}>{pm}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea placeholder="Add a note visible to traders..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" loading={loading} disabled={loading || duplicate}>
              {duplicate ? "You already have an active offer" : "Create Offer"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="w-full">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
