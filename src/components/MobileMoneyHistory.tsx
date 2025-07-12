
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Search, Filter, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import CurrencyDisplay from './CurrencyDisplay';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  status: string;
}

const MobileMoneyHistory: React.FC = () => {
  const { transactions } = useWallet();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mobile_money_transfer' | 'deposit' | 'withdrawal'>('all');

  useEffect(() => {
    let filtered = transactions.filter(transaction => 
      transaction.type.includes('mobile_money') || 
      transaction.type === 'deposit' || 
      transaction.type === 'withdrawal'
    );

    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterType]);

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'mobile_money_transfer' || amount < 0) {
      return <ArrowUpRight className="h-5 w-5 text-red-500" />;
    }
    return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (type === 'mobile_money_transfer' || amount < 0) {
      return 'text-red-600';
    }
    return 'text-green-600';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { 
        icon: CheckCircle, 
        className: 'bg-green-100 text-green-800 border-green-200',
        label: 'Completed'
      },
      pending: { 
        icon: Clock, 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Pending'
      },
      failed: { 
        icon: XCircle, 
        className: 'bg-red-100 text-red-800 border-red-200',
        label: 'Failed'
      }
    };

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1 font-medium`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTransactionTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'mobile_money_transfer': 'Transfer',
      'deposit': 'Deposit',
      'withdrawal': 'Withdrawal'
    };
    return typeMap[type] || type.replace('_', ' ');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <History className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Transaction History</CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              View and manage your mobile money and wallet transaction history
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enhanced Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-full sm:w-48 h-12 border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mobile_money_transfer">Transfers</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Enhanced Transaction List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your mobile money transactions will appear here'
                }
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </p>
                <div className="text-sm text-gray-500">
                  Latest transactions first
                </div>
              </div>
              
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <Card key={transaction.id} className="border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gray-50 rounded-xl border">
                            {getTransactionIcon(transaction.type, transaction.amount)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {getTransactionTypeDisplay(transaction.type)}
                              </h4>
                              {getStatusBadge(transaction.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 max-w-md">
                              {transaction.description || 'No description provided'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {format(new Date(transaction.created_at), 'MMM dd, yyyy • HH:mm')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                            {transaction.amount > 0 ? '+' : ''}
                            <CurrencyDisplay 
                              amount={Math.abs(transaction.amount) * 130} 
                              showToggle={false} 
                            />
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Transaction ID: {transaction.id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileMoneyHistory;
