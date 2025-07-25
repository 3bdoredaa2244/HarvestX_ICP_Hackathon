import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';

// Mock canister interface - replace with your actual generated declarations
const canisterInterface = {
  create_token: () => { },
  get_token_info: () => { },
  token_created: () => { },
  get_transactions: () => { },
  is_token_creator: () => { }
};

const HarvestXApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [principal, setPrincipal] = useState('');
  const [loading, setLoading] = useState(true);
  const [actor, setActor] = useState(null);

  // Token creation form state
  const [tokenForm, setTokenForm] = useState({
    token_name: '',
    token_symbol: '',
    token_logo: '',
    initial_supply: ''
  });

  // App state
  const [tokenInfo, setTokenInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);

      const isAuth = await client.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const identity = client.getIdentity();
        setPrincipal(identity.getPrincipal().toString());
        await initActor(identity);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const initActor = async (identity) => {
    try {
      const agent = new HttpAgent({ identity });
      // Replace 'your-canister-id' with your actual canister ID
      const canisterId = process.env.REACT_APP_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai';

      // In a real app, you'd import this from your generated declarations
      // const actor = Actor.createActor(canisterInterface, { agent, canisterId });
      // setActor(actor);

      // For demo purposes, we'll use mock data
      setActor(canisterInterface);
      await loadTokenInfo();
    } catch (error) {
      console.error('Actor initialization failed:', error);
    }
  };

  const login = async () => {
    try {
      await authClient.login({
        identityProvider: process.env.NODE_ENV === 'production'
          ? 'https://identity.ic0.app/#authorize'
          : `http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai#authorize`,
        onSuccess: async () => {
          setIsAuthenticated(true);
          const identity = authClient.getIdentity();
          setPrincipal(identity.getPrincipal().toString());
          await initActor(identity);
        },
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal('');
    setActor(null);
    setTokenInfo(null);
    setTransactions([]);
  };

  const loadTokenInfo = async () => {
    if (!actor) return;
    try {
      // Mock data for demo - replace with actual calls
      const info = {
        token_name: 'HarvestX Token',
        token_symbol: 'HVX',
        token_created: true,
        initial_supply: 1000000,
        decimals: 8
      };
      setTokenInfo(info);

      const txs = [
        {
          tx_type: 'mint',
          amount: 1000000,
          timestamp: Date.now() * 1000000,
          memo: 'Initial token creation'
        }
      ];
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to load token info:', error);
    }
  };

  const createToken = async () => {
    if (!actor) return;
    setIsCreating(true);

    try {
      const args = {
        token_name: tokenForm.token_name,
        token_symbol: tokenForm.token_symbol,
        token_logo: tokenForm.token_logo || 'https://example.com/harvestx-logo.png',
        initial_supply: parseInt(tokenForm.initial_supply)
      };

      // Mock success for demo
      setTimeout(() => {
        setTokenInfo({
          ...args,
          token_created: true,
          decimals: 8
        });
        setIsCreating(false);
        alert('Token created successfully!');
      }, 2000);

    } catch (error) {
      console.error('Token creation failed:', error);
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Loading HarvestX...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-green-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🌾</span>
                </div>
                <h1 className="text-2xl font-bold text-green-800">HarvestX</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Login Section */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 mx-4">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🌾</span>
              </div>
              <h2 className="text-3xl font-bold text-green-800 mb-2">Welcome to HarvestX</h2>
              <p className="text-green-600">Decentralized marketplace for everyday products</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={login}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🔐 Sign in with Internet Identity
              </button>

              <p className="text-sm text-center text-gray-600">
                Secure authentication powered by the Internet Computer
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
              <h1 className="text-2xl font-bold text-green-800">HarvestX</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-green-700">
                <span className="font-medium">Principal:</span>
                <span className="ml-2 font-mono text-xs bg-green-100 px-2 py-1 rounded">
                  {principal.slice(0, 8)}...{principal.slice(-4)}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!tokenInfo?.token_created ? (
          /* Token Creation Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🪙</span>
                </div>
                <h2 className="text-3xl font-bold text-green-800 mb-2">Create Your Token</h2>
                <p className="text-green-600">Launch your token on the HarvestX platform</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">Token Name</label>
                  <input
                    type="text"
                    value={tokenForm.token_name}
                    onChange={(e) => setTokenForm({ ...tokenForm, token_name: e.target.value })}
                    placeholder="e.g., HarvestX Token"
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">Token Symbol</label>
                  <input
                    type="text"
                    value={tokenForm.token_symbol}
                    onChange={(e) => setTokenForm({ ...tokenForm, token_symbol: e.target.value })}
                    placeholder="e.g., HVX"
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">Token Logo URL (Optional)</label>
                  <input
                    type="url"
                    value={tokenForm.token_logo}
                    onChange={(e) => setTokenForm({ ...tokenForm, token_logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">Initial Supply</label>
                  <input
                    type="number"
                    value={tokenForm.initial_supply}
                    onChange={(e) => setTokenForm({ ...tokenForm, initial_supply: e.target.value })}
                    placeholder="1000000"
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={createToken}
                  disabled={isCreating || !tokenForm.token_name || !tokenForm.token_symbol || !tokenForm.initial_supply}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Token...</span>
                    </div>
                  ) : (
                    '🚀 Create Token'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Token Dashboard */
          <div className="space-y-8">
            {/* Token Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🪙</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-800">{tokenInfo.token_name}</h2>
                    <p className="text-green-600">Symbol: {tokenInfo.token_symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 mb-1">Total Supply</p>
                  <p className="text-3xl font-bold text-green-800">
                    {tokenInfo.initial_supply?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-green-600 mb-1">Decimals</p>
                  <p className="text-xl font-bold text-green-800">{tokenInfo.decimals}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-amber-600 mb-1">Status</p>
                  <p className="text-xl font-bold text-amber-800">Active</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600 mb-1">Transactions</p>
                  <p className="text-xl font-bold text-blue-800">{transactions.length}</p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-green-800 mb-6">Recent Transactions</h3>

              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600">
                            {tx.tx_type === 'mint' ? '🌱' : tx.tx_type === 'transfer' ? '↔️' : '🔥'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-green-800 capitalize">{tx.tx_type}</p>
                          <p className="text-sm text-gray-600">{tx.memo || 'No memo'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-800">{tx.amount?.toLocaleString()} {tokenInfo.token_symbol}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(Number(tx.timestamp) / 1000000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-gray-400">📊</span>
                  </div>
                  <p className="text-gray-600">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HarvestXApp;