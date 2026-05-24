import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

const KEY = "eelev_prototype_disclaimer_ack";

export function PrototypeDisclaimer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(KEY)) {
      setOpen(true);
    }
  }, []);

  const accept = () => {
    window.localStorage.setItem(KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) accept(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.95_0.04_85)] text-[oklch(0.45_0.16_60)]">
            <Info className="h-5 w-5" />
          </div>
          <DialogTitle className="font-serif text-xl">
            Prototip pentru hackathon
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            Acesta este un prototip realizat pentru un hackathon și nu reprezintă un serviciu
            oficial al Ministerului Educației și Cercetării. Toate datele afișate sunt fictive
            și au scop exclusiv demonstrativ.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={accept} className="w-full sm:w-auto">
            Am înțeles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
