
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const LoanCalculator = () => {
  const [amount, setAmount] = useState(5000);
  const [duration, setDuration] = useState(12);
  const [interestRate, setInterestRate] = useState(5.2);

  const calculateMonthlyPayment = () => {
    if (amount <= 0 || duration <= 0 || interestRate <= 0) return '0.00';
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = duration;
    const principal = amount;
    if (monthlyRate === 0) return (principal / numPayments).toFixed(2);
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    return monthlyPayment.toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="loan-amount">Loan Amount (USDC)</Label>
          <Input id="loan-amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <Slider value={[amount]} onValueChange={(val) => setAmount(val[0])} max={50000} step={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loan-duration">Duration (Months)</Label>
          <Input id="loan-duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          <Slider value={[duration]} onValueChange={(val) => setDuration(val[0])} max={60} step={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
          <Input id="interest-rate" type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} step="0.1" />
          <Slider value={[interestRate]} onValueChange={(val) => setInterestRate(val[0])} max={20} step={0.1} />
        </div>
        <div className="pt-4">
          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg dark:bg-gray-800">
            <span className="text-lg font-medium">Estimated Monthly Payment</span>
            <span className="text-2xl font-bold text-blue-600">{calculateMonthlyPayment()} USDC</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanCalculator;
