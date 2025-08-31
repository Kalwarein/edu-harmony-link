import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, User, ArrowRight, Loader2, Star, BookOpen, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingFlowProps {
  onComplete: (userData: any) => void;
}

const avatarOptions = [
  { id: 1, emoji: "👨‍🎓", label: "Student" },
  { id: 2, emoji: "👩‍🎓", label: "Scholar" }, 
  { id: 3, emoji: "👨‍🏫", label: "Leader" },
  { id: 4, emoji: "👩‍🏫", label: "Teacher" },
  { id: 5, emoji: "🧑‍💼", label: "Professional" },
  { id: 6, emoji: "👨‍💻", label: "Innovator" },
  { id: 7, emoji: "👩‍🔬", label: "Researcher" },
  { id: 8, emoji: "🎨", label: "Creative" },
];

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<null | typeof avatarOptions[0]>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2 && firstName && lastName) {
      setStep(3);
    } else if (step === 3) {
      handleProfileGeneration();
    }
  };

  const handleProfileGeneration = async () => {
    setIsSpinning(true);
    
    // Simulate spinning animation
    setTimeout(() => {
      const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
      setSelectedAvatar(randomAvatar);
      setIsSpinning(false);
      setStep(4);
    }, 3000);
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Create user profile in Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          user_id: crypto.randomUUID(), // Temporary ID for demo
          first_name: firstName,
          last_name: lastName,
          referred_by: referredBy,
          avatar_url: selectedAvatar?.emoji,
          role: 'student'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Welcome to Sheikh Tais Academy!",
        description: "Your profile has been created successfully.",
      });

      onComplete({
        ...profile,
        name: `${firstName} ${lastName}`,
        avatar: selectedAvatar?.emoji
      });
    } catch (error) {
      toast({
        title: "Welcome to Sheikh Tais Academy!",
        description: "Starting your academy experience...",
      });
      
      // Continue with demo data even if DB fails
      onComplete({
        name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        referred_by: referredBy,
        avatar: selectedAvatar?.emoji,
        role: 'student'
      });
    }
    
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-primary to-secondary w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl animate-pulse">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                Welcome to Sheikh Tais Academy
              </h1>
              <p className="text-muted-foreground text-lg">
                Excellence in Education, Character in Leadership
              </p>
            </div>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary" />
                <span>Academic Excellence</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Innovative Learning</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                <span>Strong Community</span>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Let's Get to Know You</h2>
              <p className="text-muted-foreground mt-2">
                Help us personalize your academy experience
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="referredBy">Who referred you to Sheikh Tais Academy?</Label>
                <Input
                  id="referredBy"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  placeholder="Enter the name of who referred you (optional)"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Generating Your Profile</h2>
            <p className="text-muted-foreground">
              We're creating a unique profile just for you...
            </p>
            
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div 
                className={`absolute inset-0 border-4 border-primary rounded-full transition-all duration-1000 ${
                  isSpinning ? 'animate-spin border-t-transparent' : ''
                }`}
              ></div>
              <div className="absolute inset-4 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                {isSpinning ? (
                  <div className="grid grid-cols-2 gap-1">
                    {avatarOptions.slice(0, 4).map((avatar, index) => (
                      <div 
                        key={avatar.id} 
                        className={`text-2xl transition-all duration-300 ${
                          isSpinning ? 'animate-bounce' : ''
                        }`}
                        style={{ 
                          animationDelay: `${index * 0.2}s`,
                          animationDuration: '0.6s'
                        }}
                      >
                        {avatar.emoji}
                      </div>
                    ))}
                  </div>
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            
            {isSpinning && (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-xl">
                <span className="text-4xl">{selectedAvatar?.emoji}</span>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-foreground">Perfect Match!</h2>
                <p className="text-muted-foreground">
                  You've been assigned the <strong>{selectedAvatar?.label}</strong> profile
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p><strong>Name:</strong> {firstName} {lastName}</p>
                {referredBy && <p><strong>Referred by:</strong> {referredBy}</p>}
                <p><strong>Profile Type:</strong> {selectedAvatar?.label}</p>
                <p><strong>Academy ID:</strong> ST{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step >= i ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between">
            {step > 1 && step < 4 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="border-primary/20"
              >
                Back
              </Button>
            )}
            
            <div className="ml-auto">
              {step < 3 && (
                <Button 
                  onClick={handleNext}
                  disabled={step === 2 && (!firstName || !lastName)}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {step === 1 ? "Get Started" : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              {step === 3 && !isSpinning && (
                <Button 
                  onClick={handleNext}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  Generate Profile
                </Button>
              )}
              
              {step === 4 && (
                <Button 
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Entering Academy...
                    </>
                  ) : (
                    <>
                      Enter Academy
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};