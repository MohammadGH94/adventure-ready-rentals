import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import forestIllustration from "@/assets/nature-illustration-1.png";
import sunsetIllustration from "@/assets/nature-illustration-2.png";
import mountainIllustration from "@/assets/nature-illustration-3.png";

interface IllustratedSectionProps {
  variant: "forest" | "sunset" | "mountain";
  children: ReactNode;
  className?: string;
}

const IllustratedSection = ({ variant, children, className }: IllustratedSectionProps) => {
  const getBackgroundImage = () => {
    switch (variant) {
      case "forest":
        return `url(${forestIllustration})`;
      case "sunset":
        return `url(${sunsetIllustration})`;
      case "mountain":
        return `url(${mountainIllustration})`;
      default:
        return "";
    }
  };

  const getOverlay = () => {
    switch (variant) {
      case "forest":
        return "bg-gradient-to-b from-black/20 via-transparent to-white/90";
      case "sunset":
        return "bg-gradient-to-b from-transparent via-black/20 to-white/95";
      case "mountain":
        return "bg-gradient-to-b from-black/30 via-transparent to-white/90";
      default:
        return "bg-white/90";
    }
  };

  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* Background Illustration */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: getBackgroundImage() }}
      />
      
      {/* Overlay */}
      <div className={cn("absolute inset-0", getOverlay())} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};

export default IllustratedSection;