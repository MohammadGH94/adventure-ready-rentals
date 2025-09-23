import { Search, Calendar, Shield, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: Search,
    title: "1. Discover Local Gear",
    description: "Browse trusted equipment from fellow adventurers in your area. Each item comes with clear photos and honest descriptions."
  },
  {
    icon: Calendar,
    title: "2. Book Safely",
    description: "Reserve your dates with transparent pricing - no hidden fees. Chat with owners who love sharing their gear knowledge."
  },
  {
    icon: Shield,
    title: "3. Adventure Confidently",
    description: "Meet friendly locals or arrange convenient pickup. Every rental includes protection coverage and we're here if you need us."
  },
  {
    icon: Star,
    title: "4. Share Your Story",
    description: "Return the gear and tell others about your adventure. Your review helps fellow explorers discover new trails."
  }
];

const benefits = [
  {
    title: "Try Before You Invest",
    description: "Test expensive gear before committing to buy. Discover what works best for your adventures without the big upfront cost."
  },
  {
    title: "Connect With Locals",
    description: "Meet passionate adventurers who share insider tips about the best trails, conditions, and hidden gems in your area."
  },
  {
    title: "Access Premium Gear",
    description: "Borrow top-quality equipment that owners personally use and maintain. Every item is loved and cared for."
  },
  {
    title: "Protected Adventures",
    description: "Adventure worry-free with damage coverage included. Clear terms, fair policies - we've got your back."
  },
  {
    title: "Friendly Support",
    description: "Get help from real people who understand your passion for the outdoors. We're here when you need us most."
  },
  {
    title: "Adventure Sustainably",
    description: "Share resources with your community and reduce waste. Every rental helps our planet and supports local adventurers."
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
              Connect with your local adventure community in 4 simple steps. Share gear, reduce waste, and discover new trails together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="action" size="lg">
                <Link to="/browse">Discover Local Gear</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/list-gear">Share Your Gear</Link>
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
                Why Adventure With CiKr?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join fellow adventurers who believe in sharing gear and protecting our planet.
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
                Adventure With Confidence
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We protect every adventure with clear coverage, verified community members, and friendly support. Your safety and peace of mind come first.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <strong className="text-foreground block mb-1">Adventure Protection</strong>
                  <span className="text-muted-foreground">Up to $2,000 coverage - clearly explained, no surprises</span>
                </div>
                <div>
                  <strong className="text-foreground block mb-1">Trusted Community</strong>
                  <span className="text-muted-foreground">Real adventurers, verified profiles, honest reviews</span>
                </div>
                <div>
                  <strong className="text-foreground block mb-1">Friendly Help</strong>
                  <span className="text-muted-foreground">Real people who understand your passion, here 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-hero">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Next Adventure Awaits
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of adventurers sharing gear and exploring sustainably in communities worldwide.
            </p>
            <Button asChild variant="action" size="lg">
              <Link to="/browse">Discover Your Adventure</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;