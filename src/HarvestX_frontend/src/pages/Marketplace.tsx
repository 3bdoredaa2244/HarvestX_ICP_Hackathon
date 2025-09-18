import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productTypes, qualityGrades } from "@/data/mockData";
import { Calendar, MapPin, Package, Search, TrendingUp, User, AlertCircle, Loader2 } from "lucide-react";
import { useICPOffers } from "@/hooks/useICP";
import { icpService, InvestmentOffer } from "@/services/icpService";
import { InvestmentRequestDialog } from "@/components/InvestmentRequestDialog";
import cropsIcon from "@/assets/crops-icon.jpg";

const Marketplace = () => {
  const { offers, loading, error, refetch } = useICPOffers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<InvestmentOffer | null>(null);

  const filteredListings = useMemo(() => {
    return offers.filter(offer => {
      const productTypeString = icpService.getProductTypeString(offer.product_type);
      const qualityGradeString = icpService.getQualityGradeString(offer.quality_grade);
      const statusString = icpService.getOfferStatusString(offer.status);

      const matchesSearch = offer.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.farmer.toString().toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || productTypeString === selectedType;
      const matchesGrade = selectedGrade === "all" || qualityGradeString === selectedGrade;

      return matchesSearch && matchesType && matchesGrade && statusString === "Active";
    });
  }, [offers, searchTerm, selectedType, selectedGrade]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-success text-success-foreground";
      case "Completed": return "bg-muted text-muted-foreground";
      case "Cancelled": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "Premium": return "bg-accent text-accent-foreground";
      case "Organic": return "bg-success text-success-foreground";
      case "Grade1": return "bg-primary text-primary-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img src={cropsIcon} alt="Crops" className="w-12 h-12 rounded-lg object-cover" />
            <div>
              <h1 className="text-3xl font-bold">Crop Marketplace</h1>
              <p className="text-muted-foreground">
                Discover investment opportunities from farmers worldwide
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-6 shadow-soft">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search crops, farmers, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Product Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Product Types</SelectItem>
                  {productTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="All Quality Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quality Grades</SelectItem>
                  {qualityGrades.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Sort by Price
              </Button>
            </div>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading offers from ICP backend...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load offers</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Found {filteredListings.length} active listings from ICP backend
            </p>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((offer) => {
              const productTypeString = icpService.getProductTypeString(offer.product_type);
              const qualityGradeString = icpService.getQualityGradeString(offer.quality_grade);
              const statusString = icpService.getOfferStatusString(offer.status);

              return (
                <Card key={offer.id} className="shadow-medium hover:shadow-strong transition-all duration-300 bg-gradient-card border-0">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getStatusColor(statusString)}>{statusString}</Badge>
                      <Badge className={getGradeColor(qualityGradeString)}>{qualityGradeString}</Badge>
                    </div>
                    <CardTitle className="text-xl">{offer.product_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {offer.farmer.toString().slice(0, 10)}...
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {offer.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{Number(offer.available_quantity)}kg available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{offer.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{offer.harvest_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-primary">${offer.price_per_kg.toFixed(2)}/kg</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <div className="text-sm text-muted-foreground mb-2">
                        Minimum Investment: <span className="font-semibold text-foreground">${Number(offer.minimum_investment)}</span>
                      </div>
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setDialogOpen(true);
                        }}
                      >
                        Make Investment Offer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No listings found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        )}
      </div>

      {/* Investment Request Dialog */}
      {selectedOffer && (
        <InvestmentRequestDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          offer={selectedOffer}
        />
      )}
    </div>
  );
};

export default Marketplace;