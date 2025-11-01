import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GraduationCap, Mail, Users, Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { College } from "@shared/schema";

interface RegistrationFlowProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function RegistrationFlow({ onBack, onSuccess }: RegistrationFlowProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    collegeId: "",
    email: "",
    firstName: "",
    displayName: "",
    gender: "",
    profileImage: null as File | null,
  });

  const { data: colleges = [] } = useQuery<College[]>({
    queryKey: ["/api/colleges"],
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // First register the user
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
        }),
      });
      if (!registerResponse.ok) throw new Error("Registration failed");
      
      // Then setup the profile with additional data
      const formDataToSend = new FormData();
      formDataToSend.append("collegeId", data.collegeId);
      formDataToSend.append("email", data.email);
      formDataToSend.append("gender", data.gender);
      formDataToSend.append("displayName", data.displayName);
      if (data.profileImage) {
        formDataToSend.append("profileImage", data.profileImage);
      }
      
      const setupResponse = await fetch("/api/profile/setup", {
        method: "POST",
        body: formDataToSend,
      });
      if (!setupResponse.ok) throw new Error("Profile setup failed");
      
      return setupResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Complete!",
        description: "Welcome to Campus Crush",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
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
    if (step === 2 && (!formData.firstName || !formData.email || !formData.displayName)) {
      toast({
        title: "Details Required",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !formData.email.endsWith('@sggs.ac.in')) {
      toast({
        title: "Invalid Email Domain",
        description: "Please use your SGGS college email (@sggs.ac.in)",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && !formData.gender) {
      toast({
        title: "Gender Required",
        description: "Please select your gender",
        variant: "destructive",
      });
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      registerMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-card-border p-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
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
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="size-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-display mb-2">Select Your College</h2>
              <p className="text-muted-foreground">
                Choose your college to get started
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">College / University</Label>
              <Select
                value={formData.collegeId}
                onValueChange={(value) => setFormData({ ...formData, collegeId: value })}
              >
                <SelectTrigger id="college" className="h-12">
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

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="size-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-display mb-2">Personal Details</h2>
              <p className="text-muted-foreground">
                Enter your name and college email
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Your first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="How others see you"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">College Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@sggs.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Must end with @sggs.ac.in
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Gender Selection */}
        {step === 3 && (
          <div className="space-y-6">
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
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Photo Upload */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Camera className="size-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-display mb-2">Upload Your Photo</h2>
              <p className="text-muted-foreground">
                Add a profile photo to help others recognize you
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                {formData.profileImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(formData.profileImage)}
                      alt="Profile preview"
                      className="size-32 rounded-full object-cover border-4 border-primary/20"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, profileImage: null })}
                      className="absolute -top-2 -right-2 size-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="size-32 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <Camera className="size-8 text-muted-foreground/50" />
                  </div>
                )}
                
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    {formData.profileImage ? "Change Photo" : "Upload Photo"}
                  </div>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, profileImage: file });
                      }
                    }}
                  />
                </Label>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Photo upload is optional but recommended
              </p>
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
              disabled={registerMutation.isPending}
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
            disabled={registerMutation.isPending}
          >
            {step === 4 ? (registerMutation.isPending ? "Creating Account..." : "Create Account") : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}