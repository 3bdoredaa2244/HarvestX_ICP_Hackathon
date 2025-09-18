"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  User,
  Wallet,
  Target,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { useICPOffers, useICPStats, useICPHealth, useInvestorRequests } from "@/hooks/useICP"
import { icpService } from "@/services/icpService"
import { useState } from "react"

const InvestorDashboard = () => {
  const [retryCount, setRetryCount] = useState(0)
  const { offers, loading: offersLoading, error: offersError, refetch: refetchOffers } = useICPOffers()
  const { stats, loading: statsLoading, refetch: refetchStats } = useICPStats()
  const { isHealthy, loading: healthLoading, refetch: refetchHealth } = useICPHealth()
  const {
    requests: myRequests,
    loading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useInvestorRequests()

  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1)
    try {
      await Promise.all([refetchOffers?.(), refetchStats?.(), refetchHealth?.(), refetchRequests?.()])
    } catch (error) {
      console.error("Retry failed:", error)
    }
  }

  const isCertificateError = (error: string) => {
    return (
      error?.toLowerCase().includes("certificate") ||
      error?.toLowerCase().includes("signature") ||
      error?.toLowerCase().includes("verification")
    )
  }

  const featuredOpportunities =
    offers
      ?.filter((offer) => {
        try {
          return icpService.getOfferStatusString?.(offer.status) === "Active"
        } catch {
          return false
        }
      })
      .slice(0, 3) || []

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "Cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getRequestIcon = (status: string) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="h-4 w-4" />
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
      case "Cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const totalInvested =
    myRequests
      ?.filter((req) => {
        try {
          return icpService.getRequestStatusString?.(req.status) === "Accepted"
        } catch {
          return false
        }
      })
      .reduce((sum, req) => sum + req.total_offered, 0) || 0

  const pendingRequests =
    myRequests?.filter((req) => {
      try {
        return icpService.getRequestStatusString?.(req.status) === "Pending"
      } catch {
        return false
      }
    }).length || 0

  const activeInvestments =
    myRequests?.filter((req) => {
      try {
        return icpService.getRequestStatusString?.(req.status) === "Accepted"
      } catch {
        return false
      }
    }).length || 0

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Investor Dashboard</h1>
                <p className="text-muted-foreground">
                  Track your agricultural investments and discover new opportunities on ICP
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">ICP Backend:</span>
              {healthLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Badge
                  variant={isHealthy ? "default" : "destructive"}
                  className={isHealthy ? "bg-success text-success-foreground" : ""}
                >
                  {isHealthy ? "Connected" : "Disconnected"}
                </Badge>
              )}
              {!isHealthy && (
                <Button variant="outline" size="sm" onClick={handleRetry} disabled={healthLoading}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          </div>

          {offersError && isCertificateError(offersError) && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">ICP Connection Issue</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Having trouble connecting to the ICP blockchain. This is usually a temporary issue with certificate
                    verification.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={handleRetry} className="bg-white dark:bg-gray-800">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Retry Connection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="bg-white dark:bg-gray-800"
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-16"></div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-primary">
                    {stats ? Number(stats.total_users).toLocaleString() : "0"}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Offers</CardTitle>
                  <Target className="h-4 w-4 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-16"></div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-success">{stats ? Number(stats.active_offers) : "0"}</div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-16"></div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-warning">
                    {stats ? Number(stats.total_transactions) : "0"}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">ICP Wallet</CardTitle>
                  <Wallet className="h-4 w-4 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">Not Connected</div>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect ICP Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="opportunities">Investment Opportunities</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Featured Opportunities from ICP</h2>
              <Button variant="outline">View All Marketplace</Button>
            </div>

            {offersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading opportunities from ICP blockchain...</span>
              </div>
            ) : offersError ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isCertificateError(offersError) ? "ICP Connection Issue" : "Failed to load opportunities"}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {isCertificateError(offersError)
                    ? "Certificate verification failed. This is usually temporary - please try again."
                    : offersError}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleRetry} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Connection
                  </Button>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Refresh Page
                  </Button>
                </div>
                {retryCount > 0 && <p className="text-sm text-muted-foreground mt-2">Retry attempts: {retryCount}</p>}
              </div>
            ) : featuredOpportunities.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredOpportunities.map((offer) => {
                  const productTypeString = icpService.getProductTypeString?.(offer.product_type) || "Unknown"
                  const qualityGradeString = icpService.getQualityGradeString?.(offer.quality_grade) || "Standard"
                  const statusString = icpService.getOfferStatusString?.(offer.status) || "Unknown"

                  return (
                    <Card
                      key={offer.id}
                      className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {statusString}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {qualityGradeString}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{offer.product_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {offer.farmer.toString().slice(0, 10)}...
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{Number(offer.available_quantity)}kg</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-primary">${offer.price_per_kg.toFixed(2)}/kg</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>Min: ${Number(offer.minimum_investment)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{offer.harvest_date}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/50">
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{offer.description}</p>
                          <Button className="w-full" variant="default">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Invest Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No opportunities available</h3>
                <p className="text-muted-foreground">Check back later for new investment opportunities from farmers.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <h2 className="text-2xl font-bold">My Investment Requests</h2>

            {requestsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading your investment requests...</span>
              </div>
            ) : requestsError ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isCertificateError(requestsError) ? "ICP Connection Issue" : "Failed to load requests"}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {isCertificateError(requestsError)
                    ? "Certificate verification failed. This is usually temporary - please try again."
                    : requestsError}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleRetry} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Connection
                  </Button>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Refresh Page
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests?.map((request) => {
                  const statusString = icpService.getRequestStatusString?.(request.status) || "Unknown"

                  return (
                    <Card key={request.id} className="shadow-md">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              Investment Request
                              <Badge className={getRequestStatusColor(statusString)}>
                                {getRequestIcon(statusString)}
                                {statusString}
                              </Badge>
                            </CardTitle>
                            <CardDescription>Request for Offer ID: {request.offer_id}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              ${request.total_offered.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Number(request.requested_quantity)}kg @ ${request.offered_price_per_kg}/kg
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Message:</p>
                            <p className="text-sm">{request.message}</p>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Created:</span>
                              <span>{new Date(Number(request.created_at) / 1000000).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Expires:</span>
                              <span>{new Date(Number(request.expires_at) / 1000000).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {statusString === "Pending" && (
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm">
                              Edit Request
                            </Button>
                            <Button variant="destructive" size="sm">
                              Cancel Request
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {(!myRequests || myRequests.length === 0) && !requestsLoading && !requestsError && (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No investment requests yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start investing in agricultural opportunities to build your portfolio.
                </p>
                <Button>Explore Opportunities</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default InvestorDashboard
