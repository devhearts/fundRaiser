import { useState } from "react";
import AuthDialog from '../AuthDialog';
import { AuthProvider } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function AuthDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)}>Open Auth Dialog</Button>
        <AuthDialog open={open} onOpenChange={setOpen} />
      </div>
    </AuthProvider>
  );
}
