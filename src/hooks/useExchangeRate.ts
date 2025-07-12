
import { useState, useEffect } from 'react';

interface ExchangeRates {
  KES_USD: number;
  lastUpdated: Date;
}

export const useExchangeRate = () => {
  const [rates, setRates] = useState<ExchangeRates>({
    KES_USD: 0.0077, // 1 KES = 0.0077 USD (approximately 130 KES = 1 USD)
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(false);

  const fetchExchangeRates = async () => {
    setLoading(true);
    try {
      // In a real app, you'd fetch from a currency API
      // For demo purposes, using a mock rate with some variation
      const mockRate = 0.0077 + (Math.random() - 0.5) * 0.0002; // Simulate rate fluctuation
      
      setRates({
        KES_USD: mockRate,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Keep existing rates on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
    // Update rates every 5 minutes
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const convertKESToUSD = (kesAmount: number): number => {
    return kesAmount * rates.KES_USD;
  };

  const convertUSDToKES = (usdAmount: number): number => {
    return usdAmount / rates.KES_USD;
  };

  const formatCurrency = (amount: number, currency: 'USD' | 'KES' = 'KES'): string => {
    // Handle undefined, null, or NaN values
    if (amount === undefined || amount === null || isNaN(amount)) {
      amount = 0;
    }
    
    if (currency === 'KES') {
      return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return {
    rates,
    loading,
    convertKESToUSD,
    convertUSDToKES,
    formatCurrency,
    refreshRates: fetchExchangeRates
  };
};
