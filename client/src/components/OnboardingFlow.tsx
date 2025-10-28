import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { College } from "@shared/schema";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    collegeId: "",
    gender: "",
    displayName: "",
    bio: "",
  });

  // Fetch colleges
  const { data: colleges = [] } = useQuery<College[]>({
    queryKey: ["/api/colleges"],
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/profile/setup", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Complete!",
        description: "Welcome to Campus Crush",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onComplete();
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
        description: error.message || "Failed to complete setup",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step === 1 && !formData.collegeId) {
      toast({
        title: "College Required",
        description: "Please select your college",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !formData.gender) {
      toast({
        title: "Gender Required",
        description: "Please select your gender",
        variant: "destructive",
      });
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      updateProfile.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-card-border p-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-gradient-to-r from-purple-600 to-pink-600" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: College Selection */}
        {step === 1 && (
          <div className="space-y-6" data-testid="onboarding-step-1">
            <div className="text-center mb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="size-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-display mb-2">Select Your College</h2>
              <p className="text-muted-foreground">
                Only verified students from your college can participate
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">College / University</Label>
              <Select
                value={formData.collegeId}
                onValueChange={(value) => setFormData({ ...formData, collegeId: value })}
              >
                <SelectTrigger id="college" className="h-12" data-testid="select-college">
                  <SelectValue placeholder="Select your college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Gender Selection */}
        {step === 2 && (
          <div className="space-y-6" data-testid="onboarding-step-2">
            <div className="text-center mb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="size-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-display mb-2">Select Your Gender</h2>
              <p className="text-muted-foreground">
                You'll only rate students of the opposite gender
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {["male", "female", "other"].map((gender) => (
                <button
                  key={gender}
                  onClick={() => setFormData({ ...formData, gender })}
                  className={`
                    h-24 rounded-xl border-2 flex items-center justify-center font-semibold capitalize transition-all
                    ${
                      formData.gender === gender
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }
                  `}
                  data-testid={`button-gender-${gender}`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Profile Details */}
        {step === 3 && (
          <div className="space-y-6" data-testid="onboarding-step-3">
            <div className="text-center mb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="size-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-display mb-2">Complete Your Profile</h2>
              <p className="text-muted-foreground">
                Add a display name and bio (optional)
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name (Optional)</Label>
                <Input
                  id="displayName"
                  placeholder="How should we call you?"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="h-12"
                  data-testid="input-display-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  data-testid="input-bio"
                />
                <p className="text-xs text-muted-foreground">
                  Keep it friendly and appropriate!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1 h-12"
              disabled={updateProfile.isPending}
              data-testid="button-back"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
            disabled={updateProfile.isPending}
            data-testid="button-next"
          >
            {step === 3 ? (updateProfile.isPending ? "Completing..." : "Complete Setup") : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
