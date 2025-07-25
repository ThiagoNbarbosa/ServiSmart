import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import TeamInformation from "@/pages/team-information";
import UserManagement from "@/pages/user-management";
import WorkOrders from "@/pages/work-orders";
import SimpleWorkOrders from "@/pages/simple-work-orders";
import Login from "@/pages/login";
import Register from "@/pages/register";
import UserProfile from "@/pages/user-profile";
import Management from "@/pages/management";
import SystemConfig from "@/pages/system-config";
import Reports from "@/pages/reports";
import HelpSupport from "@/pages/help-support";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/team" component={TeamInformation} />
          <Route path="/users" component={UserManagement} />
          <Route path="/work-orders" component={SimpleWorkOrders} />
          <Route path="/profile" component={UserProfile} />
          <Route path="/management" component={Management} />
          <Route path="/system-config" component={SystemConfig} />
          <Route path="/reports" component={Reports} />
          <Route path="/help" component={HelpSupport} />
        </>
      )}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
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
