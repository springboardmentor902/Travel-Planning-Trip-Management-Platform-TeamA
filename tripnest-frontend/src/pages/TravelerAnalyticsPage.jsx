
import React from "react";
import Navbar from "../components/Navbar";
import TravelerAnalytics from "../components/TravelerAnalytics";


export default function TravelerAnalyticsPage() {
    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-6 lg:px-8">
                <TravelerAnalytics />
            </main>
        </div>
    );
}
