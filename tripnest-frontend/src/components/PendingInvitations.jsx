import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripMemberAPI } from '../utils/api';

const PendingInvitations = () => {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            const res = await tripMemberAPI.getPending();
            setInvitations(res.data);
        } catch {}
        finally { setLoading(false); }
    };

    const handleAccept = async (tripId) => {
        try {
            await tripMemberAPI.accept(tripId);
            setInvitations(prev =>
                prev.filter(inv =>
                    inv.tripId !== tripId));
        } catch {}
    };

    const handleDecline = async (tripId) => {
        try {
            await tripMemberAPI.decline(tripId);
            setInvitations(prev =>
                prev.filter(inv =>
                    inv.tripId !== tripId));
        } catch {}
    };

    if (loading || invitations.length === 0) return null;

    return (
        <div className="bg-yellow-50 border
                        border-yellow-200 rounded-2xl
                        p-4 mb-6">
            <h3 className="font-semibold text-yellow-800
                           mb-3 flex items-center gap-2">
                <span>✉️</span>
                Trip Invitations ({invitations.length})
            </h3>
            <div className="space-y-3">
                {invitations.map(inv => (
                    <div
                        key={inv.memberId}
                        className="bg-white rounded-xl p-3
                            border border-yellow-100
                            flex items-center
                            justify-between gap-3"
                    >
                        <div>
                            <p className="font-medium
                                text-slate-800 text-sm">
                                {inv.tripTitle}
                            </p>
                            <p className="text-xs
                                text-slate-400 mt-0.5">
                                📍 {inv.destination}
                                {' '}• Invited by{' '}
                                {inv.invitedBy}
                            </p>
                        </div>
                        <div className="flex gap-2
                                        shrink-0">
                            <button
                                onClick={() =>
                                    handleAccept(inv.tripId)}
                                className="bg-green-600
                                    text-white text-xs
                                    px-3 py-1.5 rounded-lg
                                    hover:bg-green-700
                                    transition"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() =>
                                    handleDecline(inv.tripId)}
                                className="border
                                    border-red-200 text-red-500
                                    text-xs px-3 py-1.5
                                    rounded-lg hover:bg-red-50
                                    transition"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingInvitations;