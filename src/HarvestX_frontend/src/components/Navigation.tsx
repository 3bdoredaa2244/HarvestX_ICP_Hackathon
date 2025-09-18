import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wheat, TrendingUp, User, Wallet } from "lucide-react";
import { useCurrentUser } from "@/hooks/useICP";
import { icpService } from "@/services/icpService";

const Navigation = () => {
  const location = useLocation();
  const { user } = useCurrentUser();

  const isActive = (path: string) => location.pathname === path;

  const isFarmer = user && 'Farmer' in user.role;
  const isInvestor = user && 'Investor' in user.role;
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Wheat className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              HarvestX
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md transition-colors ${isActive("/") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
            >
              Home
            </Link>
            <Link
              to="/create-listing"
              className={`px-3 py-2 rounded-md transition-colors ${isActive("/create-listing") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
            >
              List Crop
            </Link>
            <Link
              to="/marketplace"
              className={`px-3 py-2 rounded-md transition-colors ${isActive("/marketplace") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
            >
              Marketplace
            </Link>
            <Link
              to="/investor-dashboard"
              className={`px-3 py-2 rounded-md transition-colors ${isActive("/investor-dashboard") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
            >
              Invest
            </Link>
            <Link
              to="/farmer-dashboard"
              className={`px-3 py-2 rounded-md transition-colors ${isActive("/farmer-dashboard") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
            >
              My Farm
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button variant="accent" size="sm">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;