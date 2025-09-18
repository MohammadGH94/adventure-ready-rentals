import { Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";
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
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://www.facebook.com/AdventureRent"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="AdventureRent on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://www.twitter.com/AdventureRent"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="AdventureRent on X"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://www.instagram.com/AdventureRent"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="AdventureRent on Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="mailto:hello@adventurerent.ca" aria-label="Email AdventureRent">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Browse</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/browse?category=climbing" className="text-muted-foreground hover:text-primary transition-adventure">
                  Climbing Gear
                </Link>
              </li>
              <li>
                <Link to="/browse?category=camping" className="text-muted-foreground hover:text-primary transition-adventure">
                  Camping Equipment
                </Link>
              </li>
              <li>
                <Link to="/browse?category=water" className="text-muted-foreground hover:text-primary transition-adventure">
                  Water Sports
                </Link>
              </li>
              <li>
                <Link to="/browse?category=winter" className="text-muted-foreground hover:text-primary transition-adventure">
                  Winter Sports
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-muted-foreground hover:text-primary transition-adventure">
                  All Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/info/about" className="text-muted-foreground hover:text-primary transition-adventure">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-adventure">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/info/safety" className="text-muted-foreground hover:text-primary transition-adventure">
                  Safety
                </Link>
              </li>
              <li>
                <Link to="/info/insurance" className="text-muted-foreground hover:text-primary transition-adventure">
                  Insurance
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="text-muted-foreground hover:text-primary transition-adventure">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link to="/info/careers" className="text-muted-foreground hover:text-primary transition-adventure">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/info/help-center" className="text-muted-foreground hover:text-primary transition-adventure">
                  Help Center
                </Link>
              </li>
              <li>
                <a href="mailto:support@adventurerent.ca" className="text-muted-foreground hover:text-primary transition-adventure">
                  Contact Us
                </a>
              </li>
              <li>
                <Link to="/info/trust-and-safety" className="text-muted-foreground hover:text-primary transition-adventure">
                  Trust &amp; Safety
                </Link>
              </li>
              <li>
                <Link to="/info/terms" className="text-muted-foreground hover:text-primary transition-adventure">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/info/privacy" className="text-muted-foreground hover:text-primary transition-adventure">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 AdventureRent. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/info/terms" className="text-muted-foreground hover:text-primary text-sm transition-adventure">
              Terms
            </Link>
            <Link to="/info/privacy" className="text-muted-foreground hover:text-primary text-sm transition-adventure">
              Privacy
            </Link>
            <Link to="/info/cookies" className="text-muted-foreground hover:text-primary text-sm transition-adventure">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;