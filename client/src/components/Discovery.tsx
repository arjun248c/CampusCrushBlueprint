import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RefreshCw, Heart, CheckCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";

interface SwipeableProfileProps {
  user: User;
  onRate: (score: number) => void;
}

function SwipeableProfile({ user, onRate }: SwipeableProfileProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [showRatingOverlay, setShowRatingOverlay] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const displayName = user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous";

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;
    setDragX(deltaX);
    
    if (Math.abs(deltaX) > 50) {
      setShowRatingOverlay(true);
      const rating = Math.min(10, Math.max(1, Math.ceil((Math.abs(deltaX) - 50) / 30) + 1));
      setSelectedRating(rating);
    } else {
      setShowRatingOverlay(false);
      setSelectedRating(0);
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(dragX) > 100 && selectedRating > 0) {
      onRate(selectedRating);
    }
    setIsDragging(false);
    setDragX(0);
    setShowRatingOverlay(false);
    setSelectedRating(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX.current;
        setDragX(deltaX);
        
        if (Math.abs(deltaX) > 50) {
          setShowRatingOverlay(true);
          const rating = Math.min(10, Math.max(1, Math.ceil((Math.abs(deltaX) - 50) / 30) + 1));
          setSelectedRating(rating);
        } else {
          setShowRatingOverlay(false);
          setSelectedRating(0);
        }
      };

      const handleGlobalMouseUp = () => {
        if (Math.abs(dragX) > 100 && selectedRating > 0) {
          onRate(selectedRating);
        }
        setIsDragging(false);
        setDragX(0);
        setShowRatingOverlay(false);
        setSelectedRating(0);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragX, selectedRating, onRate]);

  return (
    <div className="w-full max-w-sm mx-auto mb-4 relative">
      <div
        ref={cardRef}
        className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translateX(${dragX}px) rotate(${dragX * 0.1}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        data-testid={`swipeable-profile-${user.id}`}
      >
        <img
          src={user.profileImageUrl || "https://via.placeholder.com/400x600"}
          alt={displayName}
          className="w-full h-full object-cover"
          draggable={false}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {user.verificationStatus === "verified" && (
          <div className="absolute top-4 right-4 size-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg">
            <CheckCircle className="size-5" />
          </div>
        )}

        {showRatingOverlay && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{selectedRating}</div>
              <div className="text-sm text-gray-700">Release to rate</div>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl font-semibold mb-1">
            {displayName}
          </h3>
          {user.bio && (
            <p className="text-sm text-white/80 mb-3 line-clamp-2">{user.bio}</p>
          )}
          {user.averageScore && (
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                ⭐ {Number(user.averageScore).toFixed(1)}
              </div>
              {user.ratingsReceived! > 0 && (
                <div className="text-xs text-white/70">
                  {user.ratingsReceived} ratings
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs text-white/60 text-center mt-2">
            ← Swipe to rate 1-10 →
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Discovery() {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  const { data: profiles = [], isLoading, refetch } = useQuery<User[]>({
    queryKey: isSearchMode ? ["/api/profiles/search", searchQuery] : ["/api/profiles/random"],
    queryFn: () => {
      if (isSearchMode && searchQuery.trim()) {
        return apiRequest("GET", `/api/profiles/search?q=${encodeURIComponent(searchQuery.trim())}&limit=20`);
      }
      return apiRequest("GET", "/api/profiles/random");
    },
    enabled: !isSearchMode || (isSearchMode && searchQuery.trim().length >= 2),
  });

  const submitRating = useMutation({
    mutationFn: async ({ targetUserId, score }: { targetUserId: string; score: number }) => {
      await apiRequest("POST", "/api/ratings", { targetUserId, score });
    },
    onSuccess: () => {
      toast({
        title: "Rating Submitted!",
        description: "Your anonymous rating has been recorded.",
      });
      setCurrentIndex(prev => prev + 1);
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

  const handleRate = (score: number) => {
    const currentProfile = profiles[currentIndex];
    if (currentProfile) {
      submitRating.mutate({ targetUserId: currentProfile.id, score });
    }
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    refetch();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentIndex(0);
    if (query.trim().length >= 2) {
      setIsSearchMode(true);
    } else if (query.trim().length === 0) {
      setIsSearchMode(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setCurrentIndex(0);
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

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="w-full max-w-md mx-auto px-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        
        <div className="text-center py-24">
          <Heart className="size-16 mx-auto mb-4 text-muted-foreground/20" />
          <h3 className="text-2xl font-bold mb-2">
            {isSearchMode 
              ? "No Search Results" 
              : profiles.length === 0 
                ? "No Profiles Available" 
                : "All Done!"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {isSearchMode 
              ? "Try searching with a different name or clear the search to browse all profiles." 
              : profiles.length === 0 
                ? "Check back later for more profiles to rate!" 
                : "You've rated all available profiles. Check back later for more!"}
          </p>
          <Button
            onClick={isSearchMode ? clearSearch : handleRefresh}
            variant="outline"
            data-testid="button-refresh-profiles"
          >
            <RefreshCw className="size-4 mr-2" />
            {isSearchMode ? "Clear Search" : "Refresh"}
          </Button>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const remainingCount = profiles.length - currentIndex;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold font-display mb-2">Discover</h2>
        <p className="text-muted-foreground">
          {isSearchMode ? `${remainingCount} search results` : `${remainingCount} profiles remaining`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <SwipeableProfile
        user={currentProfile}
        onRate={handleRate}
      />

      <div className="flex justify-center mt-4">
        <div className="bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground">
          {currentIndex + 1} of {profiles.length}
        </div>
      </div>

      <div className="text-center mt-6">
        <Button
          onClick={isSearchMode ? clearSearch : handleRefresh}
          variant="outline"
          size="sm"
          data-testid="button-refresh-profiles"
        >
          <RefreshCw className="size-4 mr-2" />
          {isSearchMode ? "Clear Search" : "Get New Profiles"}
        </Button>
      </div>
    </div>
  );
}