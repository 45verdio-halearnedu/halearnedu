
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface CurrencyDisplayProps {
  amount: number;
  showToggle?: boolean;
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  showToggle = true, 
  className = "" 
}) => {
  const [showUSD, setShowUSD] = useState(false);
  
  // Ensure amount is a valid number
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  // Convert KES to USD (approximate rate: 1 USD = 130 KES)
  const usdAmount = validAmount / 130;
  const kesAmount = validAmount;
  
  const formatCurrency = (value: number, currency: 'USD' | 'KES') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (!showToggle) {
    return (
      <span className={className}>
        {formatCurrency(kesAmount, 'KES')}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-medium">
        {showUSD ? formatCurrency(usdAmount, 'USD') : formatCurrency(kesAmount, 'KES')}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowUSD(!showUSD)}
        className="h-6 px-2 text-xs"
      >
        {showUSD ? 'KES' : 'USD'}
      </Button>
    </div>
  );
};

export default CurrencyDisplay;
