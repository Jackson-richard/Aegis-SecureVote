import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Clock, ShieldCheck } from 'lucide-react';

const Verify = () => {
    const [proofId, setProofId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!proofId.trim()) return;

        setLoading(true);
        setResult(null);
        setError('');

        try {
            const baseUrl = `http://${window.location.hostname}:5000`;
            const response = await axios.get(`${baseUrl}/api/verify/${proofId}`);

            if (response.data.valid) {
                setResult(response.data);
            } else {
                setError(response.data.message || "Invalid Proof ID");
            }
        } catch (err) {
            console.error("Verification error:", err);
            setError("Failed to connect to verification server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <div className="inline-block p-4 rounded-full bg-indigo-500/10 mb-4 border border-indigo-500/20">
                    <ShieldCheck className="w-12 h-12 text-indigo-400" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Verify Your Vote</h1>
                <p className="text-gray-400">Enter your cryptographic Proof ID to verify your vote was permanently recorded.</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 shadow-xl">
                <form onSubmit={handleVerify} className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={proofId}
                            onChange={(e) => setProofId(e.target.value)}
                            placeholder="Paste your Proof ID here..."
                            className="w-full bg-black/40 border border-gray-700 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                        />
                        <button
                            type="submit"
                            disabled={loading || !proofId}
                            className={`absolute right-2 top-2 bottom-2 px-6 rounded-lg font-bold transition-all ${loading || !proofId
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                }`}
                        >
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </form>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-500/10 border border-green-500/30 rounded-xl p-6"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                            <div>
                                <h3 className="text-xl font-bold text-green-300">Valid Proof Found</h3>
                                <p className="text-green-500/70 text-sm">This action is cryptographically verified.</p>
                            </div>
                        </div>

                        <div className="space-y-3 pl-12 border-l-2 border-green-500/20 ml-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-400">Recorded At:</span>
                                <span className="text-white font-mono">{new Date(result.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <ShieldCheck className="w-4 h-4 text-gray-400" />
                                <span className="text-white font-mono">{result.actionType}</span>
                            </div>
                            {result.walletAddress && (
                                <div className="flex items-center gap-3 text-sm">
                                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-400">Wallet Auth:</span>
                                    <span className="text-green-400 font-mono text-xs break-all">
                                        {result.walletAddress}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-start gap-3 text-sm pt-2">
                                <span className="text-gray-500 text-xs">Proof ID matches immutable audit log.</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-center gap-4"
                    >
                        <XCircle className="w-8 h-8 text-red-400" />
                        <div>
                            <h3 className="text-xl font-bold text-red-300">Verification Failed</h3>
                            <p className="text-red-400/80 text-sm">{error}</p>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-8 text-center text-xs text-gray-600">
                <p>This verification system checks against an immutable append-only audit log.</p>
                <p>No personal data or vote choices are exposed during verification.</p>
            </div>
        </div>
    );
};

export default Verify;
