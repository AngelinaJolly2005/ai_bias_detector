import { useState } from 'react';
import { ShieldAlert, FileText, Activity, Users, Send, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { runAudit } from './services/gemini';
import { AuditData, ApprovalRates } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [data, setData] = useState<AuditData>({
    ratio: 0.72,
    status: 'Flagged',
    rates: {
      'Majority Group': 0.85,
      'Minority Group A': 0.61,
      'Minority Group B': 0.58,
      'Single Females': 0.52
    }
  });

  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await runAudit(data);
      setReport(result || 'No report generated.');
    } catch (err) {
      console.error(err);
      setError('Failed to generate audit report. Please check your API key and network.');
    } finally {
      setLoading(false);
    }
  };

  const updateRate = (group: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setData(prev => ({
        ...prev,
        rates: {
          ...prev.rates,
          [group]: numValue
        }
      }));
    }
  };

  const addGroup = () => {
    const name = prompt('Enter group name:');
    if (name && !data.rates[name]) {
      setData(prev => ({
        ...prev,
        rates: {
          ...prev.rates,
          [name]: 0.5
        }
      }));
    }
  };

  const removeGroup = (group: string) => {
    setData(prev => {
      const newRates = { ...prev.rates };
      delete newRates[group];
      return { ...prev, rates: newRates };
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-12 border-b-2 border-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-6 h-6" />
            <span className="font-mono text-xs uppercase tracking-widest opacity-60">Internal Audit / Ethics Division</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight">AI Ethics Auditor</h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs uppercase opacity-60">System Version 2.5.4-B</p>
          <p className="font-mono text-xs uppercase opacity-60">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-8">
          <section className="dashboard-card p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-black/10 pb-2">
              <Activity className="w-4 h-4" />
              <h2 className="font-serif italic text-xl">Audit Parameters</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="col-header block mb-2">Fairness Score (Impact Ratio)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={data.ratio}
                  onChange={(e) => setData(prev => ({ ...prev, ratio: parseFloat(e.target.value) }))}
                  className="w-full bg-transparent border-b border-black p-2 font-mono text-2xl focus:outline-none focus:bg-black/5"
                />
                <p className="text-[10px] font-mono mt-1 opacity-50 uppercase tracking-tighter">Threshold: 0.80 (Four-Fifths Rule)</p>
              </div>

              <div>
                <label className="col-header block mb-2">Audit Status</label>
                <select 
                  value={data.status}
                  onChange={(e) => setData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-transparent border-b border-black p-2 font-mono text-lg focus:outline-none focus:bg-black/5 appearance-none"
                >
                  <option value="Compliant">Compliant</option>
                  <option value="Flagged">Flagged</option>
                  <option value="Critical Failure">Critical Failure</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>
            </div>
          </section>

          <section className="dashboard-card p-6">
            <div className="flex items-center justify-between mb-6 border-b border-black/10 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <h2 className="font-serif italic text-xl">Approval Rates</h2>
              </div>
              <button 
                onClick={addGroup}
                className="text-[10px] font-mono uppercase bg-black text-white px-2 py-1 hover:opacity-80"
              >
                + Add Group
              </button>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-2 mb-2 px-2">
                <span className="col-span-7 col-header">Group Identifier</span>
                <span className="col-span-3 col-header">Rate</span>
                <span className="col-span-2"></span>
              </div>
              {Object.entries(data.rates).map(([group, rate]) => (
                <div key={group} className="data-row grid grid-cols-12 gap-2 items-center group">
                  <span className="col-span-7 font-medium">{group}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={rate}
                    onChange={(e) => updateRate(group, e.target.value)}
                    className="col-span-3 bg-transparent border-b border-black/20 p-1 font-mono text-sm focus:outline-none focus:border-black"
                  />
                  <button 
                    onClick={() => removeGroup(group)}
                    className="col-span-2 text-[10px] font-mono text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    DEL
                  </button>
                </div>
              ))}
            </div>
          </section>

          <button 
            onClick={handleRunAudit}
            disabled={loading}
            className="w-full btn-brutal flex items-center justify-center gap-2 py-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Audit...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Ethics Report
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7">
          <div className="dashboard-card min-h-[600px] p-8 relative overflow-hidden">
            {/* Background watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
              <ShieldAlert className="w-[400px] h-[400px]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8 border-b border-black/10 pb-4">
                <FileText className="w-5 h-5" />
                <h2 className="font-serif italic text-2xl">Auditor's Formal Report</h2>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-800 text-sm">System Error</h3>
                    <p className="text-red-700 text-xs mt-1">{error}</p>
                  </div>
                </div>
              )}

              {!report && !loading && !error && (
                <div className="flex flex-col items-center justify-center h-[400px] text-center opacity-40">
                  <Activity className="w-12 h-12 mb-4" />
                  <p className="font-serif italic text-lg">Awaiting audit parameters for analysis...</p>
                  <p className="font-mono text-[10px] uppercase mt-2 tracking-widest">Run audit to generate findings</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-6"></div>
                  <p className="font-serif italic text-xl animate-pulse">Analyzing model weights and impact ratios...</p>
                  <p className="font-mono text-[10px] uppercase mt-2 tracking-widest">Consulting ethical framework</p>
                </div>
              )}

              {report && !loading && (
                <div className="markdown-body animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <ReactMarkdown>{report}</ReactMarkdown>
                  
                  <div className="mt-12 pt-8 border-t border-black/10 flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] uppercase opacity-40">Digital Signature Verified</p>
                      <div className="h-12 w-48 border-b border-black/20 flex items-end pb-1">
                        <span className="font-serif italic text-xl opacity-80">S. Ethics Auditor</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] uppercase opacity-40">Classification</p>
                      <p className="font-mono text-xs font-bold text-red-600">STRICTLY CONFIDENTIAL</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-black/10 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-40">
          Global Banking AI Ethics Compliance Tool &copy; 2026 / All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
