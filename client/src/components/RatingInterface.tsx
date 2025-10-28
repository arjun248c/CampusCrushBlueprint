import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";

interface RatingInterfaceProps {
  user: User;
  onSubmit: (score: number) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export default function RatingInterface({ user, onSubmit, onClose, isSubmitting = false }: RatingInterfaceProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const displayName = user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous";

  const handleSubmit = () => {
    if (selectedScore !== null) {
      onSubmit(selectedScore);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4">
      <div className="bg-card rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-card-border shadow-2xl">
        {/* Header */}
        <div className="relative p-6 border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 size-10 rounded-full hover:bg-muted flex items-center justify-center"
            data-testid="button-close-rating"
            disabled={isSubmitting}
          >
            <X className="size-5" />
          </button>
          <h2 className="text-2xl font-bold font-display">Rate {displayName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your rating is completely anonymous
          </p>
        </div>

        {/* Profile Preview */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-muted/30">
            <img
              src={user.profileImageUrl || "https://via.placeholder.com/80"}
              alt={displayName}
              className="size-16 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold">{displayName}</h3>
              {user.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
              )}
            </div>
          </div>

          {/* Rating Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-4 uppercase tracking-wide">
              Select Your Rating (1-10)
            </label>
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => setSelectedScore(score)}
                  className={`
                    h-14 rounded-xl text-2xl font-bold font-display transition-all
                    ${
                      selectedScore === score
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg"
                        : "bg-muted hover:bg-muted/70 hover:scale-105"
                    }
                  `}
                  data-testid={`button-score-${score}`}
                  disabled={isSubmitting}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl text-white border-0"
            onClick={handleSubmit}
            disabled={selectedScore === null || isSubmitting}
            data-testid="button-submit-rating"
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Ratings are anonymous and cannot be traced back to you
          </p>
        </div>
      </div>
    </div>
  );
}

