import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { DatePicker } from "@/components/DatePicker";
import heroImage from "@/assets/nature-illustration-1.png";
const Hero = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  return <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${heroImage})`
    }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          Discover Your Next
          <span className="block bg-gradient-sunset bg-clip-text text-transparent">
            Adventure
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
          Connect with locals and rent gear to reduce waste. From climbing gear to camping equipment - your adventure starts here.
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
                <Input placeholder="Climbing, camping..." className="pl-10 h-12" />
              </div>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="San Francisco, CA" className="pl-10 h-12" />
              </div>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pick-up</label>
                <DatePicker date={startDate} onSelect={setStartDate} placeholder="Pick-up date" className="h-12" disabled={date => date < new Date()} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Return</label>
                <DatePicker date={endDate} onSelect={setEndDate} placeholder="Return date" className="h-12" disabled={date => date < new Date()} />
              </div>
            </div>
            
            <div className="md:col-span-1 flex items-end">  
              <Button asChild variant="action" size="lg" className="w-full h-12">
                <Link to="/browse">Find Your Adventure</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button asChild variant="hero" size="sm">
            <Link to="/browse">Explore All Adventures</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            <Link to="/list-gear">Share Your Gear</Link>
          </Button>
        </div>
      </div>
    </section>;
};
export default Hero;