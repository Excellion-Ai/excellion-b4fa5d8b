import { useState, useCallback } from 'react';
import { DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PricingTabProps {
  courseId: string | undefined;
  priceCents: number | null;
  currency: string | null;
  onUpdate: (updates: { price_cents: number | null }) => void;
}

export function PricingTab({ courseId, priceCents, currency, onUpdate }: PricingTabProps) {
  const [isFree, setIsFree] = useState(!priceCents || priceCents === 0);
  const [price, setPrice] = useState(priceCents ? priceCents / 100 : 0);
  const [isSaving, setIsSaving] = useState(false);

  const priceInCents = Math.round(price * 100);
  const stripeFee = Math.round(priceInCents * 0.029) + 30;
  const excellionFee = Math.round(priceInCents * 0.02);
  const creatorReceives = priceInCents - stripeFee - excellionFee;
  const creatorPercent = priceInCents > 0 ? ((creatorReceives / priceInCents) * 100).toFixed(1) : '0';

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    const newPriceCents = isFree ? 0 : priceInCents;

    if (courseId) {
      const { error } = await supabase
        .from('courses')
        .update({ price_cents: newPriceCents })
        .eq('id', courseId);

      if (error) {
        toast.error('Failed to save pricing');
        setIsSaving(false);
        return;
      }
    }

    onUpdate({ price_cents: newPriceCents });
    toast.success('Pricing saved');
    setIsSaving(false);
  }, [courseId, isFree, priceInCents, onUpdate]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Course Pricing</h2>
      </div>

      {/* Free Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 mb-6">
        <div>
          <Label className="text-foreground font-medium">Free course</Label>
          <p className="text-sm text-muted-foreground">Anyone can enroll without paying</p>
        </div>
        <Switch
          checked={isFree}
          onCheckedChange={(checked) => {
            setIsFree(checked);
            if (checked) setPrice(0);
          }}
        />
      </div>

      {/* Price Input */}
      {!isFree && (
        <>
          <div className="mb-6">
            <Label className="text-sm text-muted-foreground mb-2 block">Price (USD)</Label>
            <div className="flex items-center gap-2">
              <span className="text-2xl text-muted-foreground">$</span>
              <Input
                type="number"
                min={1}
                step={1}
                value={price || ''}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-32 text-2xl font-semibold h-14"
                placeholder="0"
              />
            </div>
          </div>

          {/* Fee Breakdown */}
          {price > 0 && (
            <Card className="border-border bg-muted/20 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Payment Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Student pays</span>
                  <span className="text-foreground font-semibold">${price.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stripe processing (~2.9% + $0.30)</span>
                  <span className="text-destructive">-${(stripeFee / 100).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Excellion platform fee (2%)</span>
                  <span className="text-destructive">-${(excellionFee / 100).toFixed(2)}</span>
                </div>

                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-medium">You receive</span>
                    <div className="text-right">
                      <span className="text-green-400 font-bold text-lg">${(creatorReceives / 100).toFixed(2)}</span>
                      <Badge variant="outline" className="ml-2 text-xs text-muted-foreground">
                        {creatorPercent}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isSaving ? 'Saving...' : 'Save Pricing'}
      </Button>
    </div>
  );
}
