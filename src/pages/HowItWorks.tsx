import { Search, Calendar, Shield, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: Search,
    title: "1. Search & Browse",
    description: "Find the perfect gear for your adventure. Filter by location, dates, and gear type to discover amazing equipment from local owners."
  },
  {
    icon: Calendar,
    title: "2. Book & Pay",
    description: "Select your dates and book instantly. Secure payment processing and instant confirmation. Message owners directly for any questions."
  },
  {
    icon: Shield,
    title: "3. Pick Up & Adventure",
    description: "Meet your gear owner or arrange delivery. All rentals include damage protection and 24/7 support during your adventure."
  },
  {
    icon: Star,
    title: "4. Return & Review",
    description: "Return the gear and share your experience. Rate your rental and help build our trusted community of adventurers."
  }
];

const benefits = [
  {
    title: "Save Money",
    description: "Rent gear for a fraction of buying new. Try before you buy expensive equipment."
  },
  {
    title: "Local Community",
    description: "Connect with fellow adventurers in your area. Get local tips and recommendations."
  },
  {
    title: "Quality Gear",
    description: "Access high-end equipment that would be too expensive to own. All gear is verified and maintained."
  },
  {
    title: "Insurance Coverage",
    description: "Every rental includes comprehensive damage protection for peace of mind."
  },
  {
    title: "Expert Support",
    description: "Get help from gear experts and experienced adventurers. 24/7 customer support."
  },
  {
    title: "Eco-Friendly",
    description: "Reduce waste by sharing resources. Make a positive environmental impact."
  }
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How CiKr Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rent amazing adventure gear in 4 simple steps. Join thousands of adventurers sharing gear in your local community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="action" size="lg">
                <Link to="/browse">Start Browsing Gear</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/list-gear">List Your Gear</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose CiKr?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join the sharing economy and discover the benefits of gear rental.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-card rounded-xl p-6 shadow-soft">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-accent/10 rounded-2xl p-8">
              <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Safety & Trust First
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Every rental includes comprehensive damage protection, verified gear owners, and 24/7 support. Your adventure is our priority.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <strong className="text-foreground block mb-1">Damage Protection</strong>
                  <span className="text-muted-foreground">Up to $2,000 coverage included</span>
                </div>
                <div>
                  <strong className="text-foreground block mb-1">Verified Owners</strong>
                  <span className="text-muted-foreground">ID verification & background checks</span>
                </div>
                <div>
                  <strong className="text-foreground block mb-1">24/7 Support</strong>
                  <span className="text-muted-foreground">Help when you need it most</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-hero">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of adventurers renting gear in your local community.
            </p>
            <Button asChild variant="action" size="lg">
              <Link to="/browse">Start Exploring Gear</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;