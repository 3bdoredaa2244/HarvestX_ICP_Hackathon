import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { productTypes, qualityGrades } from "@/data/mockData";
import { ArrowLeft, Plus, Wheat, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateOffer } from "@/hooks/useICP";
import { icpService } from "@/services/icpService";

const CreateListing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createOffer, loading, error } = useCreateOffer();
  
  const [formData, setFormData] = useState({
    productName: "",
    productType: "",
    qualityGrade: "",
    description: "",
    totalQuantity: "",
    pricePerKg: "",
    minimumInvestment: "",
    location: "",
    harvestDate: "",
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['productName', 'productType', 'qualityGrade', 'description', 'totalQuantity', 'pricePerKg', 'minimumInvestment', 'location', 'harvestDate'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert form data to ICP format
      const offerRequest = {
        product_name: formData.productName,
        product_type: icpService.convertProductType(formData.productType),
        quality_grade: icpService.convertQualityGrade(formData.qualityGrade),
        description: formData.description,
        total_quantity: BigInt(formData.totalQuantity),
        price_per_kg: parseFloat(formData.pricePerKg),
        minimum_investment: BigInt(formData.minimumInvestment),
        location: formData.location,
        harvest_date: formData.harvestDate,
      };

      // Create offer via ICP backend
      const result = await createOffer(offerRequest);
      
      if (result) {
        toast({
          title: "Crop Listed Successfully!",
          description: "Your crop listing has been created on the ICP blockchain and is now visible to investors.",
        });
        
        // Reset form and navigate
        setFormData({
          productName: "",
          productType: "",
          qualityGrade: "",
          description: "",
          totalQuantity: "",
          pricePerKg: "",
          minimumInvestment: "",
          location: "",
          harvestDate: "",
        });
        
        setTimeout(() => {
          navigate('/marketplace');
        }, 1500);
      }
    } catch (err) {
      toast({
        title: "Failed to Create Listing",
        description: error || "There was an error creating your crop listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Wheat className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Create Crop Listing</h1>
          </div>
          <p className="text-muted-foreground">
            List your agricultural products and connect with potential investors
          </p>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Agricultural Offer
            </CardTitle>
            <CardDescription>
              Provide detailed information about your crop to attract the right investors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Organic Tomatoes"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="productType">Product Type *</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) => handleInputChange('productType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="qualityGrade">Quality Grade *</Label>
                  <Select
                    value={formData.qualityGrade}
                    onValueChange={(value) => handleInputChange('qualityGrade', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualityGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., California, USA"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your crop, growing methods, and any special qualities..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              {/* Quantity and Pricing */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="totalQuantity">Total Quantity (kg) *</Label>
                  <Input
                    id="totalQuantity"
                    type="number"
                    placeholder="1000"
                    value={formData.totalQuantity}
                    onChange={(e) => handleInputChange('totalQuantity', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pricePerKg">Price per Kg ($) *</Label>
                  <Input
                    id="pricePerKg"
                    type="number"
                    step="0.01"
                    placeholder="5.50"
                    value={formData.pricePerKg}
                    onChange={(e) => handleInputChange('pricePerKg', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minimumInvestment">Minimum Investment ($) *</Label>
                  <Input
                    id="minimumInvestment"
                    type="number"
                    placeholder="100"
                    value={formData.minimumInvestment}
                    onChange={(e) => handleInputChange('minimumInvestment', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date *</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating on ICP...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Create Listing
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  size="lg"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateListing;