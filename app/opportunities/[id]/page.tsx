'use client';

import { useState, useEffect, use } from 'react';
import Header from '@/components/layout/Header';
import type { Opportunity } from '@/types';
import Link from 'next/link';

export default function OpportunityDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchOpp() {
      try {
        const res = await fetch(`/api/opportunities/${unwrappedParams.id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Opportunity not found');
          throw new Error('Failed to load opportunity');
        }
        const data = await res.json();
        setOpp(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchOpp();
  }, [unwrappedParams.id]);

  const handleSave = async () => {
    if (!opp) return;
    setSaving(true);
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: opp.id }),
      });
      if (res.ok) {
        setSaved(true);
      } else if (res.status === 409) {
        setSaved(true); // already saved
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <div className="max-w-4xl mx-auto p-8 animate-pulse mt-10">
          <div className="h-8 bg-white/10 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-1/4 mb-8"></div>
          <div className="h-32 bg-white/10 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !opp) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <Header />
        <h1 className="text-3xl font-bold mb-4">Oops!</h1>
        <p className="text-slate-400">{error || 'Not found'}</p>
        <Link href="/" className="mt-6 text-indigo-400 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isExpired =
    opp.deadline && new Date(opp.deadline).getTime() < new Date().getTime();

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <Link
          href="/"
          className="inline-block mb-6 text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </Link>

        {/* Header Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10 mb-8 backdrop-blur-sm relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4">
                {opp.category?.replace(/_/g, ' ')}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
                {opp.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                {opp.organization && (
                  <span className="flex items-center gap-1.5">
                    🏢 {opp.organization}
                  </span>
                )}
                {opp.country && (
                  <span className="flex items-center gap-1.5">
                    📍 {opp.country} {opp.region ? `(${opp.region})` : ''}
                  </span>
                )}
                {opp.remote_type && (
                  <span className="flex items-center gap-1.5 capitalize">
                    🌐 {opp.remote_type}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-3 min-w-[200px]">
              {opp.application_link ? (
                <a
                  href={opp.application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-center transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                  Apply Now
                </a>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 bg-slate-800 text-slate-500 rounded-xl font-semibold cursor-not-allowed"
                >
                  No Link Available
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saved || saving}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saved ? '✅ Saved to Tracker' : saving ? 'Saving...' : '⭐ Save Opportunity'}
              </button>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">
                Description
              </h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {opp.description || 'No description provided.'}
              </div>
            </section>

            {opp.eligibility && (
              <section>
                <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">
                  Eligibility Criteria
                </h2>
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {opp.eligibility}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {opp.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-sm"
                  >
                    #{tag}
                  </span>
                ))}
                {!opp.tags?.length && (
                  <span className="text-slate-500 text-sm">No tags</span>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Key Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Deadline</p>
                  <p
                    className={`font-medium ${
                      isExpired ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    {opp.deadline
                      ? new Date(opp.deadline).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Not specified'}
                  </p>
                  {isExpired && (
                    <p className="text-xs text-red-500 mt-1">This opportunity has expired.</p>
                  )}
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Funding / Value</p>
                  <p className="font-medium text-emerald-400">
                    {opp.funding_amount || 'Not specified'}
                  </p>
                </div>
                {opp.application_fee && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Application Fee</p>
                    <p className="font-medium text-white">{opp.application_fee}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Eligibility Highlights
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      opp.student_eligible ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    🎓
                  </span>
                  <span className={opp.student_eligible ? 'text-slate-300' : 'text-slate-500'}>
                    Student Eligible
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      opp.women_founder_friendly ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    ♀
                  </span>
                  <span className={opp.women_founder_friendly ? 'text-slate-300' : 'text-slate-500'}>
                    Women Friendly
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      opp.indian_applicant_eligible ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    🇮🇳
                  </span>
                  <span className={opp.indian_applicant_eligible ? 'text-slate-300' : 'text-slate-500'}>
                    India Eligible
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
