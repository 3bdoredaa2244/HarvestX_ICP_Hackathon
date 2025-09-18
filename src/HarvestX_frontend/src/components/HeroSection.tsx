import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Wheat } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Wheat className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-accent font-semibold">Agricultural Investment Platform</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Connecting{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Farmers
            </span>{" "}
            with{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Investors
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            HarvestX empowers agricultural growth through direct investment opportunities. 
            Farmers showcase their crops, investors support sustainable agriculture, 
            and together we build a more resilient food system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link to="/create-listing">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                <Wheat className="h-5 w-5 mr-2" />
                List Your Crops
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/investor-dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <TrendingUp className="h-5 w-5 mr-2" />
                Start Investing
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Active Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$2.5M</div>
              <div className="text-sm text-muted-foreground">Invested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1,200</div>
              <div className="text-sm text-muted-foreground">Successful Deals</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;