import { Trophy, Crown, Medal, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Leaderboard as LeaderboardType, User } from "@shared/schema";

interface LeaderboardEntry extends LeaderboardType {
  user?: User;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
}

export default function Leaderboard({ entries, title = "Weekly Leaderboard" }: LeaderboardProps) {
  const { user } = useAuth();
  const topThree = entries.slice(0, 3);
  const restOfList = entries.slice(3, 10);
  
  // Check if current user is in top 10
  const userInTop10 = entries.some(entry => entry.userId === user?.id);

  const getUserDisplayName = (user?: User) => {
    if (!user) return "Anonymous";
    return user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous";
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display flex items-center gap-3">
          <Trophy className="size-8 text-primary" />
          {title}
          {!userInTop10 && user && (
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-5 text-muted-foreground hover:text-primary cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>You were very close! Let's try again next week</p>
              </TooltipContent>
            </Tooltip>
          )}
        </h2>
        <p className="text-muted-foreground mt-2">Top performers this week</p>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Rank 2 */}
          {topThree[1] && (
            <div className="flex flex-col items-center pt-12" data-testid="leaderboard-rank-2">
              <Medal className="size-6 text-gray-400 mb-2" />
              <div className="relative">
                <img
                  src={topThree[1].user?.profileImageUrl || "https://via.placeholder.com/80"}
                  alt={getUserDisplayName(topThree[1].user)}
                  className="size-16 rounded-full object-cover border-4 border-gray-300"
                />
              </div>
              <div className="mt-3 text-center">
                <div className="text-lg font-semibold">{getUserDisplayName(topThree[1].user)}</div>
                <div className="text-2xl font-bold font-display text-primary">
                  {Number(topThree[1].averageScore).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {topThree[1].totalRatings} ratings
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 */}
          {topThree[0] && (
            <div className="flex flex-col items-center" data-testid="leaderboard-rank-1">
              <Crown className="size-8 text-yellow-500 mb-2" />
              <div className="relative">
                <img
                  src={topThree[0].user?.profileImageUrl || "https://via.placeholder.com/100"}
                  alt={getUserDisplayName(topThree[0].user)}
                  className="size-24 rounded-full object-cover border-4 border-yellow-500 ring-4 ring-yellow-500/20"
                />
              </div>
              <div className="mt-3 text-center">
                <div className="text-xl font-bold">{getUserDisplayName(topThree[0].user)}</div>
                <div className="text-4xl font-bold font-display bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {Number(topThree[0].averageScore).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {topThree[0].totalRatings} ratings
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {topThree[2] && (
            <div className="flex flex-col items-center pt-16" data-testid="leaderboard-rank-3">
              <Medal className="size-6 text-amber-700 mb-2" />
              <div className="relative">
                <img
                  src={topThree[2].user?.profileImageUrl || "https://via.placeholder.com/80"}
                  alt={getUserDisplayName(topThree[2].user)}
                  className="size-16 rounded-full object-cover border-4 border-amber-700"
                />
              </div>
              <div className="mt-3 text-center">
                <div className="text-lg font-semibold">{getUserDisplayName(topThree[2].user)}</div>
                <div className="text-2xl font-bold font-display text-primary">
                  {Number(topThree[2].averageScore).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {topThree[2].totalRatings} ratings
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rest of Top 10 */}
      {restOfList.length > 0 && (
        <div className="bg-card rounded-2xl border border-card-border overflow-hidden">
          {restOfList.map((entry, idx) => (
            <div
              key={entry.id}
              className="flex items-center py-4 px-6 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              data-testid={`leaderboard-rank-${entry.rank}`}
            >
              <span className="text-3xl font-bold font-display text-muted-foreground w-16">
                #{entry.rank}
              </span>
              <img
                src={entry.user?.profileImageUrl || "https://via.placeholder.com/48"}
                alt={getUserDisplayName(entry.user)}
                className="size-12 rounded-full object-cover mx-4"
              />
              <div className="flex-1">
                <p className="font-semibold">{getUserDisplayName(entry.user)}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.totalRatings} ratings
                </p>
              </div>
              <span className="text-2xl font-bold font-display text-primary">
                {Number(entry.averageScore).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="size-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No leaderboard data yet</p>
          <p className="text-sm">Start rating to see who ranks this week!</p>
        </div>
      )}
    </div>
  );
}
