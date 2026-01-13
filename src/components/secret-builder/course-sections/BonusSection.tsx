import React from 'react';
import { Gift, Plus, FileText, Video, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Bonus {
  title: string;
  description: string;
  value?: string;
  icon?: 'gift' | 'file' | 'video' | 'download';
}

interface BonusSectionProps {
  bonuses?: Bonus[];
  onAdd?: () => void;
}

const PLACEHOLDER_BONUSES: Bonus[] = [
  {
    title: 'Bonus Resource',
    description: 'Add a description of this bonus material',
    value: '$97 Value',
    icon: 'gift',
  },
];

const ICON_MAP = {
  gift: Gift,
  file: FileText,
  video: Video,
  download: Download,
};

export function BonusSection({
  bonuses = PLACEHOLDER_BONUSES,
  onAdd,
}: BonusSectionProps) {
  const displayBonuses = bonuses.length > 0 ? bonuses : PLACEHOLDER_BONUSES;

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium mb-4">
            <Gift className="w-4 h-4" />
            Exclusive Bonuses
          </span>
          <h2 className="text-2xl font-bold text-amber-100">
            Plus These Bonus Materials
          </h2>
        </div>

        <div className="space-y-4">
          {displayBonuses.map((bonus, index) => {
            const IconComponent = ICON_MAP[bonus.icon || 'gift'];
            return (
              <div
                key={index}
                className="flex items-start gap-4 bg-card/50 rounded-xl p-5 border border-amber-500/20"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-amber-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold mb-1">{bonus.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {bonus.description}
                      </p>
                    </div>
                    {bonus.value && (
                      <span className="flex-shrink-0 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium">
                        {bonus.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {onAdd && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={onAdd}
              className="border-amber-500/30 text-amber-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bonus
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
