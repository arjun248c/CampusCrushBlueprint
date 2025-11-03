import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trophy, Star, TrendingUp, Award, Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: "",
    bio: "",
    profileImage: null as File | null,
  });

  // Fetch full user profile
  const { data: profile } = useQuery<User>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch recent activity
  const { data: recentActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ["/api/recent-activity"],
    queryFn: async () => {
      const response = await fetch("/api/recent-activity?limit=10");
      if (!response.ok) throw new Error("Failed to fetch recent activity");
      const data = await response.json();
      console.log('Recent activity:', data);
      return data;
    },
    enabled: !!user,
  });

  // Update edit data when profile loads
  useEffect(() => {
    if (profile) {
      setEditData({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        profileImage: null,
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: typeof editData) => {
      const formData = new FormData();
      formData.append("displayName", data.displayName);
      formData.append("bio", data.bio);
      if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
      }
      
      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      setEditData({ ...editData, profileImage: null });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const displayName = profile.displayName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Anonymous";
  const averageScore = profile.averageScore ? Number(profile.averageScore).toFixed(1) : "N/A";

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={editData.profileImage ? URL.createObjectURL(editData.profileImage) : (profile.profileImageUrl || "https://via.placeholder.com/128")}
              alt={displayName}
              className="size-32 rounded-full object-cover border-4 border-white shadow-xl"
              data-testid="profile-image"
            />
            {isEditing && (
              <Label htmlFor="profile-image-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="size-6 text-white" />
                <Input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditData({ ...editData, profileImage: file });
                    }
                  }}
                />
              </Label>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="display-name" className="text-white/80">Display Name</Label>
                  <Input
                    id="display-name"
                    value={editData.displayName}
                    onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter display name"
                  />
                </div>
                <div>
                  <Label htmlFor="bio" className="text-white/80">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Tell others about yourself..."
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold font-display mb-2" data-testid="profile-name">
                  {displayName}
                </h1>
                {profile.bio && (
                  <p className="text-white/90 mb-4" data-testid="profile-bio">{profile.bio}</p>
                )}
              </>
            )}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
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
          {!isEditing ? (
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setIsEditing(true)}
              data-testid="button-edit-profile"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    displayName: profile?.displayName || "",
                    bio: profile?.bio || "",
                    profileImage: null,
                  });
                }}
                disabled={updateProfile.isPending}
              >
                <X className="size-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="bg-white text-purple-600 hover:bg-white/90"
                onClick={() => updateProfile.mutate(editData)}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
        <h2 className="text-2xl font-bold font-display mb-4">Recent Ratings</h2>
        {activityLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Loading...</p>
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <img
                  src={activity.targetUser?.profileImageUrl || "https://via.placeholder.com/48"}
                  alt={activity.targetUser?.displayName || "User"}
                  className="size-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{activity.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">★ {activity.score}/10</div>
                  <div className="text-xs text-muted-foreground">Rating Given</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No recent ratings given</p>
            <p className="text-xs mt-1">Rate some profiles to see activity here</p>
          </div>
        )}
      </div>
    </div>
  );
}
