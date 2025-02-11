import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "../../../components/ui/dialog";
  import { Button } from "../../../components/ui/button";
  import { Input } from "../../../components/ui/input";
  import { Textarea } from "../../../components/ui/textarea";
  import { useState } from "react";
  import { useOffers } from "../hooks/use-offers";
  
  interface EmailModalProps {
    offerId: string;
    open: boolean;
    onClose: () => void;
  }
  
  export function EmailModal({ offerId, open, onClose }: EmailModalProps) {
    const [to, setTo] = useState<string>("");
    const [cc, setCc] = useState<string>("");
    const [subject, setSubject] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const { sendEmail, loading } = useOffers();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await sendEmail(offerId, {
          to: to.split(',').map(email => email.trim()),
          cc: cc ? cc.split(',').map(email => email.trim()) : undefined,
          subject,
          content,
        });
        onClose();
      } catch (error) {
        // Error handling is done in the hook
        console.error('Failed to send email:', error);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Offer Email</DialogTitle>
            <DialogDescription>
              Send the budgetary offer to stakeholders via email
            </DialogDescription>
          </DialogHeader>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Input
                placeholder="Enter recipient email(s), separated by commas"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium">CC</label>
              <Input
                placeholder="Enter CC email(s), separated by commas"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
              />
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="Enter email content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px]"
                required
              />
            </div>
  
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }