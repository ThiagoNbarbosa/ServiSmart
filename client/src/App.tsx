import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/dashboard";
import TeamInformation from "@/pages/team-information";
import UserManagement from "@/pages/user-management";
import Login from "@/pages/login";
import Register from "@/pages/register";
import UserProfile from "@/pages/user-profile";
import Management from "@/pages/management";
import SystemConfig from "@/pages/system-config";
import Reports from "@/pages/reports";
import HelpSupport from "@/pages/help-support";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import MaintenanceOrders from "@/pages/preventive-orders";
import WorkOrders from "@/pages/work-orders";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </>
      ) : (
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/team" component={TeamInformation} />
            <Route path="/users" component={UserManagement} />
            <Route path="/maintenance" component={MaintenanceOrders} />
            <Route path="/work-orders" component={WorkOrders} />
            <Route path="/profile" component={UserProfile} />
            <Route path="/management" component={Management} />
            <Route path="/system-config" component={SystemConfig} />
            <Route path="/reports" component={Reports} />
            <Route path="/help" component={HelpSupport} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
