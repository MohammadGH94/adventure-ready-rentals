import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Camera, DollarSign, MapPin, Calendar, Shield, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const earnings = [
  { gear: "Climbing Rope Set", monthly: "$450" },
  { gear: "Camping Kit", monthly: "$380" },
  { gear: "Kayak", monthly: "$520" },
  { gear: "Ski Equipment", monthly: "$890" }
];

const ListGear = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const previewUrls = useMemo(() => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })), [selectedFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previewUrls]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
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
                <CardTitle className="text-2xl">List Your Gear</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the details below to start earning from your adventure gear
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Gear Title *
                    </label>
                    <Input placeholder="e.g., Professional Climbing Rope Set" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category *
                    </label>
                    <select className="w-full h-11 px-3 rounded-xl border border-border bg-background">
                      <option>Select category</option>
                      <option>Climbing & Mountaineering</option>
                      <option>Camping & Hiking</option>
                      <option>Water Sports</option>
                      <option>Winter Sports</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <Textarea 
                    placeholder="Describe your gear, its condition, what's included, and any special features..."
                    rows={4}
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Daily Rate *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="45" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Weekly Rate (optional)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="250" className="pl-10" />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="City, State" className="pl-10" />
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Photos *
                  </label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="text-foreground font-medium mb-2">
                      Upload photos of your gear
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Add at least 3 high-quality photos showing different angles
                    </div>
                    <input
                      id="gear-photos"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                    <Button variant="outline" asChild>
                      <label htmlFor="gear-photos" className="cursor-pointer">
                        Choose Files
                      </label>
                    </Button>
                    {selectedFiles.length > 0 && (
                      <div className="mt-6 text-left">
                        <p className="text-sm font-medium text-foreground">
                          {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          {previewUrls.map(({ file, url }) => (
                            <div
                              key={`${file.name}-${file.lastModified}`}
                              className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3"
                            >
                              <img
                                src={url}
                                alt={file.name}
                                className="h-14 w-14 flex-none rounded-md object-cover"
                              />
                              <div>
                                <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Availability
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="Select available dates" className="pl-10" />
                  </div>
                </div>

                <Button variant="action" size="lg" className="w-full">
                  List My Gear
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why List with AdventureRent?
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