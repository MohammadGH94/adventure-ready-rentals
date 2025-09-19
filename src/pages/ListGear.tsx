import { useEffect, useMemo, useState } from "react";
import { Camera, DollarSign, MapPin, Calendar, Shield, Users, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { addEquipment, uploadGearImages } from "@/services/firestore";
import { useAuth } from "@/contexts/AuthContext";

const earnings = [
  { gear: "Climbing Rope Set", monthly: "$450" },
  { gear: "Camping Kit", monthly: "$380" },
  { gear: "Kayak", monthly: "$520" },
  { gear: "Ski Equipment", monthly: "$890" }
];

const categoryOptions = [
  "Climbing & Mountaineering",
  "Camping & Hiking",
  "Water Sports",
  "Winter Sports",
  "Other",
];

const formSchema = z.object({
  title: z.string().trim().min(1, "Please enter a title."),
  category: z.string().trim().min(1, "Please choose a category."),
  description: z.string().trim().min(1, "Please provide a description."),
  pricePerDay: z
    .string({ required_error: "Daily rate is required." })
    .trim()
    .refine((value) => {
      const numeric = Number.parseFloat(value);

      return Number.isFinite(numeric) && numeric > 0;
    }, "Daily rate must be a valid number greater than zero."),
  weeklyRate: z
    .string()
    .trim()
    .optional()
    .refine((value) => {
      if (!value) {
        return true;
      }

      const numeric = Number.parseFloat(value);

      return Number.isFinite(numeric) && numeric > 0;
    }, "Weekly rate must be a valid number greater than zero."),
  location: z.string().trim().min(1, "Please provide a location."),
  availabilityNote: z.string().trim().optional(),
  photos: z.array(z.instanceof(File)).min(1, "Please upload at least one photo."),
});

type GearFormValues = z.infer<typeof formSchema>;

const defaultValues: GearFormValues = {
  title: "",
  category: "",
  description: "",
  pricePerDay: "",
  weeklyRate: "",
  location: "",
  availabilityNote: "",
  photos: [],
};

const buildFileKey = (file: File) => `${file.name}-${file.lastModified}`;

const ListGear = () => {
  const { user, loading: authLoading } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<GearFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const photoFiles = form.watch("photos");

  const previewUrls = useMemo(() => {
    const files = photoFiles ?? [];

    return files.map((file) => ({ file, url: URL.createObjectURL(file) }));
  }, [photoFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previewUrls]);

  const mutation = useMutation({
    mutationFn: async (values: GearFormValues) => {
      if (!user) {
        throw new Error("You must be signed in to list your gear.");
      }

      values.photos.forEach((file) => {
        const key = buildFileKey(file);
        setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
      });

      const dailyRate = Number.parseFloat(values.pricePerDay);
      const weeklyRateValue = values.weeklyRate ? Number.parseFloat(values.weeklyRate) : undefined;
      const availabilityNote = values.availabilityNote?.trim();

      const imageUrls = await uploadGearImages({
        files: values.photos,
        ownerId: user.uid,
        onProgress: ({ file, progress }) => {
          const key = buildFileKey(file);
          setUploadProgress((prev) => ({ ...prev, [key]: progress }));
        },
      });

      const trimmedCategory = values.category.trim();

      await addEquipment({
        title: values.title.trim(),
        description: values.description.trim(),
        category: trimmedCategory,
        pricePerDay: dailyRate,
        ownerId: user.uid,
        imageUrls,
        location: values.location.trim(),
        availability: true,
        weeklyRate: weeklyRateValue,
        availabilityNote: availabilityNote && availabilityNote.length > 0 ? availabilityNote : undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Your gear is listed!",
        description: "We published your listing and saved your gear photos.",
      });
      setSubmissionError(null);
      setUploadProgress({});
      form.reset({ ...defaultValues, photos: [] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "We couldn't list your gear. Please try again.";
      setSubmissionError(message);
      toast({
        title: "Unable to list gear",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitForm = async (values: GearFormValues) => {
    if (!user) {
      return;
    }

    setSubmissionError(null);
    setUploadProgress({});

    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      console.error("Failed to submit gear listing:", error);
    }
  };

  const isSubmitting = mutation.isPending;
  const canSubmit = !!user && !authLoading && !isSubmitting;

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
                <CardTitle className="text-2xl">List Your Gear</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the details below to start earning from your adventure gear
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
                    {!authLoading && !user && (
                      <Alert>
                        <AlertTitle>Sign in to list your gear</AlertTitle>
                        <AlertDescription>
                          Create or sign in to your account so we can publish your listing under your owner profile.
                        </AlertDescription>
                      </Alert>
                    )}

                    {submissionError && (
                      <Alert variant="destructive">
                        <AlertTitle>Unable to list gear</AlertTitle>
                        <AlertDescription>{submissionError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gear Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Professional Climbing Rope Set" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <FormControl>
                              <select
                                className="w-full h-11 rounded-xl border border-border bg-background px-3"
                                {...field}
                              >
                                <option value="">Select category</option>
                                {categoryOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your gear, its condition, what's included, and any special features..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="pricePerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Rate *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.01"
                                  min="0"
                                  placeholder="45"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="weeklyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weekly Rate (optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.01"
                                  min="0"
                                  placeholder="250"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                              <Input placeholder="City, State" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="photos"
                      render={({ field }) => {
                        const files = field.value ?? [];

                        return (
                          <FormItem>
                            <FormLabel>Photos *</FormLabel>
                            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                              <Camera className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                              <div className="text-foreground font-medium mb-2">Upload photos of your gear</div>
                              <div className="text-sm text-muted-foreground mb-4">
                                Add at least 3 high-quality photos showing different angles
                              </div>
                              <FormControl>
                                <input
                                  id="gear-photos"
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="sr-only"
                                  onChange={(event) => {
                                    const list = event.target.files ? Array.from(event.target.files) : [];
                                    field.onChange(list);
                                    field.onBlur();
                                    if (list.length > 0) {
                                      form.clearErrors("photos");
                                    }
                                    // Allow re-selecting the same file name by resetting the input
                                    event.target.value = "";
                                  }}
                                />
                              </FormControl>
                              <Button variant="outline" asChild disabled={isSubmitting}>
                                <label htmlFor="gear-photos" className="cursor-pointer">
                                  Choose Files
                                </label>
                              </Button>
                              {files.length > 0 && (
                                <div className="mt-6 text-left">
                                  <p className="text-sm font-medium text-foreground">
                                    {files.length} file{files.length === 1 ? "" : "s"} selected
                                  </p>
                                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    {previewUrls.map(({ file, url }) => {
                                      const key = buildFileKey(file);
                                      const progress = uploadProgress[key];

                                      return (
                                        <div
                                          key={key}
                                          className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3"
                                        >
                                          <img src={url} alt={file.name} className="h-14 w-14 flex-none rounded-md object-cover" />
                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground" title={file.name}>
                                              {file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            {isSubmitting && typeof progress === "number" && progress >= 0 && (
                                              <div className="mt-2 space-y-1">
                                                <Progress value={progress} className="h-2" />
                                                <p className="text-xs text-muted-foreground">
                                                  {Math.round(progress)}% uploaded
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="availabilityNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                              <Input placeholder="Select available dates" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button variant="action" size="lg" className="w-full" type="submit" disabled={!canSubmit}>
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Listing your gear...
                        </span>
                      ) : (
                        "List My Gear"
                      )}
                    </Button>
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