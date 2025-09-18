import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateInvestmentRequest } from "@/hooks/useICP";
import { InvestmentOffer } from "@/services/icpService";
import { toast } from "sonner";

interface InvestmentRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    offer: InvestmentOffer;
}

export function InvestmentRequestDialog({
    open,
    onOpenChange,
    offer
}: InvestmentRequestDialogProps) {
    const [message, setMessage] = useState('');
    const [offeredPrice, setOfferedPrice] = useState(offer.price_per_kg.toString());
    const [requestedQuantity, setRequestedQuantity] = useState('');

    const { createRequest, loading } = useCreateInvestmentRequest();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const quantity = BigInt(requestedQuantity);
        const minInvestment = offer.minimum_investment;
        const totalValue = Number(quantity) * parseFloat(offeredPrice);

        if (BigInt(totalValue) < minInvestment) {
            toast.error(`Minimum investment is ${Number(minInvestment)} kg worth`);
            return;
        }

        try {
            await createRequest({
                offer_id: offer.id,
                message,
                offered_price_per_kg: parseFloat(offeredPrice),
                requested_quantity: quantity,
            });

            toast.success('Investment request submitted successfully!');
            onOpenChange(false);
            setMessage('');
            setOfferedPrice(offer.price_per_kg.toString());
            setRequestedQuantity('');
        } catch (error) {
            toast.error('Failed to submit investment request');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Make Investment Request</DialogTitle>
                    <DialogDescription>
                        Submit an investment request for {offer.product_name} from {offer.location}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Requested Quantity (kg)</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={requestedQuantity}
                            onChange={(e) => setRequestedQuantity(e.target.value)}
                            placeholder="Enter quantity in kg"
                            min="1"
                            max={Number(offer.available_quantity)}
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Available: {Number(offer.available_quantity)} kg
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Offered Price per kg ($)</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={offeredPrice}
                            onChange={(e) => setOfferedPrice(e.target.value)}
                            placeholder="Price per kg"
                            min="0"
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Current price: ${offer.price_per_kg}/kg
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message to Farmer</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a personal message or questions about the crop..."
                            className="min-h-[80px]"
                            required
                        />
                    </div>

                    <div className="bg-muted p-3 rounded-lg space-y-1">
                        <p className="text-sm font-medium">Investment Summary:</p>
                        <p className="text-sm">
                            Quantity: {requestedQuantity || '0'} kg
                        </p>
                        <p className="text-sm">
                            Total Value: ${requestedQuantity && offeredPrice ?
                                (Number(requestedQuantity) * parseFloat(offeredPrice)).toFixed(2) : '0.00'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Minimum Investment: ${Number(offer.minimum_investment).toFixed(2)}
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}