import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

interface SectionEditorModalProps {
  section: string | null;
  course: any;
  onSave: (updates: any) => Promise<void>;
  onClose: () => void;
}

export function SectionEditorModal({ section, course, onSave, onClose }: SectionEditorModalProps) {
  const [data, setData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!section || !course) return;
    const curriculum = course.curriculum || course;
    const landingPage = curriculum?.landing_page || curriculum?.pages?.landing || {};

    if (section === 'hero') {
      setData({
        headline: landingPage.hero_headline || curriculum?.landing_page?.hero_headline || course.title,
        subheadline: landingPage.hero_subheadline || curriculum?.landing_page?.hero_subheadline || course.description,
        ctaText: curriculum?.pages?.landing?.cta_text || 'Enroll Now',
      });
    } else if (section === 'outcomes') {
      setData({
        outcomes: [...(curriculum?.learning_outcomes || curriculum?.learningOutcomes || [])],
      });
    } else if (section === 'faq') {
      setData({
        faqs: [...(curriculum?.landing_page?.faqs || landingPage.faqs || [])],
      });
    }
  }, [section, course]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const curriculum = { ...(course.curriculum || course) };
      
      if (section === 'hero') {
        if (!curriculum.landing_page) curriculum.landing_page = {};
        curriculum.landing_page.hero_headline = data.headline;
        curriculum.landing_page.hero_subheadline = data.subheadline;
        if (!curriculum.pages) curriculum.pages = {};
        if (!curriculum.pages.landing) curriculum.pages.landing = {};
        curriculum.pages.landing.cta_text = data.ctaText;
      } else if (section === 'outcomes') {
        curriculum.learning_outcomes = data.outcomes;
        curriculum.learningOutcomes = data.outcomes;
      } else if (section === 'faq') {
        if (!curriculum.landing_page) curriculum.landing_page = {};
        curriculum.landing_page.faqs = data.faqs;
      }

      await onSave({ curriculum });
    } finally {
      setIsSaving(false);
    }
    onClose();
  };

  if (!section) return null;

  return (
    <Dialog open={!!section} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="capitalize">Edit {section}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {section === 'hero' && (
            <>
              <div>
                <Label className="text-sm text-muted-foreground">Headline</Label>
                <Input
                  value={data.headline || ''}
                  onChange={(e) => setData({ ...data, headline: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Subheadline</Label>
                <Textarea
                  value={data.subheadline || ''}
                  onChange={(e) => setData({ ...data, subheadline: e.target.value })}
                  rows={3}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Button Text</Label>
                <Input
                  value={data.ctaText || ''}
                  onChange={(e) => setData({ ...data, ctaText: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </>
          )}

          {section === 'outcomes' && (
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Learning Outcomes</Label>
              {(data.outcomes || []).map((outcome: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={outcome}
                    onChange={(e) => {
                      const newOutcomes = [...data.outcomes];
                      newOutcomes[i] = e.target.value;
                      setData({ ...data, outcomes: newOutcomes });
                    }}
                    className="bg-zinc-800 border-zinc-700"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setData({ ...data, outcomes: data.outcomes.filter((_: any, j: number) => j !== i) })}
                    className="text-red-500 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setData({ ...data, outcomes: [...(data.outcomes || []), ''] })}
                className="text-amber-500 gap-1"
              >
                <Plus className="w-3 h-3" /> Add Outcome
              </Button>
            </div>
          )}

          {section === 'faq' && (
            <div className="space-y-4">
              <Label className="text-sm text-muted-foreground">FAQs</Label>
              {(data.faqs || []).map((faq: any, i: number) => (
                <div key={i} className="space-y-2 p-3 bg-zinc-800 rounded-lg">
                  <div className="flex gap-2">
                    <Input
                      value={faq.question || ''}
                      onChange={(e) => {
                        const newFaqs = [...data.faqs];
                        newFaqs[i] = { ...faq, question: e.target.value };
                        setData({ ...data, faqs: newFaqs });
                      }}
                      placeholder="Question"
                      className="bg-zinc-900 border-zinc-700"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setData({ ...data, faqs: data.faqs.filter((_: any, j: number) => j !== i) })}
                      className="text-red-500 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={faq.answer || ''}
                    onChange={(e) => {
                      const newFaqs = [...data.faqs];
                      newFaqs[i] = { ...faq, answer: e.target.value };
                      setData({ ...data, faqs: newFaqs });
                    }}
                    placeholder="Answer"
                    rows={2}
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setData({ ...data, faqs: [...(data.faqs || []), { question: '', answer: '' }] })}
                className="text-amber-500 gap-1"
              >
                <Plus className="w-3 h-3" /> Add FAQ
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="bg-zinc-800 border-zinc-700">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-amber-500 text-black hover:bg-amber-400">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
