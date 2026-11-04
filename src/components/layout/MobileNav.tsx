import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DemoNotice } from "./DemoNotice";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="px-4 py-5">
        <SheetTitle>Navigation</SheetTitle>
        <SheetDescription>Main sections of the app</SheetDescription>
        <Logo className="px-2" />
        <nav aria-label="Main" className="mt-8 flex-1">
          <NavLinks onNavigate={close} />
        </nav>
        <DemoNotice onNavigate={close} />
      </SheetContent>
    </Sheet>
  );
}
