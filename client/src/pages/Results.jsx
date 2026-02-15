import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Results = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
        const interval = setInterval(fetchResults, 5000); 
        return () => clearInterval(interval);
    }, []);

    const fetchResults = async () => {
        try {
            const baseUrl = `http://${window.location.hostname}:5000`;
            const response = await axios.get(`${baseUrl}/api/candidates`);
            setCandidates(response.data);
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

    if (loading) return <div className="text-center py-20 text-gray-400">Loading results...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400 mb-4">
                    Live Results
                </h1>
                <p className="text-gray-400 text-lg">
                    Real-time aggregated election data.
                </p>
                <div className="mt-4 inline-block px-4 py-1 bg-gray-800 rounded-full text-sm text-gray-400">
                    Total Votes: {totalVotes}
                </div>
            </div>

            <div className="space-y-6">
                {candidates.map((candidate, index) => {
                    const votes = candidate.votes || 0;
                    const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);

                    return (
                        <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 hover:bg-gray-900/60 transition-colors"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-2xl border border-gray-700">
                                        {candidate.symbolChar || "👤"}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            {candidate.name}
                                            <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                                                {candidate.department}
                                            </span>
                                        </h3>
                                        <span className="text-sm text-gray-500">{candidate.moto}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-teal-400">{votes}</span>
                                    <span className="text-gray-400 text-sm ml-1 block">votes</span>
                                </div>
                            </div>

                            <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="absolute h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                                />
                            </div>
                            <div className="text-right mt-1 text-xs text-gray-500 font-mono">{percentage}% of total</div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Results;
