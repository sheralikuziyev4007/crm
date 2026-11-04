import { DemoNotice } from "./DemoNotice";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

// Desktop navigation; on smaller screens the same links live in MobileNav
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-card/70 px-4 py-5 backdrop-blur lg:flex">
      <Logo className="px-2" />
      <nav aria-label="Main" className="mt-8 flex-1">
        <NavLinks />
      </nav>
      <DemoNotice />
    </aside>
  );
}
