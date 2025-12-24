import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageSquare, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function SupportSettings() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id,
          subject: subject.trim(),
          message: message.trim(),
        });

      if (error) throw error;

      setSent(true);
      setSubject('');
      setMessage('');
      toast.success('Support ticket submitted!');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Failed to submit ticket');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Contact Support</h1>
          <p className="text-muted-foreground">Get help from our team</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ticket Submitted!</h3>
            <p className="text-muted-foreground mb-4">We'll get back to you as soon as possible.</p>
            <Button onClick={() => setSent(false)}>Submit Another Ticket</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact Support</h1>
        <p className="text-muted-foreground">Get help from our team</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Submit a Ticket
          </CardTitle>
          <CardDescription>Describe your issue and we'll help you out</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={6}
                required
              />
            </div>
            <Button type="submit" disabled={sending || !subject.trim() || !message.trim()}>
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Ticket
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
