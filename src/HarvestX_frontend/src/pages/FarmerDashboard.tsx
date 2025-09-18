"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFarmerOffers, useRequestsForOffer, useRespondToRequest } from "@/hooks/useICP"
import { icpService } from "@/services/icpService"
import { CheckCircle, XCircle, Eye, Package, Users, Clock, Plus, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Link } from "react-router-dom"

export default function FarmerDashboard() {
    const { offers, loading: offersLoading, error: offersError, refetch: refetchOffers } = useFarmerOffers()
    const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
    const { requests, loading: requestsLoading, refetch: refetchRequests } = useRequestsForOffer(selectedOffer || "")
    const { respond, loading: respondLoading } = useRespondToRequest()

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "Completed":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case "Cancelled":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            case "Expired":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
        }
    }

    const getRequestStatusColor = (status: string) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "Accepted":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "Rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            case "Cancelled":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            case "Expired":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
        }
    }

    const handleResponse = async (requestId: string, accept: boolean) => {
        try {
            await respond({ request_id: requestId, accept })
            toast.success(`Request ${accept ? "accepted" : "rejected"} successfully`)
            refetchRequests()
            refetchOffers()
        } catch (error) {
            toast.error(`Failed to ${accept ? "accept" : "reject"} request`)
        }
    }

    const activeOffers = offers.filter((offer) => icpService.getOfferStatusString(offer.status) === "Active")
    const totalRequests = requests.length
    const pendingRequests = requests.filter((req) => icpService.getRequestStatusString(req.status) === "Pending").length

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Farmer Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage your crop listings and review investment requests from potential investors.
                        </p>
                    </div>
                    <Link to="/create-listing">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Listing
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Offers</p>
                                <p className="text-2xl font-bold">{activeOffers.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                                <p className="text-2xl font-bold">{selectedOffer ? totalRequests : "0"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                                <p className="text-2xl font-bold">{selectedOffer ? pendingRequests : "0"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="offers" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="offers">My Offers</TabsTrigger>
                    <TabsTrigger value="requests">Investment Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="offers" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Crop Listings</CardTitle>
                            <CardDescription>View and manage your agricultural investment offerings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {offersLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="ml-2 text-muted-foreground">Loading your offers from ICP...</span>
                                </div>
                            ) : offersError ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Failed to load offers</h3>
                                    <p className="text-muted-foreground mb-4">{offersError}</p>
                                    <Button onClick={refetchOffers} variant="outline">
                                        Try Again
                                    </Button>
                                </div>
                            ) : offers.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No crop listings found.</p>
                                    <Link to="/create-listing">
                                        <Button className="mt-4">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Your First Listing
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {offers.map((offer) => (
                                        <Card key={offer.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{offer.product_name}</h3>
                                                        <p className="text-muted-foreground">
                                                            {icpService.getProductTypeString(offer.product_type)} • {offer.location}
                                                        </p>
                                                    </div>
                                                    <Badge className={getStatusColor(icpService.getOfferStatusString(offer.status))}>
                                                        {icpService.getOfferStatusString(offer.status)}
                                                    </Badge>
                                                </div>

                                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{offer.description}</p>

                                                <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
                                                    <div>
                                                        <p className="font-medium">Available Quantity</p>
                                                        <p>{Number(offer.available_quantity)} kg</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Price per kg</p>
                                                        <p>${offer.price_per_kg}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Quality Grade</p>
                                                        <p>{icpService.getQualityGradeString(offer.quality_grade)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Harvest Date</p>
                                                        <p>{offer.harvest_date}</p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm text-muted-foreground">
                                                        Created: {new Date(Number(offer.created_at) / 1000000).toLocaleDateString()}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedOffer(offer.id)
                                                            // Auto-switch to requests tab when viewing requests
                                                            const tabsTrigger = document.querySelector('[value="requests"]') as HTMLElement
                                                            if (tabsTrigger) tabsTrigger.click()
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Requests
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requests" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Investment Requests</CardTitle>
                            <CardDescription>
                                {selectedOffer
                                    ? "Review and respond to investment requests for your selected offer"
                                    : "Select an offer from the 'My Offers' tab to view its investment requests"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!selectedOffer ? (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Please select an offer to view its investment requests.</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Go to the "My Offers" tab and click "View Requests" on any offer.
                                    </p>
                                </div>
                            ) : requestsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="ml-2 text-muted-foreground">Loading requests from ICP...</span>
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No investment requests found for this offer.</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Investors will be able to submit requests through the marketplace.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm font-medium">
                                            Showing {requests.length} request{requests.length !== 1 ? "s" : ""} for selected offer
                                        </p>
                                    </div>

                                    {requests.map((request) => (
                                        <Card key={request.id}>
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-semibold">Investment Request</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            From: {request.investor.toString().slice(0, 10)}...
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Submitted: {new Date(Number(request.created_at) / 1000000).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge className={getRequestStatusColor(icpService.getRequestStatusString(request.status))}>
                                                        {icpService.getRequestStatusString(request.status)}
                                                    </Badge>
                                                </div>

                                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <p className="font-medium text-sm">Requested Quantity</p>
                                                        <p>{Number(request.requested_quantity)} kg</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">Offered Price</p>
                                                        <p>${request.offered_price_per_kg}/kg</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">Total Value</p>
                                                        <p className="text-lg font-bold text-primary">${request.total_offered.toFixed(2)}</p>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="font-medium text-sm mb-2">Message from Investor:</p>
                                                    <div className="bg-muted p-3 rounded border-l-4 border-primary">
                                                        <p className="text-sm">{request.message}</p>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-muted-foreground mb-4">
                                                    <p>Expires: {new Date(Number(request.expires_at) / 1000000).toLocaleDateString()}</p>
                                                </div>

                                                {icpService.getRequestStatusString(request.status) === "Pending" && (
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleResponse(request.id, true)}
                                                            disabled={respondLoading}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            {respondLoading ? (
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                            )}
                                                            Accept Request
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleResponse(request.id, false)}
                                                            disabled={respondLoading}
                                                            className="border-red-500 text-red-600 hover:bg-red-50"
                                                        >
                                                            {respondLoading ? (
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                            )}
                                                            Reject Request
                                                        </Button>
                                                    </div>
                                                )}

                                                {icpService.getRequestStatusString(request.status) === "Accepted" && (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                        <p className="text-sm text-green-700 font-medium">
                                                            ✅ Request Accepted - Transaction will be processed
                                                        </p>
                                                    </div>
                                                )}

                                                {icpService.getRequestStatusString(request.status) === "Rejected" && (
                                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                        <p className="text-sm text-red-700 font-medium">❌ Request Rejected</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
