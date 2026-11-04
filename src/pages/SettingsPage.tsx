import { PageHeader } from "@/components/common/PageHeader";
import { AccountCard } from "@/features/settings/components/AccountCard";
import { AppearanceCard } from "@/features/settings/components/AppearanceCard";
import { DemoApiCard } from "@/features/settings/components/DemoApiCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { MOCKS_ENABLED } from "@/mocks/enabled";

export default function SettingsPage() {
  useDocumentTitle("Settings");

  return (
    <>
      <PageHeader title="Settings" description="Your account, the look of the app and the demo API." />
      <div className="max-w-3xl space-y-6">
        <AccountCard />
        <AppearanceCard />
        {MOCKS_ENABLED && <DemoApiCard />}
      </div>
    </>
  );
}
