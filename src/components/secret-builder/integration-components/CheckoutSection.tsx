import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

interface CheckoutSectionProps {
  title?: string;
  props?: { plans?: { name: string; price: string }[] };
}

export function CheckoutSection({ title = 'Complete Your Purchase', props }: CheckoutSectionProps) {
  const plans = props?.plans || [
    { name: 'Basic', price: '$29' },
    { name: 'Pro', price: '$59' },
    { name: 'Enterprise', price: '$99' },
  ];

  return (
    <div className="py-16 px-6 bg-background">
      <div className="max-w-2xl mx-auto text-center">
        <CreditCard className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {plans.map((plan, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <p className="font-semibold">{plan.name}</p>
              <p className="text-xl font-bold text-primary">{plan.price}</p>
            </div>
          ))}
        </div>
        <Button size="lg" className="w-full max-w-xs">
          Proceed to Checkout
        </Button>
        <p className="text-sm text-muted-foreground mt-2">Secure payment powered by Stripe</p>
      </div>
    </div>
  );
}
