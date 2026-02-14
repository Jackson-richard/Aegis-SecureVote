import React from 'react';
import { Shield, Lock, Fingerprint, Database, Server, Smartphone, Eye, Clock, AlertTriangle, CheckCircle, Smartphone as SmartphoneIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const SecurityExplainer = () => {
    return (
        <div className="mt-16 space-y-16 text-gray-300">
            {/* Architecture Diagram */}
            <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                    <Database className="w-8 h-8 text-indigo-400" />
                    <h2 className="text-2xl font-bold text-white">System Architecture & Data Flow</h2>
                </div>

                <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 p-4">
                    {/* User Step */}
                    <div className="flex flex-col items-center text-center z-10 w-full md:w-auto">
                        <div className="bg-blue-500/10 p-4 rounded-full border border-blue-500/30 mb-3">
                            <Smartphone className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-white mb-1">User Device</h3>
                        <p className="text-xs text-gray-400 max-w-[150px]">QR Login & Choice</p>
                    </div>

                    {/* Arrow 1 */}
                    <div className="hidden md:flex flex-1 h-0.5 bg-gray-700 relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full text-xs text-gray-500 pb-2">JWT Auth</div>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 border-t-4 border-b-4 border-l-8 border-transparent border-l-gray-700"></div>
                    </div>

                    {/* Backend Step */}
                    <div className="flex flex-col items-center text-center z-10 w-full md:w-auto">
                        <div className="bg-indigo-500/10 p-4 rounded-full border border-indigo-500/30 mb-3">
                            <Server className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-white mb-1">Secure Backend</h3>
                        <p className="text-xs text-gray-400 max-w-[150px]">Eligibility Check</p>
                    </div>

                    {/* Arrow 2 */}
                    <div className="hidden md:flex flex-1 h-0.5 bg-gray-700 relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full text-xs text-gray-500 pb-2">Vote Signing</div>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 border-t-4 border-b-4 border-l-8 border-transparent border-l-gray-700"></div>
                    </div>

                    {/* Wallet Step */}
                    <div className="flex flex-col items-center text-center z-10 w-full md:w-auto">
                        <div className="bg-purple-500/10 p-4 rounded-full border border-purple-500/30 mb-3">
                            <Lock className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="font-bold text-white mb-1">Wallet Binding</h3>
                        <p className="text-xs text-gray-400 max-w-[150px]">MetaMask Sig (SHA-256)</p>
                    </div>

                    {/* Arrow 3 */}
                    <div className="hidden md:flex flex-1 h-0.5 bg-gray-700 relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full text-xs text-gray-500 pb-2">Proof Gen</div>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 border-t-4 border-b-4 border-l-8 border-transparent border-l-gray-700"></div>
                    </div>

                    {/* Verification Step */}
                    <div className="flex flex-col items-center text-center z-10 w-full md:w-auto">
                        <div className="bg-green-500/10 p-4 rounded-full border border-green-500/30 mb-3">
                            <Shield className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="font-bold text-white mb-1">Verification</h3>
                        <p className="text-xs text-gray-400 max-w-[150px]">Immutable Audit Log</p>
                    </div>
                </div>
            </section>

            {/* Threat Model */}
            <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-white">Threat Model & Mitigations</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="p-4 text-gray-400 font-medium uppsercase text-sm tracking-wider">Potential Threat</th>
                                <th className="p-4 text-gray-400 font-medium uppsercase text-sm tracking-wider">System Mitigation</th>
                                <th className="p-4 text-gray-400 font-medium uppsercase text-sm tracking-wider">Mechanism</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            <tr className="hover:bg-gray-800/30 transition-colors">
                                <td className="p-4 text-red-300 font-medium">QR Code Theft / Misuse</td>
                                <td className="p-4 text-gray-300">Wallet Binding</td>
                                <td className="p-4 text-gray-500 text-sm">Votes must be signed by the specific wallet bound to the Student ID.</td>
                            </tr>
                            <tr className="hover:bg-gray-800/30 transition-colors">
                                <td className="p-4 text-red-300 font-medium">Replay Attacks (Double Voting)</td>
                                <td className="p-4 text-gray-300">One-Vote Enforcement</td>
                                <td className="p-4 text-gray-500 text-sm">Backend rejects signatures from wallets that have already voted in the active election.</td>
                            </tr>
                            <tr className="hover:bg-gray-800/30 transition-colors">
                                <td className="p-4 text-red-300 font-medium">Database Tampering</td>
                                <td className="p-4 text-gray-300">Cryptographic Proofs</td>
                                <td className="p-4 text-gray-500 text-sm">Any change to the Proof ID breaks the SHA-256 hash chain, alerting verification.</td>
                            </tr>
                            <tr className="hover:bg-gray-800/30 transition-colors">
                                <td className="p-4 text-red-300 font-medium">Late / Early Voting</td>
                                <td className="p-4 text-gray-300">Time Window Lock</td>
                                <td className="p-4 text-gray-500 text-sm">Smart contract logic (simulated) enforces rigid election start/end times.</td>
                            </tr>
                            <tr className="hover:bg-gray-800/30 transition-colors">
                                <td className="p-4 text-red-300 font-medium">Impersonation</td>
                                <td className="p-4 text-gray-300">Digital Signatures</td>
                                <td className="p-4 text-gray-500 text-sm">Only the holder of the private key (Wallet) can generate a valid vote signature.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Replay Attack Info */}
                <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Fingerprint className="w-6 h-6 text-pink-400" />
                        <h3 className="text-xl font-bold text-white">Replay Attack Prevention</h3>
                    </div>
                    <p className="text-sm leading-relaxed mb-4">
                        A common vulnerability in digital voting is a "replay attack," where a valid vote packet is intercepted and resent to cast multiple votes.
                    </p>
                    <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50">
                        <h4 className="text-white font-bold text-sm mb-2">How We Stop It:</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span><strong>Unique Nonce:</strong> Each vote transaction includes a timestamp and unique nonce.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span><strong>State Tracking:</strong> The backend tracks `hasVoted` status for every bound wallet address.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Scalability Info */}
                <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-xl font-bold text-white">System Scalability</h3>
                    </div>
                    <p className="text-sm leading-relaxed mb-4">
                        High-throughput voting requires minimal improved latency. We achieve this by offloading cryptographic work to the client.
                    </p>
                    <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50">
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <SmartphoneIcon className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                                <span><strong>Client-Side Signing:</strong> No heavy crypto load on server.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                                <span><strong>Constant-Time Verification:</strong> O(1) complexity for checking any individual vote proof.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Database className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                                <span><strong>Batch Commit:</strong> Votes are batched before final commit, reducing database lock contention.</span>
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SecurityExplainer;
