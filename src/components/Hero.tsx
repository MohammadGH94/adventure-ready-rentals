import { Search, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-adventure-gear.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          Rent Amazing
          <span className="block bg-gradient-sunset bg-clip-text text-transparent">
            Adventure Gear
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
          From climbing gear to camping equipment. Discover, rent, and explore with confidence.
        </p>

        {/* Search Interface */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-adventure max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                What gear?
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Climbing, camping..."
                  className="pl-10 h-12"
                />
              </div>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="San Francisco, CA"
                  className="pl-10 h-12"
                />
              </div>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                Dates
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Select dates"
                  className="pl-10 h-12"
                />
              </div>
            </div>
            
            <div className="md:col-span-1 flex items-end">
              <Button variant="action" size="lg" className="w-full h-12">
                Search Gear
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button variant="hero" size="sm">
            Browse All Categories
          </Button>
          <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            List Your Gear
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;