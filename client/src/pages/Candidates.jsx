import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const Candidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const baseUrl = `http://${window.location.hostname}:5000`;
            const response = await axios.get(`${baseUrl}/api/candidates`);
            setCandidates(response.data);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading candidate profiles...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-12 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-indigo-900/30 rounded-full">
                        <Users className="w-8 h-8 text-indigo-400" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-4">
                    Meet The Candidates
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Get to know the student leaders contesting in this election.
                    Review their profiles and mottos before casting your vote.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {candidates.map((candidate, index) => (
                    <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-all shadow-xl group"
                    >
                        <div className="h-48 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl mb-6 flex flex-col items-center justify-center p-4 border border-gray-700/30 group-hover:bg-gray-800/80 transition-colors">
                            <span className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                {candidate.symbolChar || "👤"}
                            </span>
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Symbol: {candidate.symbol || "Icon"}</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                                    {candidate.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="px-2 py-1 bg-indigo-900/30 text-indigo-300 rounded-md border border-indigo-500/20">
                                        {candidate.department}
                                    </span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-400">{candidate.year}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800">
                                <p className="text-gray-300 italic">"{candidate.moto}"</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Candidates;
