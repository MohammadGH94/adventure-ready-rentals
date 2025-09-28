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
import { BankAccountForm } from "@/components/settings/BankAccountForm";
import { TaxInformationForm } from "@/components/settings/TaxInformationForm";
import { VerificationStatus } from "@/components/settings/VerificationStatus";
import { PayoutPreferences } from "@/components/settings/PayoutPreferences";
import { getFinancialData, updateFinancialData, createFinancialData, UserFinancialData } from "@/lib/financialData";
import Header from "@/components/Header";

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
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [financialData, setFinancialData] = useState<UserFinancialData | null>(null);
  const [notifications, setNotifications] = useState({
    bookings: true,
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

    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) throw error;

      setUserData(profile);
      setProfileImage(profile?.profile_image_url || "");

      // Fetch financial data
      if (profile?.id) {
        try {
          const financial = await getFinancialData(profile.id);
          setFinancialData(financial);
        } catch (error) {
          // Financial data might not exist yet, which is fine
          console.log('No financial data found:', error);
        }
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

  const handleProfileUpdate = async (data: ProfileFormData) => {
    if (!userData?.id) return;

    try {
      setLoading(true);
      
      const result = profileSchema.safeParse(data);
      if (!result.success) {
        toast({
          title: "Validation Error",
          description: "Please check your input and try again",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userData.id);

      if (error) throw error;

      setUserData({ ...userData, ...data });
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

  const handleFinancialDataSave = async (data: any) => {
    if (!userData?.id) return;

    try {
      if (financialData) {
        await updateFinancialData(userData.id, data);
      } else {
        await createFinancialData({ ...data, user_id: userData.id });
      }
      
      // Refetch financial data
      const updated = await getFinancialData(userData.id);
      setFinancialData(updated);
    } catch (error) {
      console.error('Error saving financial data:', error);
      throw error;
    }
  };

  const handleDocumentUpload = async (type: string, url: string) => {
    if (!userData?.id) return;

    try {
      await handleFinancialDataSave({ [type]: url });
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  const handlePayoutPreferencesSave = async (data: any) => {
    // For now, just show success message
    // In a real app, this would save to a preferences table
    console.log('Payout preferences:', data);
  };

  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
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

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Booking Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your bookings
                  </p>
                </div>
                <Switch 
                  checked={notifications.bookings}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, bookings: checked }))
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <BankAccountForm
            initialData={financialData}
            onSave={handleFinancialDataSave}
            isLoading={loading}
          />
          
          <TaxInformationForm
            initialData={financialData}
            onSave={handleFinancialDataSave}
            isLoading={loading}
          />
          
          <VerificationStatus
            userData={userData}
            financialData={financialData}
            onDocumentUpload={handleDocumentUpload}
          />
          
          <PayoutPreferences
            initialData={financialData}
            onSave={handlePayoutPreferencesSave}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="cad">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="usd">USD - US Dollar</SelectItem>
                    <SelectItem value="eur">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Zone</Label>
                <Select defaultValue="america/toronto">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america/toronto">Eastern Time</SelectItem>
                    <SelectItem value="america/winnipeg">Central Time</SelectItem>
                    <SelectItem value="america/denver">Mountain Time</SelectItem>
                    <SelectItem value="america/vancouver">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Settings;