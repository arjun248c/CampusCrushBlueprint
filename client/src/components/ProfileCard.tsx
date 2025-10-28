import { CheckCircle } from "lucide-react";
import type { User } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  user: User;
  onRate?: (userId: string) => void;
  showRatingButton?: boolean;
}

export default function ProfileCard({ user, onRate, showRatingButton = false }: ProfileCardProps) {
  const displayName = user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous";
  
  return (
    <div
      className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow group"
      data-testid={`profile-card-${user.id}`}
    >
      {/* Profile Image */}
      <img
        src={user.profileImageUrl || "https://via.placeholder.com/400x600"}
        alt={displayName}
        className="w-full h-full object-cover"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Verification Badge */}
      {user.verificationStatus === "verified" && (
        <div className="absolute top-4 right-4 size-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg">
          <CheckCircle className="size-5" />
        </div>
      )}

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-xl font-semibold mb-1" data-testid={`profile-name-${user.id}`}>
          {displayName}
        </h3>
        {user.bio && (
          <p className="text-sm text-white/80 mb-3 line-clamp-2">{user.bio}</p>
        )}
        {user.averageScore && (
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              ⭐ {parseFloat(user.averageScore).toFixed(1)}
            </div>
            {user.ratingsReceived! > 0 && (
              <div className="text-xs text-white/70">
                {user.ratingsReceived} ratings
              </div>
            )}
          </div>
        )}

        {showRatingButton && onRate && (
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg text-white border-0"
            onClick={() => onRate(user.id)}
            data-testid={`button-rate-${user.id}`}
          >
            Rate This Profile
          </Button>
        )}
      </div>
    </div>
  );
}
