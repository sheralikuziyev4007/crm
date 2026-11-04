import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useClients } from "@/features/clients/hooks";
import type { StatusKey } from "@/features/clients/types";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { NewClientsChart } from "@/features/dashboard/components/NewClientsChart";
import { PipelineSplit } from "@/features/dashboard/components/PipelineSplit";
import { RecentActivityCard } from "@/features/dashboard/components/RecentActivityCard";
import { RecentClientsCard } from "@/features/dashboard/components/RecentClientsCard";
import { StatTiles } from "@/features/dashboard/components/StatTiles";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getErrorMessage } from "@/lib/errors";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/authStore";
import { useClientFiltersStore } from "@/store/clientFiltersStore";

export default function DashboardPage() {
  useDocumentTitle("Dashboard");
  const clientsQuery = useClients();
  const firstName = useAuthStore((s) => s.user?.name.split(" ")[0]);
  const setStatus = useClientFiltersStore((s) => s.setStatus);
  const clearFilters = useClientFiltersStore((s) => s.clearFilters);
  const navigate = useNavigate();

  // A stat tile opens the client list already filtered by that stage (shared Zustand store)
  const openClients = (status: StatusKey | "all") => {
    clearFilters();
    setStatus(status);
    navigate(ROUTES.clients);
  };

  const renderContent = () => {
    if (clientsQuery.isPending) return <DashboardSkeleton />;
    if (clientsQuery.isError) {
      return (
        <ErrorState
          title="Couldn't load the dashboard"
          message={getErrorMessage(clientsQuery.error)}
          onRetry={() => void clientsQuery.refetch()}
          isRetrying={clientsQuery.isFetching}
        />
      );
    }
    const clients = clientsQuery.data;
    return (
      <div className="space-y-6">
        <StatTiles clients={clients} onSelect={openClients} />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-3">
            <NewClientsChart clients={clients} />
          </div>
          <div className="min-w-0 lg:col-span-2">
            <PipelineSplit clients={clients} />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-3">
            <RecentActivityCard />
          </div>
          <div className="min-w-0 lg:col-span-2">
            <RecentClientsCard clients={clients} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          firstName ? `Welcome back, ${firstName}. Here is your pipeline today.` : "Your pipeline today"
        }
        actions={
          <Button variant="outline" asChild>
            <Link to={ROUTES.clients}>
              View clients <ArrowRight />
            </Link>
          </Button>
        }
      />
      {renderContent()}
    </>
  );
}
