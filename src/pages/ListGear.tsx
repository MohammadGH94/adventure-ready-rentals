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
import { AddOnsManager } from '@/components/AddOnsManager';
import type { AddOn } from '@/components/AddOnsManager';
import { LocationInput } from '@/components/LocationInput';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useListingForm } from '@/hooks/useListingForm';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, DollarSign, Star, Upload, CheckCircle, Shield, Users, Building2, Loader2 } from 'lucide-react';

const earnings = [
  { gear: "Climbing Rope Set", monthly: "$450" },
  { gear: "Camping Kit", monthly: "$380" },
  { gear: "Kayak", monthly: "$520" },
  { gear: "Ski Equipment", monthly: "$890" }
];

const ListGear = () => {
  const { user } = useAuth();
  const { files, uploading, addFiles, removeFile, reorderFiles, uploadFiles, clearFiles } = useFileUpload();
  const { form, createListing } = useListingForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);

  const categories = [
    'camping', 'water_sports', 'climbing', 'vehicles', 'winter_sports', 'hiking', 'cycling'
  ] as const;

  const isBusinessUser = user?.user_metadata?.user_type === 'business';
  const deliveryAvailable = form.watch('delivery_available');

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
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Basic Information</h3>
                        <p className="text-sm text-muted-foreground">Tell renters about your gear</p>
                      </div>
                      
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
                                  className={`border rounded-lg p-3 transition-all cursor-pointer ${
                                    (field.value || []).includes(category)
                                      ? 'border-primary bg-primary/5 shadow-sm'
                                      : 'border-muted hover:border-primary/50'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={(field.value || []).includes(category)}
                                      onCheckedChange={() => handleCategoryToggle(category)}
                                    />
                                    <Label 
                                      className="capitalize cursor-pointer flex-1"
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
                                className="h-24 resize-none"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              {field.value?.length || 0} characters
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-foreground mb-1">Pricing & Location</h3>
                      <p className="text-sm text-muted-foreground mb-6">Set your price and location</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="price_per_day"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Rate *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    placeholder="25" 
                                    className="pl-10"
                                    min="1"
                                    step="0.01"
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Minimum $1 per day</p>
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
                                <LocationInput
                                  value={field.value || ""}
                                  onChange={(address, coordinates) => {
                                    field.onChange(address);
                                    if (coordinates) {
                                      form.setValue('location_lat', coordinates.latitude);
                                      form.setValue('location_lng', coordinates.longitude);
                                    }
                                  }}
                                  placeholder="Enter full address for accurate location"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Only approximate location shown publicly</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Photos Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-foreground mb-1">Photos</h3>
                      <p className="text-sm text-muted-foreground mb-6">Add photos to showcase your gear (up to 10)</p>
                      <PhotoUpload
                        files={files}
                        onAddFiles={addFiles}
                        onRemoveFile={removeFile}
                        onReorderFiles={reorderFiles}
                        coverPhotoIndex={coverPhotoIndex}
                        onSetCoverPhoto={setCoverPhotoIndex}
                        uploading={uploading}
                      />
                      {files.length === 0 && (
                        <p className="text-sm text-destructive mt-2">At least one photo is required</p>
                      )}
                    </div>

                    {/* Business Features Section */}
                    {isBusinessUser && (
                      <div className="border-t pt-6">
                        <div className="space-y-6 p-6 bg-muted/30 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Business Features</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                      min="1"
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">How many units available</p>
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
                                      min="1"
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
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-medium">Offer Delivery Service</FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    Allow renters to request delivery
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />

                          {/* Conditional Delivery Fields */}
                          {deliveryAvailable && (
                            <div className="space-y-4 pl-6 border-l-2 border-primary/20 animate-fade-in">
                              <p className="text-sm font-medium text-foreground">Delivery Settings</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="delivery_radius"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Delivery Radius (km)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          type="number" 
                                          placeholder="10"
                                          min="1"
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="delivery_fee"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Delivery Fee</FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                          <Input 
                                            {...field} 
                                            type="number" 
                                            placeholder="15"
                                            className="pl-10"
                                            min="0"
                                            step="0.01"
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rental Details Section */}
                    <div className="border-t pt-6 space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Rental Details</h3>
                        <p className="text-sm text-muted-foreground">Additional information for renters</p>
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
                                className="h-20 resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="add_ons"
                        render={({ field }) => (
                          <FormItem>
                            <AddOnsManager
                              addOns={(field.value || []) as AddOn[]}
                              onChange={(addOns) => field.onChange(addOns)}
                              isBusinessUser={isBusinessUser}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Availability Section */}
                    <div className="border-t pt-6 space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Availability</h3>
                        <p className="text-sm text-muted-foreground">When is your gear available for rent?</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Available From</FormLabel>
                              <FormControl>
                                <DateRangePicker 
                                  startDate={field.value}
                                  endDate={form.getValues('end_date')}
                                  onStartDateSelect={(date) => field.onChange(date)}
                                  onEndDateSelect={(date) => form.setValue('end_date', date)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="border-t pt-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            * Required fields
                          </p>
                          {files.length === 0 && (
                            <p className="text-sm text-destructive">
                              Please add at least one photo before publishing
                            </p>
                          )}
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1 sm:flex-none px-6"
                            disabled={isSubmitting}
                          >
                            Save as Draft
                          </Button>
                          <Button 
                            type="submit" 
                            className="flex-1 sm:flex-none px-6"
                            disabled={isSubmitting || uploading || files.length === 0}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : uploading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Publish Listing
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
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