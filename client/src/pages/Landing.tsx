import { Heart, Shield, Trophy, Users, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/LoginForm";
import { RegistrationFlow } from "@/components/RegistrationFlow";
import { useState } from "react";

type ViewState = "landing" | "login" | "register";

export default function Landing() {
  const [currentView, setCurrentView] = useState<ViewState>("landing");

  if (currentView === "login") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm 
            onSuccess={() => setCurrentView("landing")} 
            onNeedAccount={() => setCurrentView("register")}
          />
        </div>
      </div>
    );
  }

  if (currentView === "register") {
    return (
      <RegistrationFlow 
        onBack={() => setCurrentView("landing")}
        onSuccess={() => setCurrentView("landing")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 max-w-4xl mx-auto leading-tight">
            Find Your Campus Crush
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Anonymous ratings. Weekly leaderboards. Real connections on your campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl text-white border-0"
              data-testid="button-get-started"
              onClick={() => setCurrentView("login")}
            >
              <Heart className="mr-2 size-5" />
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
              data-testid="button-learn-more"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold font-display text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Users,
                title: "Join Your College",
                description: "Sign up with your college email and create your anonymous profile"
              },
              {
                step: "2",
                icon: Star,
                title: "Rate & Be Rated",
                description: "Anonymously rate students from your campus on a scale of 1-10"
              },
              {
                step: "3",
                icon: Trophy,
                title: "Climb the Leaderboard",
                description: "See where you rank each week and compete for the top spot"
              }
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-2xl bg-card border border-card-border hover-elevate" data-testid={`step-${i + 1}`}>
                <div className="text-6xl font-bold font-display text-primary/10 absolute top-4 right-4">
                  {item.step}
                </div>
                <div className="relative">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4">
                    <item.icon className="size-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-6">
            Ready to Join Your Campus Community?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Sign up now and see where you rank among your peers
          </p>
          <Button
            size="lg"
            className="h-14 px-8 text-lg bg-white text-purple-600 hover:bg-white/90"
            data-testid="button-cta-signup"
            onClick={() => setCurrentView("login")}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold font-display text-lg mb-4">Campus Crush</h3>
              <p className="text-sm text-muted-foreground">
                Anonymous campus ratings and weekly leaderboards for college students.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">How It Works</a></li>
                <li><a href="#" className="hover:text-foreground">Safety</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Community Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">Report Abuse</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 Campus Crush. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
