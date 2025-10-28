import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Trophy, Star, TrendingUp, Award } from "lucide-react";
import type { User } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();

  // Fetch full user profile
  const { data: profile } = useQuery<User>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const displayName = profile.displayName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Anonymous";
  const averageScore = profile.averageScore ? parseFloat(profile.averageScore).toFixed(1) : "N/A";

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={profile.profileImageUrl || "https://via.placeholder.com/128"}
            alt={displayName}
            className="size-32 rounded-full object-cover border-4 border-white shadow-xl"
            data-testid="profile-image"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold font-display mb-2" data-testid="profile-name">
              {displayName}
            </h1>
            {profile.bio && (
              <p className="text-white/90 mb-4" data-testid="profile-bio">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {profile.verificationStatus === "verified" && (
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  ✓ Verified
                </div>
              )}
              {profile.gender && (
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium capitalize">
                  {profile.gender}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            data-testid="button-edit-profile"
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl p-6 border border-card-border" data-testid="stat-average-score">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="size-5 text-primary" />
            </div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Avg Score</p>
          </div>
          <p className="text-4xl font-bold font-display text-primary">{averageScore}</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-card-border" data-testid="stat-total-ratings">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="size-5 text-primary" />
            </div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Ratings</p>
          </div>
          <p className="text-4xl font-bold font-display">{profile.ratingsReceived || 0}</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-card-border" data-testid="stat-rank">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="size-5 text-primary" />
            </div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Rank</p>
          </div>
          <p className="text-4xl font-bold font-display">--</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-card-border" data-testid="stat-achievements">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Award className="size-5 text-primary" />
            </div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Badges</p>
          </div>
          <p className="text-4xl font-bold font-display">0</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-2xl p-6 border border-card-border">
        <h2 className="text-2xl font-bold font-display mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-muted-foreground">
          <p>No recent activity</p>
        </div>
      </div>
    </div>
  );
}
