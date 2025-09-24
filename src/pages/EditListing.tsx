import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useListing } from '@/hooks/useListing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, DollarSign, Upload, Building2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { files, uploading, addFiles, removeFile, uploadFiles, clearFiles, setFiles } = useFileUpload();
  const { form, updateListing } = useListingForm();
  const { data: listing, isLoading, error } = useListing(id || '');
  const [availability, setAvailability] = useState<DateRange | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'camping', 'water_sports', 'climbing', 'vehicles', 'winter_sports', 'hiking', 'cycling'
  ] as const;

  const isBusinessUser = user?.user_metadata?.user_type === 'business';

  // Load existing listing data into form
  useEffect(() => {
    if (listing) {
      form.reset({
        title: listing.title,
        description: listing.description || '',
        categories: listing.categories as typeof categories[number][],
        price_per_day: listing.price_per_day,
        location_address: listing.pickup_addresses?.[0] || '',
        pickup_instructions: listing.pickup_instructions || '',
        rules_and_requirements: listing.rules_and_requirements || '',
        min_rental_days: listing.min_rental_days || 1,
        max_rental_days: listing.max_rental_days || undefined,
        deposit_amount: listing.deposit_amount || undefined,
        insurance_required: listing.insurance_required,
        delivery_available: listing.delivery_available,
        delivery_fee: listing.delivery_fee || undefined,
        inventory_count: 1, // This field isn't in the listing type but is in the form
        business_license_verified: false, // This field isn't in the listing type but is in the form
      });

      // Set existing photos as preview images
      if (listing.photos) {
        const existingPhotos = listing.photos.map((url, index) => ({
          file: new File([], `existing-photo-${index}.jpg`),
          preview: url,
          uploaded: true,
          url: url,
          path: url,
          isExisting: true
        }));
        setFiles(existingPhotos);
      }
    }
  }, [listing, form, setFiles]);

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Listing ID</h1>
          <Button onClick={() => navigate('/my-listings')}>
            Return to My Listings
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Listing Not Found</h1>
          <p className="text-muted-foreground mb-6">The listing you're trying to edit doesn't exist or you don't have permission to edit it.</p>
          <Button onClick={() => navigate('/my-listings')}>
            Return to My Listings
          </Button>
        </div>
      </div>
    );
  }

  const handleCategoryToggle = (category: typeof categories[number]) => {
    try {
      const currentCategories = form.getValues('categories') || [];
      const updatedCategories = currentCategories.includes(category)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category];
      
      form.setValue('categories', updatedCategories);
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };

  const onSubmit = async (data: any) => {
    if (!user || !id) {
      toast({
        title: "Error",
        description: "Unable to update listing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload new photos if any
      let photoPaths = listing.photos || [];
      
      const newFiles = files.filter(f => !f.isExisting);
      if (newFiles.length > 0) {
        const newPhotoPaths = await uploadFiles(user.id);
        photoPaths = [...photoPaths, ...newPhotoPaths];
      }

      // Update the listing
      await updateListing(id, data, photoPaths);
      
      toast({
        title: "Success",
        description: "Listing updated successfully",
      });
      
      navigate('/my-listings');
      
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/my-listings')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Listings
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Edit Listing</h1>
            <p className="text-muted-foreground mt-2">
              Update your gear listing details
            </p>
          </div>

          {/* Listing Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">Edit: {listing.title}</CardTitle>
                {isBusinessUser && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Business Account
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Update the details below to modify your listing
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
                    <p className="text-sm text-muted-foreground mb-4">Update photos of your gear (up to 10 photos)</p>
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

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/my-listings')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-8"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        'Update Listing'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditListing;