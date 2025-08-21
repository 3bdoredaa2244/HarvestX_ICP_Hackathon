export interface CropListing {
  id: string;
  farmerName: string;
  farmerPrincipal: string;
  productName: string;
  productType: 'Vegetables' | 'Fruits' | 'Grains' | 'Legumes' | 'Herbs' | 'Nuts' | 'Other';
  qualityGrade: 'Premium' | 'Grade1' | 'Grade2' | 'Standard' | 'Organic' | 'Certified';
  description: string;
  totalQuantity: number;
  availableQuantity: number;
  pricePerKg: number;
  minimumInvestment: number;
  location: string;
  harvestDate: string;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Expired';
  createdAt: string;
  imageUrl?: string;
}

export interface InvestmentRequest {
  id: string;
  offerId: string;
  investorName: string;
  investorPrincipal: string;
  requestedQuantity: number;
  offeredPricePerKg: number;
  totalOffered: number;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Expired';
  createdAt: string;
  expiresAt: string;
}

export const mockCropListings: CropListing[] = [
  {
    id: "1",
    farmerName: "Sarah Johnson",
    farmerPrincipal: "rdmx6-jaaaa-aaaah-qcaiq-cai",
    productName: "Organic Tomatoes",
    productType: "Vegetables",
    qualityGrade: "Organic",
    description: "Premium organic tomatoes grown using sustainable farming practices. Perfect for high-end restaurants and organic food markets.",
    totalQuantity: 500,
    availableQuantity: 350,
    pricePerKg: 4.50,
    minimumInvestment: 100,
    location: "California, USA",
    harvestDate: "2024-09-15",
    status: "Active",
    createdAt: "2024-08-20",
    imageUrl: "/api/placeholder/300/200"
  },
  {
    id: "2",
    farmerName: "Miguel Rodriguez",
    farmerPrincipal: "rrkah-fqaaa-aaaah-qcaaq-cai",
    productName: "Avocados",
    productType: "Fruits",
    qualityGrade: "Premium",
    description: "Premium Hass avocados with excellent oil content. Grown in optimal climate conditions with sustainable water management.",
    totalQuantity: 800,
    availableQuantity: 800,
    pricePerKg: 6.25,
    minimumInvestment: 250,
    location: "Mexico",
    harvestDate: "2024-10-01",
    status: "Active",
    createdAt: "2024-08-18",
    imageUrl: "/api/placeholder/300/200"
  },
  {
    id: "3",
    farmerName: "David Chen",
    farmerPrincipal: "rjkah-fqaaa-aaaah-qcaaq-cai",
    productName: "Quinoa",
    productType: "Grains",
    qualityGrade: "Grade1",
    description: "High-protein quinoa seeds, perfect for health-conscious consumers. Grown at high altitude for superior quality.",
    totalQuantity: 300,
    availableQuantity: 180,
    pricePerKg: 8.75,
    minimumInvestment: 150,
    location: "Peru",
    harvestDate: "2024-08-30",
    status: "Active",
    createdAt: "2024-08-15",
    imageUrl: "/api/placeholder/300/200"
  },
  {
    id: "4",
    farmerName: "Emma Wilson",
    farmerPrincipal: "rmkah-fqaaa-aaaah-qcaaq-cai",
    productName: "Soybeans",
    productType: "Legumes",
    qualityGrade: "Standard",
    description: "High-yield soybeans ideal for protein extraction and animal feed. Grown using precision agriculture techniques.",
    totalQuantity: 1200,
    availableQuantity: 950,
    pricePerKg: 2.30,
    minimumInvestment: 200,
    location: "Iowa, USA",
    harvestDate: "2024-09-30",
    status: "Active",
    createdAt: "2024-08-10",
    imageUrl: "/api/placeholder/300/200"
  },
  {
    id: "5",
    farmerName: "Jean-Pierre Dubois",
    farmerPrincipal: "rnkah-fqaaa-aaaah-qcaaq-cai",
    productName: "Lavender",
    productType: "Herbs",
    qualityGrade: "Premium",
    description: "Fragrant lavender flowers perfect for essential oil production and culinary uses. Grown in traditional French fields.",
    totalQuantity: 150,
    availableQuantity: 75,
    pricePerKg: 12.50,
    minimumInvestment: 80,
    location: "Provence, France",
    harvestDate: "2024-07-20",
    status: "Active",
    createdAt: "2024-07-25",
    imageUrl: "/api/placeholder/300/200"
  },
  {
    id: "6",
    farmerName: "Kumar Patel",
    farmerPrincipal: "rokah-fqaaa-aaaah-qcaaq-cai",
    productName: "Basmati Rice",
    productType: "Grains",
    qualityGrade: "Premium",
    description: "Authentic Basmati rice with exceptional aroma and long grains. Grown in traditional paddy fields using heritage methods.",
    totalQuantity: 600,
    availableQuantity: 420,
    pricePerKg: 3.80,
    minimumInvestment: 120,
    location: "Punjab, India",
    harvestDate: "2024-11-15",
    status: "Active",
    createdAt: "2024-08-05",
    imageUrl: "/api/placeholder/300/200"
  }
];

export const mockInvestmentRequests: InvestmentRequest[] = [
  {
    id: "req1",
    offerId: "1",
    investorName: "Alex Thompson",
    investorPrincipal: "investor1-fqaaa-aaaah-qcaaq-cai",
    requestedQuantity: 100,
    offeredPricePerKg: 4.50,
    totalOffered: 450,
    message: "Interested in your organic tomatoes for our restaurant chain. Can we discuss bulk pricing?",
    status: "Pending",
    createdAt: "2024-08-21",
    expiresAt: "2024-08-28"
  },
  {
    id: "req2", 
    offerId: "2",
    investorName: "Green Foods Corp",
    investorPrincipal: "investor2-fqaaa-aaaah-qcaaq-cai",
    requestedQuantity: 200,
    offeredPricePerKg: 6.00,
    totalOffered: 1200,
    message: "Looking for premium avocados for our organic food line. Very interested in establishing long-term partnership.",
    status: "Accepted",
    createdAt: "2024-08-19",
    expiresAt: "2024-08-26"
  },
  {
    id: "req3",
    offerId: "3", 
    investorName: "Health Foods Inc",
    investorPrincipal: "investor3-fqaaa-aaaah-qcaaq-cai",
    requestedQuantity: 50,
    offeredPricePerKg: 8.50,
    totalOffered: 425,
    message: "Quinoa looks excellent! We'd like to place an order for our health food stores.",
    status: "Pending",
    createdAt: "2024-08-20",
    expiresAt: "2024-08-27"
  }
];

export const productTypes = [
  'Vegetables',
  'Fruits', 
  'Grains',
  'Legumes',
  'Herbs',
  'Nuts',
  'Other'
] as const;

export const qualityGrades = [
  'Premium',
  'Grade1',
  'Grade2', 
  'Standard',
  'Organic',
  'Certified'
] as const;