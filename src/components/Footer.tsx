import { Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
              AdventureRent
            </h3>
            <p className="text-muted-foreground mb-4">
              Rent amazing adventure gear from local owners. Explore more, own less.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Browse</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Climbing Gear</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Camping Equipment</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Water Sports</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Winter Sports</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">All Categories</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">How It Works</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Safety</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Insurance</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Careers</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Trust & Safety</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-adventure">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 AdventureRent. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-adventure">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-adventure">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-adventure">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;