'use client';

import React from 'react';
import { CreditCard, ChevronDown, ChevronUp, Search, Trash2, Plus, Send, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { AdminPageHeader, AdminKpiGrid, AdminToolbar } from './admin-ui';

const SC: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
};

const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export function PayoutsTab({ fetchAll, headers, API_URL }: any) {
  const [summary, setSummary] = React.useState<any[]>([]);
  const [payouts, setPayouts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [selectedKitchen, setSelectedKitchen] = React.useState('');
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);
  const [payoutModal, setPayoutModal] = React.useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryRes, payoutsRes] = await Promise.all([
        fetch(`${API_URL}/admin/payouts-summary`, { headers }),
        fetch(`${API_URL}/admin/payouts?status=pending`, { headers }),
      ]);

      const summaryData = await summaryRes.json();
      const payoutsData = await payoutsRes.json();

      if (summaryData.success) setSummary(summaryData.summary);
      if (payoutsData.success) setPayouts(payoutsData.payouts);
    } catch (error) {
      console.error('Failed to load payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSummary = summary.filter((k: any) => {
    const matchesSearch = !search || 
      k.kitchenName?.toLowerCase().includes(search.toLowerCase()) ||
      k.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      k.ownerPhone?.includes(search);
    
    const matchesKitchen = !selectedKitchen || k.kitchenId === selectedKitchen;
    return matchesSearch && matchesKitchen;
  });

  const totalRevenue = summary.reduce((sum: number, k: any) => sum + k.totalRevenue, 0);
  const totalPaid = summary.reduce((sum: number, k: any) => sum + k.totalPaid, 0);
  const totalPending = summary.reduce((sum: number, k: any) => sum + k.pendingAmount, 0);

  const createPayout = async (kitchenId: string, kitchen: any) => {
    const amount = prompt(`Enter payout amount (Max ₹${kitchen.pendingAmount}):`, String(kitchen.pendingAmount));
    if (!amount || isNaN(Number(amount))) return;

    try {
      const res = await fetch(`${API_URL}/admin/payouts`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitchen: kitchenId,
          amount: Number(amount),
          paymentMethod: 'bank_transfer',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Payout created successfully');
        loadData();
      } else {
        alert('❌ ' + (data.error || 'Failed to create payout'));
      }
    } catch (error) {
      alert('❌ Error creating payout');
    }
  };

  const approvePayout = async (payoutId: string, referenceNumber: string = '') => {
    setProcessingId(payoutId);
    try {
      const res = await fetch(`${API_URL}/admin/payouts/${payoutId}/approve`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceNumber }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Payout approved');
        loadData();
      } else {
        alert('❌ ' + (data.error || 'Failed to approve payout'));
      }
    } catch (error) {
      alert('❌ Error approving payout');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPayout = async (payoutId: string) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    setProcessingId(payoutId);
    try {
      const res = await fetch(`${API_URL}/admin/payouts/${payoutId}/reject`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reason }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Payout rejected');
        loadData();
      } else {
        alert('❌ ' + (data.error || 'Failed to reject payout'));
      }
    } catch (error) {
      alert('❌ Error rejecting payout');
    } finally {
      setProcessingId(null);
    }
  };

  const inputCls = 'w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-100';

  if (loading) {
    return <div className="flex items-center justify-center py-24"><p className="text-slate-400">Loading payouts...</p></div>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Kitchen Payouts" 
        subtitle="Manage and track kitchen owner payments"
        actions={
          <button onClick={loadData} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50">
            🔄 Refresh
          </button>
        }
      />

      {/* KPI Cards */}
      <AdminKpiGrid items={[
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
        { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN')}` },
        { label: 'Pending Payout', value: `₹${totalPending.toLocaleString('en-IN')}` },
        { label: 'Kitchen Count', value: summary.length },
      ]} />

      {/* Search Bar */}
      <AdminToolbar search={search} setSearch={setSearch} searchPlaceholder="Search kitchen or owner..." />

      {/* Kitchens Summary Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h3 className="font-black text-slate-900">All Kitchens Revenue</h3>
          <span className="text-[10px] font-black text-slate-400 px-3 py-1 bg-slate-100 rounded-full">{filteredSummary.length} Kitchens</span>
        </div>

        {filteredSummary.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-400 font-semibold">No kitchens found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-slate-500">Kitchen</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-slate-500">Owner</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase text-slate-500">Revenue</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase text-slate-500">Paid</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase text-slate-500">Pending</th>
                  <th className="text-center px-6 py-4 text-[10px] font-black uppercase text-slate-500">Orders</th>
                  <th className="text-center px-6 py-4 text-[10px] font-black uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSummary.map((kitchen: any) => (
                  <tr key={kitchen.kitchenId} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">{kitchen.kitchenName}</p>
                      <p className="text-[10px] text-slate-400">ID: {kitchen.kitchenId.slice(-6).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-700">{kitchen.ownerName}</p>
                      <p className="text-[10px] text-slate-400">{kitchen.ownerPhone}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="font-black text-slate-900 text-lg">₹{kitchen.totalRevenue.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="font-black text-green-600 text-lg">₹{kitchen.totalPaid.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className={`font-black text-lg ${kitchen.pendingAmount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        ₹{kitchen.pendingAmount.toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <p className="font-bold text-slate-700">{kitchen.orderCount}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => createPayout(kitchen.kitchenId, kitchen)}
                        disabled={kitchen.pendingAmount === 0}
                        className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        💰 Payout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Payouts */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Approvals
          </h3>
          <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full">{payouts.filter(p => p.status === 'pending').length} Awaiting</span>
        </div>

        {payouts.filter(p => p.status === 'pending').length === 0 ? (
          <div className="text-center py-24">
            <CheckCircle className="w-16 h-16 text-green-200 mx-auto mb-4" />
            <p className="text-slate-900 font-black text-lg">All caught up!</p>
            <p className="text-slate-400 text-sm mt-2">No pending payouts to review</p>
          </div>
        ) : (
          <div className="space-y-4 p-8">
            {payouts.filter(p => p.status === 'pending').map((payout: any) => (
              <div key={payout._id} className="border border-amber-100 bg-amber-50 rounded-[1.5rem] p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="font-black text-slate-900 text-lg">{payout.kitchen?.name}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Owner: {payout.kitchen?.ownerName || payout.kitchenOwner?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-amber-600 uppercase">Amount to Pay</p>
                    <p className="font-black text-3xl text-amber-700">₹{payout.amount.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-amber-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Method</p>
                    <p className="font-bold text-slate-700 mt-2">{payout.paymentMethod?.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-amber-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Requested</p>
                    <p className="font-bold text-slate-700 mt-2">{fmt(payout.createdAt)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-amber-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Status</p>
                    <span className={`inline-block text-[10px] font-black px-2 py-1 rounded mt-2 ${SC[payout.status]}`}>
                      {payout.status}
                    </span>
                  </div>
                </div>

                {payout.bankDetails && (
                  <div className="bg-white rounded-lg p-4 border border-amber-100 mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Bank Details</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold">Account Holder</p>
                        <p className="font-black text-slate-700">{payout.bankDetails.accountHolderName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold">Bank</p>
                        <p className="font-black text-slate-700">{payout.bankDetails.bankName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold">Account</p>
                        <p className="font-bold text-slate-700">****{payout.bankDetails.accountNumber?.slice(-4)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold">IFSC</p>
                        <p className="font-bold text-slate-700">{payout.bankDetails.ifscCode}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const ref = prompt('Enter transaction reference number:');
                      if (ref) approvePayout(payout._id, ref);
                    }}
                    disabled={processingId === payout._id}
                    className="flex-1 py-3 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {processingId === payout._id ? '⏳' : '✅'} Approve & Process
                  </button>
                  <button
                    onClick={() => rejectPayout(payout._id)}
                    disabled={processingId === payout._id}
                    className="flex-1 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold text-sm hover:bg-red-100 disabled:opacity-50 transition"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
