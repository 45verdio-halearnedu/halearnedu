
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

const CollateralTokenModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border">
        <h3 className="font-semibold text-lg flex items-center mb-2"><Info className="w-4 h-4 mr-2 text-blue-500" />About Collateral Tokenization/Trading</h3>
        <p className="text-sm mb-4">
          If your collateral is eligible, it can be tokenized and traded on our platform for liquidity or portfolio management purposes.
          This opens up additional opportunities for you to manage your risk or earn liquidity premium!
        </p>
        <Button variant="outline" onClick={onClose} className="w-full mt-2">
          Close
        </Button>
      </div>
    </div>
  );
};

const MonetizationInfo: React.FC = () => {
  const [insuranceOptIn, setInsuranceOptIn] = useState(false);
  const [tokenInfoOpen, setTokenInfoOpen] = useState(false);

  return (
    <div className="mb-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Loan Monetization Options</CardTitle>
          <CardDescription>
            To help keep our platform secure and innovative, the following monetization features apply when applying for loans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 1. Processing Fee */}
            <Alert>
              <AlertTitle>
                <span className="font-semibold flex gap-2 items-center">
                  <Badge variant="outline" className="border-blue-300 text-blue-800 bg-blue-50">Processing Fee</Badge>
                  Collateral Verification
                </span>
              </AlertTitle>
              <AlertDescription>
                A small processing fee (e.g., <span className="font-semibold">1.0 USDC</span>) is charged for collateral verification whenever you pledge collateral. This helps cover the cost of secure third-party checks and platform security.
              </AlertDescription>
            </Alert>
            {/* 2. Collateral Insurance */}
            <Alert>
              <AlertTitle>
                <span className="font-semibold flex gap-2 items-center">
                  <Badge variant="outline" className="border-green-300 text-green-800 bg-green-50">NEW</Badge>
                  Collateral Insurance (Optional)
                </span>
              </AlertTitle>
              <div className="flex flex-col md:flex-row md:items-center md:gap-4 mt-2">
                <Switch
                  checked={insuranceOptIn}
                  onCheckedChange={setInsuranceOptIn}
                  id="insurance"
                  className="mr-2"
                />
                <label htmlFor="insurance" className="text-sm">
                  Add insurance for collateral loss for <span className="font-semibold">+2.0 USDC</span> per loan.
                  <span className="block text-xs text-muted-foreground">Highly recommended for risky/volatile assets!</span>
                </label>
              </div>
            </Alert>
            {/* 3. Collateral Tokenization/Trading */}
            <Alert>
              <AlertTitle>
                <span className="font-semibold flex gap-2 items-center">
                  <Badge variant="outline" className="border-purple-300 text-purple-800 bg-purple-50">Advanced</Badge>
                  Collateral Tokenization & Trading
                </span>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => setTokenInfoOpen(true)}>Learn more</Button>
              </AlertTitle>
              <AlertDescription>
                Tokenize eligible digital assets as collateral, making it possible to trade or access new liquidity. <span className="block text-xs text-muted-foreground">(Coming soon: you'll be notified if your collateral is eligible.)</span>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
      <CollateralTokenModal open={tokenInfoOpen} onClose={() => setTokenInfoOpen(false)} />
    </div>
  );
};

export default MonetizationInfo;
