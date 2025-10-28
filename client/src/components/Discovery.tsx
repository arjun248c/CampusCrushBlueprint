import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RefreshCw, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import ProfileCard from "./ProfileCard";
import RatingInterface from "./RatingInterface";
import type { User } from "@shared/schema";

export default function Discovery() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch random profiles
  const { data: profiles = [], isLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/profiles/random"],
  });

  // Submit rating mutation
  const submitRating = useMutation({
    mutationFn: async ({ targetUserId, score }: { targetUserId: string; score: number }) => {
      await apiRequest("POST", "/api/ratings", { targetUserId, score });
    },
    onSuccess: () => {
      toast({
        title: "Rating Submitted!",
        description: "Your anonymous rating has been recorded.",
      });
      setSelectedUser(null);
      // Refresh profiles and leaderboard
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/random"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  const handleRate = (userId: string) => {
    const user = profiles.find((p) => p.id === userId);
    if (user) {
      setSelectedUser(user);
    }
  };

  const handleSubmitRating = (score: number) => {
    if (selectedUser) {
      submitRating.mutate({ targetUserId: selectedUser.id, score });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <RefreshCw className="size-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Finding profiles for you...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-24">
        <Heart className="size-16 mx-auto mb-4 text-muted-foreground/20" />
        <h3 className="text-2xl font-bold mb-2">No Profiles Available</h3>
        <p className="text-muted-foreground mb-6">
          Check back later for more profiles to rate!
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          data-testid="button-refresh-profiles"
        >
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold font-display">Discover</h2>
          <p className="text-muted-foreground mt-1">
            Rate {profiles.length} profiles from your campus
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          data-testid="button-refresh-profiles"
        >
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Profile Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            user={profile}
            onRate={handleRate}
            showRatingButton
          />
        ))}
      </div>

      {/* Rating Modal */}
      {selectedUser && (
        <RatingInterface
          user={selectedUser}
          onSubmit={handleSubmitRating}
          onClose={() => setSelectedUser(null)}
          isSubmitting={submitRating.isPending}
        />
      )}
    </div>
  );
}
