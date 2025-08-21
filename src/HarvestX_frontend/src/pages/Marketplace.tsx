import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCropListings, productTypes, qualityGrades, type CropListing } from "@/data/mockData";
import { Calendar, MapPin, Package, Search, TrendingUp, User } from "lucide-react";
import cropsIcon from "@/assets/crops-icon.jpg";

const Marketplace = () => {
  const [listings] = useState<CropListing[]>(mockCropListings);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || listing.productType === selectedType;
    const matchesGrade = selectedGrade === "all" || listing.qualityGrade === selectedGrade;
    
    return matchesSearch && matchesType && matchesGrade && listing.status === "Active";
  });

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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found {filteredListings.length} active listings
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="shadow-medium hover:shadow-strong transition-all duration-300 bg-gradient-card border-0">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getStatusColor(listing.status)}>{listing.status}</Badge>
                  <Badge className={getGradeColor(listing.qualityGrade)}>{listing.qualityGrade}</Badge>
                </div>
                <CardTitle className="text-xl">{listing.productName}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {listing.farmerName}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {listing.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.availableQuantity}kg available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.harvestDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-primary">${listing.pricePerKg}/kg</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">
                    Minimum Investment: <span className="font-semibold text-foreground">${listing.minimumInvestment}</span>
                  </div>
                  <Button className="w-full" variant="default">
                    Make Investment Offer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No listings found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;