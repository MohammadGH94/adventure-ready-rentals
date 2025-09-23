import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

type UserType = 'individual' | 'business';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userType: 'individual' as UserType,
    businessName: "",
    phone: "",
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      return;
    }

    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      user_type: formData.userType,
      phone_number: formData.phone,
      business_name: formData.userType === 'business' ? formData.businessName : null,
      // Set default location to Vancouver, BC
      city: 'Vancouver',
      state_province: 'British Columbia',
      country: 'Canada'
    };

    const { error } = await signUp(formData.email, formData.password, userData);
    if (!error) {
      navigate('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* User Type Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Let's get you started - how would you like to adventure with us?
        </label>
        <div className="grid grid-cols-1 gap-3">
          <Card 
            className={`cursor-pointer transition-all ${
              formData.userType === 'individual' 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleInputChange('userType', 'individual')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="userType"
                  checked={formData.userType === 'individual'}
                  onChange={() => handleInputChange('userType', 'individual')}
                  className="text-primary"
                />
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Adventure Seeker</div>
                    <div className="text-sm text-muted-foreground">
                      Discover gear and share your own with fellow adventurers
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              formData.userType === 'business' 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleInputChange('userType', 'business')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="userType"
                  checked={formData.userType === 'business'}
                  onChange={() => handleInputChange('userType', 'business')}
                  className="text-primary"
                />
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Gear Business</div>
                    <div className="text-sm text-muted-foreground">
                      Share your business inventory with the adventure community
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            First Name
          </label>
          <Input 
            placeholder="John" 
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Last Name
          </label>
          <Input 
            placeholder="Doe" 
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Business Name (conditional) */}
      {formData.userType === 'business' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Business Name
          </label>
          <Input 
            placeholder="Your Business Name" 
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            required
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="email"
            placeholder="your@email.com"
            className="pl-10"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Phone Number
        </label>
        <Input
          type="tel"
          placeholder="(604) 123-4567"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className="pl-10 pr-10"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Vancouver Location Notice */}
      <div className="bg-accent/20 border border-accent/30 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-sm">
          <Users className="h-4 w-4 text-accent-foreground" />
          <span className="text-accent-foreground">
            <strong>Welcome to Vancouver's adventure community!</strong> We've set you up in the Lower Mainland - 
            you can always update this later in your profile.
          </span>
        </div>
      </div>
      
      <div>
        <label className="flex items-start">
          <input 
            type="checkbox" 
            className="mr-2 mt-1"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            required
          />
          <span className="text-sm text-muted-foreground">
            I agree to the{" "}
            <a href="#" className="text-primary hover:text-primary-glow">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:text-primary-glow">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>
      
      <Button 
        type="submit" 
        variant="action" 
        className="w-full"
        disabled={loading || !formData.agreeToTerms}
      >
        {loading ? "Getting you set up..." : "Join the Adventure"}
      </Button>
    </form>
  );
};

export default SignUpForm;