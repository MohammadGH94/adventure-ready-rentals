import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DateRangePicker } from '@/components/DatePicker';
import { PhotoUpload } from '@/components/PhotoUpload';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useListingForm } from '@/hooks/useListingForm';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, DollarSign, Star, Upload, CheckCircle, Shield, Users, Building2 } from 'lucide-react';

const earnings = [
  { gear: "Climbing Rope Set", monthly: "$450" },
  { gear: "Camping Kit", monthly: "$380" },
  { gear: "Kayak", monthly: "$520" },
  { gear: "Ski Equipment", monthly: "$890" }
];

const ListGear = () => {
  const { user } = useAuth();
  const { files, uploading, addFiles, removeFile, uploadFiles, clearFiles } = useFileUpload();
  const { form, createListing } = useListingForm();
  const [availability, setAvailability] = useState<DateRange | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'camping', 'water_sports', 'climbing', 'vehicles', 'winter_sports', 'hiking', 'cycling'
  ] as const;

  const isBusinessUser = user?.user_metadata?.user_type === 'business';

  const handleCategoryToggle = (category: typeof categories[number]) => {
    try {
      console.log('Toggling category:', category);
      const currentCategories = form.getValues('categories') || [];
      console.log('Current categories:', currentCategories);
      
      const updatedCategories = currentCategories.includes(category)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category];
      
      console.log('Updated categories:', updatedCategories);
      form.setValue('categories', updatedCategories);
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };

  const onSubmit = async (data: any) => {
    if (!user) {
      alert('Please sign in to create a listing');
      return;
    }

    if (files.length === 0) {
      alert('Please add at least one photo');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload photos first
      const photoPaths = await uploadFiles(user.id);
      
      if (photoPaths.length === 0) {
        alert('Failed to upload photos');
        return;
      }

      // Create the listing
      await createListing(data, photoPaths);
      
      // Clear form and files
      form.reset();
      clearFiles();
      setAvailability(undefined);
      
    } catch (error) {
      console.error('Error creating listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              List Your Adventure Gear
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Turn your unused outdoor equipment into extra income. Join thousands of gear owners earning money from their adventure equipment.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$1,200</div>
                <div className="text-sm text-muted-foreground">Avg monthly earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15min</div>
                <div className="text-sm text-muted-foreground">To list your gear</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$2M+</div>
                <div className="text-sm text-muted-foreground">Insurance coverage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Potential */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Your Gear Could Be Earning
              </h2>
              <p className="text-lg text-muted-foreground">
                See what similar gear is earning in your area
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {earnings.map((item, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {item.monthly}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.gear}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      per month
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Listing Form */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">List Your Gear</CardTitle>
                  {isBusinessUser && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Business Account
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Fill out the details below to start earning from your adventure gear
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Professional Camping Tent for 4 People" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categories *</FormLabel>
                          <p className="text-sm text-muted-foreground mb-3">Select all categories that apply</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {categories.map((category) => (
                              <div
                                key={category}
                                className={`border rounded-lg p-3 transition-colors ${
                                  (field.value || []).includes(category)
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={(field.value || []).includes(category)}
                                    onCheckedChange={() => handleCategoryToggle(category)}
                                  />
                                  <Label 
                                    className="capitalize cursor-pointer"
                                    onClick={() => handleCategoryToggle(category)}
                                  >
                                    {category.replace('_', ' ')}
                                  </Label>
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe your gear, its condition, what's included..."
                              className="h-24"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price_per_day"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Rate *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="25" 
                                  className="pl-10"
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input 
                                  {...field} 
                                  placeholder="City, State" 
                                  className="pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {isBusinessUser && (
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-medium">Business Features</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="inventory_count"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inventory Count</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    placeholder="1"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="min_rental_days"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Minimum Rental Days</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    placeholder="1"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="delivery_available"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Delivery Available</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Offer delivery service for this item
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-base font-medium">Photos *</Label>
                      <p className="text-sm text-muted-foreground mb-4">Add photos of your gear (up to 10 photos)</p>
                      <PhotoUpload
                        files={files}
                        onAddFiles={addFiles}
                        onRemoveFile={removeFile}
                        uploading={uploading}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="pickup_instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Provide instructions for pickup location, times, etc."
                              className="h-20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label className="text-base font-medium">Availability</Label>
                      <p className="text-sm text-muted-foreground mb-4">When is your gear available for rent?</p>
                      <DateRangePicker 
                        startDate={availability?.from}
                        endDate={availability?.to}
                        onStartDateSelect={(date) => setAvailability(prev => ({ ...prev, from: date }))}
                        onEndDateSelect={(date) => setAvailability(prev => ({ ...prev, to: date }))}
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="px-8"
                        disabled={isSubmitting}
                      >
                        Save as Draft
                      </Button>
                      <Button 
                        type="submit" 
                        className="px-8"
                        disabled={isSubmitting || uploading}
                      >
                        {isSubmitting ? 'Creating...' : 'Publish Listing'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why List with CiKr?
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Earn Extra Income
                </h3>
                <p className="text-muted-foreground">
                  Turn your unused gear into a steady income stream. Set your own prices and availability.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Protected & Insured
                </h3>
                <p className="text-muted-foreground">
                  Every rental includes comprehensive damage protection up to $2,000. Your gear is safe.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Meet Adventurers
                </h3>
                <p className="text-muted-foreground">
                  Connect with fellow outdoor enthusiasts and help others discover new adventures.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ListGear;