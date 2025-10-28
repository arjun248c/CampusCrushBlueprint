import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Trophy, User, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Discovery from "@/components/Discovery";
import Leaderboard from "@/components/Leaderboard";
import Profile from "@/pages/Profile";
import OnboardingFlow from "@/components/OnboardingFlow";
import type { User as UserType, Leaderboard as LeaderboardType } from "@shared/schema";

type Tab = "discover" | "leaderboard" | "profile";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Check if user needs onboarding
  useEffect(() => {
    if (user && (!user.collegeId || !user.gender)) {
      setNeedsOnboarding(true);
    }
  }, [user]);

  // Fetch leaderboard data
  const { data: leaderboardData = [] } = useQuery<(LeaderboardType & { user?: UserType })[]>({
    queryKey: ["/api/leaderboard"],
    enabled: !!user && !needsOnboarding,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (needsOnboarding) {
    return <OnboardingFlow onComplete={() => setNeedsOnboarding(false)} />;
  }

  const displayName = user?.displayName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 w-full h-16 bg-background/80 backdrop-blur-lg border-b border-border z-40">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="size-6 text-primary" />
            <span className="text-xl font-bold font-display">Campus Crush</span>
          </div>

          <nav className="flex items-center gap-1">
            <Button
              variant={activeTab === "discover" ? "default" : "ghost"}
              onClick={() => setActiveTab("discover")}
              data-testid="nav-discover"
            >
              <Sparkles className="size-4 mr-2" />
              Discover
            </Button>
            <Button
              variant={activeTab === "leaderboard" ? "default" : "ghost"}
              onClick={() => setActiveTab("leaderboard")}
              data-testid="nav-leaderboard"
            >
              <Trophy className="size-4 mr-2" />
              Leaderboard
            </Button>
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              onClick={() => setActiveTab("profile")}
              data-testid="nav-profile"
            >
              <User className="size-4 mr-2" />
              Profile
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={user?.profileImageUrl || "https://via.placeholder.com/40"}
                alt={displayName}
                className="size-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{displayName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-background border-b border-border z-40">
        <div className="px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="size-6 text-primary" />
            <span className="text-lg font-bold font-display">Campus Crush</span>
          </div>
          <img
            src={user?.profileImageUrl || "https://via.placeholder.com/40"}
            alt={displayName}
            className="size-8 rounded-full object-cover"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === "discover" && <Discovery />}
          {activeTab === "leaderboard" && (
            <Leaderboard entries={leaderboardData} />
          )}
          {activeTab === "profile" && <Profile />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full h-16 bg-background border-t border-border z-40">
        <div className="h-full flex items-center justify-around px-4">
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === "discover" ? "text-primary" : "text-muted-foreground"
            }`}
            data-testid="mobile-nav-discover"
          >
            <Sparkles className="size-5" />
            <span className="text-xs font-medium">Discover</span>
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === "leaderboard" ? "text-primary" : "text-muted-foreground"
            }`}
            data-testid="mobile-nav-leaderboard"
          >
            <Trophy className="size-5" />
            <span className="text-xs font-medium">Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === "profile" ? "text-primary" : "text-muted-foreground"
            }`}
            data-testid="mobile-nav-profile"
          >
            <User className="size-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
