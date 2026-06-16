import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Tabs, Button, Spinner, toast } from '@heroui/react';
import { format } from 'date-fns';
import { adminApi } from '@/features/admin/services/adminApi';
import StatusBadge from '@/components/ui/StatusBadge';

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('payments');
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState(null);

  // Fetch Payments
  const { data: paymentsResp, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['admin_payments', page],
    queryFn: () => adminApi.payments({ page, limit: 20 }),
    enabled: activeTab === 'payments',
  });

  // Fetch Payouts
  const { data: payoutsResp, isLoading: isLoadingPayouts } = useQuery({
    queryKey: ['admin_payouts', page],
    queryFn: () => adminApi.payouts({ page, limit: 20 }),
    enabled: activeTab === 'payouts',
  });

  // Process Payout Mutation
  const processPayoutMutation = useMutation({
    mutationFn: (id) => adminApi.processPayout(id, { amount: 0 }),
    onMutate: (id) => setProcessingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin_payouts']);
      toast.success("Payout processed successfully");
      setProcessingId(null);
    },
    onError: () => {
      toast.danger("Failed to process payout");
      setProcessingId(null);
    }
  });

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const renderPagination = (meta) => {
    if (!meta || meta.total_pages <= 1) return null;
    return (
      <div className="flex justify-between items-center px-5 py-4 border-t border-gray-50 bg-gray-50/30">
        <span className="text-sm text-gray-500 font-medium">
          Showing <span className="text-gray-900">{((page - 1) * meta.limit) + 1}</span> to <span className="text-gray-900">{Math.min(page * meta.limit, meta.total)}</span> of <span className="text-gray-900">{meta.total}</span>
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            className="bg-white border shadow-sm font-medium"
            disabled={page === 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="flat"
            className="bg-white border shadow-sm font-medium"
            disabled={page === meta.total_pages}
            onPress={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const payments = paymentsResp?.data || [];
  const payouts = payoutsResp?.data || [];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Financials</h1>
        <p className="text-sm text-gray-500 mt-1">Manage platform payments and provider payouts.</p>
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white w-full">
        <Tabs 
          className="w-full"
          variant="secondary"
          selectedKey={activeTab} 
          onSelectionChange={handleTabChange}
        >
          <Tabs.ListContainer className="bg-gray-50/50">
            <Tabs.List aria-label="Financials Tabs" className="flex gap-6 border-b border-gray-100 px-5 pt-3">
              <Tabs.Tab id="payments" className="pb-3 text-sm font-medium cursor-pointer relative group data-[selected=true]:text-blue-600 text-gray-500 hover:text-gray-900">
                Platform Payments
                <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full hidden group-data-[selected=true]:block" />
              </Tabs.Tab>
              <Tabs.Tab id="payouts" className="pb-3 text-sm font-medium cursor-pointer relative group data-[selected=true]:text-blue-600 text-gray-500 hover:text-gray-900">
                Provider Payouts
                <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full hidden group-data-[selected=true]:block" />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel className="p-0" id="payments">
            <div className="flex flex-col w-full h-full">
              <div className="overflow-x-auto min-h-[400px]">
              {isLoadingPayments ? (
                <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</th>
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.length > 0 ? payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-5 text-sm text-gray-500 font-medium whitespace-nowrap">
                          {format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="py-4 px-5 text-sm font-medium text-gray-900">{payment.client_name || 'N/A'}</td>
                        <td className="py-4 px-5 text-sm text-gray-600">{payment.business_name || 'N/A'}</td>
                        <td className="py-4 px-5 text-sm text-gray-500">{payment.payment_method}</td>
                        <td className="py-4 px-5 text-sm font-semibold text-gray-900 text-right">EGP {payment.amount?.toLocaleString()}</td>
                        <td className="py-4 px-5">
                          <StatusBadge status={payment.status} />
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-gray-400">
                          No payments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {!isLoadingPayments && renderPagination(paymentsResp?.meta)}
          </div>
        </Tabs.Panel>
        
        <Tabs.Panel className="p-0" id="payouts">
          <div className="flex flex-col w-full h-full">
            <div className="overflow-x-auto min-h-[400px]">
              {isLoadingPayouts ? (
                <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</th>
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Manager</th>
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payouts.length > 0 ? payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-5 text-sm text-gray-500 font-medium whitespace-nowrap">
                          {format(new Date(payout.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="py-4 px-5 text-sm font-medium text-gray-900">{payout.business_name || 'N/A'}</td>
                        <td className="py-4 px-5 text-sm text-gray-600">{payout.manager_name || 'N/A'}</td>
                        <td className="py-4 px-5 text-sm font-semibold text-emerald-600 text-right">EGP {payout.amount?.toLocaleString()}</td>
                        <td className="py-4 px-5">
                          <StatusBadge status={payout.status} />
                        </td>
                        <td className="py-4 px-5 text-right">
                          {payout.status === 'PAYOUT_PENDING' && (
                            <Button 
                              size="sm" 
                              color="primary" 
                              className="font-medium shadow-sm"
                              isLoading={processingId === payout.id}
                              onPress={() => processPayoutMutation.mutate(payout.id)}
                            >
                              Process
                            </Button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-gray-400">
                          No payouts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {!isLoadingPayouts && renderPagination(payoutsResp?.meta)}
          </div>
        </Tabs.Panel>
        </Tabs>
      </Card>
    </div>
  );
}
