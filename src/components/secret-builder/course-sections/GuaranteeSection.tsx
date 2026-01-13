import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

interface GuaranteeSectionProps {
  title?: string;
  description?: string;
  days?: number;
}

export function GuaranteeSection({
  title = '30-Day Money-Back Guarantee',
  description = "Try the course risk-free. If you're not completely satisfied within 30 days, we'll refund your purchase—no questions asked.",
  days = 30,
}: GuaranteeSectionProps) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-8 border border-amber-500/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Shield className="w-10 h-10 text-amber-400" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-amber-100 mb-2">
                {title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {description}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>No questions asked</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Full refund</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{days} days to decide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
