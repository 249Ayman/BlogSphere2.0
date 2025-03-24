import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import DashboardPage from "@/pages/dashboard-page";
import PostsPage from "@/pages/posts-page";
import NewPostPage from "@/pages/new-post-page";
import AnalyticsPage from "@/pages/analytics-page";
import CommentsPage from "@/pages/comments-page";
import SettingsPage from "@/pages/settings-page";
import AllPostsPage from "@/pages/all-posts-page";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={HomePage} />
      <Route path="/posts/explore" component={AllPostsPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/posts" component={PostsPage} />
      <ProtectedRoute path="/new-post" component={NewPostPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/comments" component={CommentsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
