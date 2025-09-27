import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, User, Lock, Bell, CreditCard, Palette } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  profile_bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location_address: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  date_of_birth: z.string().optional(),
  business_name: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<ProfileFormData | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    email: true,
    booking_updates: true,
    messages: true,
    marketing: false,
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || user.email || '',
          phone_number: data.phone_number || '',
          profile_bio: data.profile_bio || '',
          location_address: data.location_address || '',
          city: data.city || '',
          state_province: data.state_province || '',
          country: data.country || '',
          postal_code: data.postal_code || '',
          date_of_birth: data.date_of_birth || '',
          business_name: data.business_name || '',
        });
        setProfileImage(data.profile_image_url);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (formData: ProfileFormData) => {
    if (!user || !userData) return;

    try {
      const validatedData = profileSchema.parse(formData);
      setLoading(true);

      const { error } = await supabase
        .from('users')
        .update({
          first_name: validatedData.first_name,
          last_name: validatedData.last_name,
          phone_number: validatedData.phone_number,
          profile_bio: validatedData.profile_bio,
          location_address: validatedData.location_address,
          city: validatedData.city,
          state_province: validatedData.state_province,
          country: validatedData.country,
          postal_code: validatedData.postal_code,
          date_of_birth: validatedData.date_of_birth || null,
          business_name: validatedData.business_name,
        })
        .eq('auth_user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileImage || undefined} />
                  <AvatarFallback className="text-lg">
                    {userData?.first_name?.[0]}{userData?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>

              {userData && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const profileData = Object.fromEntries(formData) as any;
                    handleProfileUpdate(profileData);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input 
                        id="first_name" 
                        name="first_name"
                        defaultValue={userData.first_name}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input 
                        id="last_name" 
                        name="last_name"
                        defaultValue={userData.last_name}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      defaultValue={userData.email}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input 
                      id="phone_number" 
                      name="phone_number"
                      defaultValue={userData.phone_number}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile_bio">Bio</Label>
                    <Textarea 
                      id="profile_bio" 
                      name="profile_bio"
                      defaultValue={userData.profile_bio}
                      placeholder="Tell others about yourself..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city"
                        defaultValue={userData.city}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state_province">State/Province</Label>
                      <Input 
                        id="state_province" 
                        name="state_province"
                        defaultValue={userData.state_province}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" 
                        name="country"
                        defaultValue={userData.country}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input 
                        id="postal_code" 
                        name="postal_code"
                        defaultValue={userData.postal_code}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name (Optional)</Label>
                    <Input 
                      id="business_name" 
                      name="business_name"
                      defaultValue={userData.business_name}
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Profile
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your password and account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const currentPassword = formData.get('current_password') as string;
                  const newPassword = formData.get('new_password') as string;
                  const confirmPassword = formData.get('confirm_password') as string;
                  
                  if (newPassword !== confirmPassword) {
                    toast({
                      title: "Error",
                      description: "Passwords do not match",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  handlePasswordChange(currentPassword, newPassword);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input 
                    id="current_password" 
                    name="current_password"
                    type="password"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input 
                    id="new_password" 
                    name="new_password"
                    type="password"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input 
                    id="confirm_password" 
                    name="confirm_password"
                    type="password"
                    required 
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about booking confirmations and updates
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.booking_updates}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, booking_updates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new messages
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.messages}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, messages: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Manage your payment methods and financial information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Payment settings will be available once you start listing gear for rent.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>
                Customize your app experience and default settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD - US Dollar</SelectItem>
                    <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="eur">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="america/new_york">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america/new_york">Eastern Time</SelectItem>
                    <SelectItem value="america/chicago">Central Time</SelectItem>
                    <SelectItem value="america/denver">Mountain Time</SelectItem>
                    <SelectItem value="america/los_angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;