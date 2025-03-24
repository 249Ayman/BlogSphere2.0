import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, Home, PieChart } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="w-full bg-background z-10 border-b py-3">
      <div className="container px-4 mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text cursor-pointer">
              BlogSphere
            </span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/">
            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Home</span>
          </Link>
          <Link href="/posts/explore">
            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Explore</span>
          </Link>
          {user ? (
            <>
              <Link href="/dashboard">
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Dashboard</span>
              </Link>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                Log out
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button>Sign in</Button>
            </Link>
          )}
        </nav>

        <div className="flex md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/">
                  <div className="flex items-center w-full cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/posts/explore">
                  <div className="flex items-center w-full cursor-pointer">
                    <span className="mr-2">🔍</span>
                    Explore
                  </div>
                </Link>
              </DropdownMenuItem>
              
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <div className="flex items-center w-full cursor-pointer">
                        <PieChart className="mr-2 h-4 w-4" />
                        Dashboard
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/auth">
                    <div className="flex items-center w-full cursor-pointer">Sign in</div>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}