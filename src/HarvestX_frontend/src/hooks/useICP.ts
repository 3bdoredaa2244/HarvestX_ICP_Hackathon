import { useState, useEffect, useCallback } from 'react';
import { icpService, InvestmentOffer, PlatformStats, CreateOfferRequest, UserProfile, RegisterUserRequest, CreateInvestmentRequest, InvestmentRequest, RespondToRequestRequest } from '@/services/icpService';

export const useICPOffers = () => {
  const [offers, setOffers] = useState<InvestmentOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await icpService.getAvailableOffers();
      setOffers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return { offers, loading, error, refetch: fetchOffers };
};

export const useICPStats = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await icpService.getPlatformStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};

export const useCreateOffer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOffer = async (offerData: CreateOfferRequest): Promise<InvestmentOffer | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await icpService.createAgriculturalOffer(offerData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer');
      console.error('Error creating offer:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createOffer, loading, error };
};

export const useICPHealth = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await icpService.healthCheck();
      setIsHealthy(response === 'OK' || response.includes('healthy'));
    } catch (err) {
      setIsHealthy(false);
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return { isHealthy, loading, refetch: checkHealth };
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await icpService.getCurrentUser();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      console.error('Error fetching current user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, error, refetch: fetchUser };
};

export const useRegisterUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (req: RegisterUserRequest): Promise<UserProfile | null> => {
    try {
      setLoading(true);
      setError(null);
      const user = await icpService.registerUser(req);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register user');
      console.error('Error registering user:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};

// New hooks for investment requests
export const useCreateInvestmentRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = useCallback(async (requestData: CreateInvestmentRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await icpService.createInvestmentRequest(requestData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create investment request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createRequest, loading, error };
};

export const useInvestorRequests = () => {
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await icpService.getInvestorRequests();
      setRequests(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch investor requests';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, refetch: fetchRequests };
};

export const useFarmerOffers = () => {
  const [offers, setOffers] = useState<InvestmentOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await icpService.getFarmerOffers();
      setOffers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch farmer offers';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return { offers, loading, error, refetch: fetchOffers };
};

export const useRequestsForOffer = (offerId: string) => {
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!offerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await icpService.getRequestsForOffer(offerId);
      setRequests(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch requests for offer';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, refetch: fetchRequests };
};

export const useRespondToRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const respond = useCallback(async (requestData: RespondToRequestRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await icpService.respondToInvestmentRequest(requestData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to respond to request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { respond, loading, error };
};