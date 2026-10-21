import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { analyticsAPI, tripAPI } from '../utils/api';
import api from '../utils/api';

const Settlement = () => {
    const { id }    = useParams();
    const navigate  = useNavigate();
    const [settlement, setSettlement] = useState(null);
    const [trip,       setTrip]       = useState(null);
    const [loading,    setLoading]    = useState(true);

    useEffect(() => { fetchData(); }, [id]);

    const fetchData = async () => {
        try {
            const [settleRes, tripRes] = await Promise.all([
                api.get(`/api/trips/${id}/settlement`),
                tripAPI.getById(id),
            ]);
            setSettlement(settleRes.data);
            setTrip(tripRes.data);
        } catch { navigate(`/trips/${id}`); }
        finally  { setLoading(false); }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50"><Navbar />
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-2 border-blue-600
                    border-t-transparent rounded-full animate-spin"/>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50"><Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6
                         pt-24 sm:pt-28 pb-12">

            <button onClick={() => navigate(`/trips/${id}`)}
                className="text-slate-400 text-sm hover:text-slate-600
                           flex items-center gap-1 mb-6">
                ← Back to trip
            </button>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Settlement 💸
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    {trip?.title} — who owes whom
                </p>
            </div>

            {/* Summary */}
            <div className="bg-white border border-slate-200
                            rounded-2xl p-5 mb-5">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">
                        Total Shared Amount
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                        ₹{(settlement?.totalSharedAmount || 0)
                            .toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white border border-slate-200
                            rounded-2xl p-5 mb-5">
                <h3 className="font-semibold text-slate-800 mb-4">
                    Who Pays Whom 💳
                </h3>
                {settlement?.transactions?.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <div className="text-3xl mb-2">✅</div>
                        <p className="text-sm font-medium">
                            All settled up!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {settlement?.transactions?.map((txn, i) => (
                            <div key={i} className="flex items-center
                                justify-between p-4 bg-orange-50
                                border border-orange-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-red-100
                                        text-red-600 rounded-full flex
                                        items-center justify-center
                                        text-sm font-bold">
                                        {txn.fromUserName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold
                                                      text-slate-800">
                                            {txn.fromUserName}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            pays →
                                        </p>
                                    </div>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-lg font-bold
                                                  text-orange-600">
                                        ₹{txn.amount?.toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-sm font-semibold
                                            text-slate-800 text-right">
                                            {txn.toUserName}
                                        </p>
                                        <p className="text-xs text-slate-400
                                                      text-right">
                                            receives
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 bg-green-100
                                        text-green-600 rounded-full flex
                                        items-center justify-center
                                        text-sm font-bold">
                                        {txn.toUserName?.charAt(0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Member Balances */}
            <div className="bg-white border border-slate-200
                            rounded-2xl p-5">
                <h3 className="font-semibold text-slate-800 mb-4">
                    Member Balances
                </h3>
                <div className="space-y-3">
                    {settlement?.memberBalances?.map((mb, i) => (
                        <div key={i} className="flex items-center
                            justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-100
                                    text-blue-700 rounded-full flex
                                    items-center justify-center
                                    font-bold text-sm">
                                    {mb.userName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium
                                                  text-slate-800">
                                        {mb.userName}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Paid: ₹{mb.totalPaid?.toLocaleString()}
                                        {' '}| Owed: ₹{mb.totalOwed?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-bold
                                    ${(mb.netBalance || 0) >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'}`}>
                                    {(mb.netBalance || 0) >= 0
                                        ? `+₹${mb.netBalance?.toLocaleString()}`
                                        : `-₹${Math.abs(mb.netBalance || 0).toLocaleString()}`}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    {(mb.netBalance || 0) >= 0
                                        ? 'to receive'
                                        : 'to pay'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
        </div>
    );
};

export default Settlement;