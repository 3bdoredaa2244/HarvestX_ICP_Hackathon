import HeroSection from "@/components/HeroSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useICP";

const Home = () => {
  const { user } = useCurrentUser();
  const isFarmer = user && 'Farmer' in user.role;
  const isInvestor = user && 'Investor' in user.role;

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Investments",
      description: "Built on Internet Computer Protocol with transparent smart contracts and secure transactions."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Growth Tracking",
      description: "Monitor your agricultural investments with real-time updates and detailed analytics."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Direct Connection",
      description: "Connect directly with farmers and investors, eliminating middlemen and reducing costs."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Fast Execution",
      description: "Lightning-fast transactions powered by ICP infrastructure for instant deal execution."
    }
  ];

  return (
    <div>
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">HarvestX</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge blockchain technology with agricultural expertise to create a seamless investment experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-medium bg-gradient-card hover:shadow-strong transition-all duration-300">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-hero rounded-3xl p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Agriculture?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of farmers and investors who are already building the future of sustainable agriculture on HarvestX.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isFarmer && (
                <>
                  <Link to="/create-listing">
                    <Button variant="outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                      List Your Crops
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/farmer-dashboard">
                    <Button variant="outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                      My Farm Dashboard
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
              {isInvestor && (
                <>
                  <Link to="/marketplace">
                    <Button variant="outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                      Browse Crops
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/investor-dashboard">
                    <Button variant="outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                      Start Investing
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
              {!user && (
                <>
                  <Link to="/register">
                    <Button variant="outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                      Join as Farmer
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                      Start Investing
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;