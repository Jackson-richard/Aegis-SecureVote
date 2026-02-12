import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [message, setMessage] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);

    // Auth State
    const studentName = localStorage.getItem('studentName');
    const studentId = localStorage.getItem('studentId');
    const token = localStorage.getItem('token');

    const navigate = useNavigate();

    useEffect(() => {
        if (!token || !studentId) {
            navigate('/login');
            return;
        }
        fetchCandidates();
        // Here we could check if user already voted via API, but for demo we rely on local storage 
        // + backend rejection if they try again.
    }, [token, studentId, navigate]);

    const fetchCandidates = async () => {
        try {
            const baseUrl = `http://${window.location.hostname}:5000`;
            const response = await axios.get(`${baseUrl}/api/candidates`);
            setCandidates(response.data);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            setMessage({ type: 'error', text: "Failed to load candidates." });
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (candidateId) => {
        setVoting(true);
        setMessage(null);


        const currentStudentId = localStorage.getItem('studentId');
        const currentToken = localStorage.getItem('token');

        console.log("Attempting vote:", { currentStudentId, candidateId });

        if (!currentStudentId || !currentToken) {
            setMessage({ type: 'error', text: 'Authentication missing. Please scan again.' });
            setVoting(false);
            return;
        }

        try {
            const baseUrl = `http://${window.location.hostname}:5000`;
            const payload = {
                studentId: currentStudentId,
                token: currentToken,
                candidateId
            };

            console.log("Sending payload:", payload);

            const response = await axios.post(
                `${baseUrl}/api/cast`,
                payload
            );

            if (response.data.success) {
                console.log("Vote success response:", response.data);
                setMessage({
                    type: 'success',
                    text: 'Vote confirmed! Thank you for voting.',
                    proofId: response.data.proofId // Capture the proof ID
                });
                setHasVoted(true);
            }

        } catch (error) {
            console.error("Vote error:", error);
            const errMsg = error.response?.data?.message || 'Voting failed';
            setMessage({ type: 'error', text: errMsg });

            if (error.response?.status === 403) {
                setHasVoted(true); // If backend says forbidden (already voted), update UI
            }
        } finally {
            setVoting(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading election data...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Hello, {studentName}</h1>
                    <p className="text-gray-400 text-sm">Student ID: {studentId}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>

            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 mb-4">
                    {hasVoted ? "Voting Complete" : "Cast Your Vote"}
                </h1>
                <p className="text-gray-400 text-lg">
                    {hasVoted
                        ? "Your vote has been securely recorded. You may now log out."
                        : "Select a candidate below. This action is irreversible."}
                </p>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl mb-8 flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/50 text-green-200'
                        : 'bg-red-500/10 border border-red-500/50 text-red-200'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <div>
                        <p className="font-bold">{message.text}</p>
                        {message.proofId && (
                            <div className="mt-2 text-sm bg-black/30 p-2 rounded text-mono break-all">
                                <span className="text-gray-400">Proof ID: </span>
                                <span className="text-green-300">{message.proofId}</span>
                                <p className="text-xs text-gray-500 mt-1">Save this ID to verify your vote later.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {!hasVoted ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((candidate) => (
                        <motion.div
                            key={candidate.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all shadow-xl"
                        >
                            <div className="h-40 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl mb-6 flex flex-col items-center justify-center p-4">
                                <span className="text-5xl mb-2">{candidate.symbolChar || "👤"}</span>
                                <div className="flex gap-2 text-xs font-mono text-indigo-300 bg-indigo-900/40 px-3 py-1 rounded-full border border-indigo-500/20">
                                    <span>{candidate.department}</span>
                                    <span>•</span>
                                    <span>{candidate.year}</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 text-center">{candidate.name}</h3>
                            <p className="text-gray-400 text-sm text-center italic mb-6">"{candidate.moto}"</p>

                            <button
                                onClick={() => handleVote(candidate.id)}
                                disabled={voting}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${voting
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    }`}
                            >
                                {voting ? 'Processing...' : 'Vote For Candidate'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex justify-center mt-10">
                    <div className="p-10 bg-gray-900/50 border border-green-500/30 rounded-2xl flex flex-col items-center">
                        <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-white">Thank You!</h2>
                        <p className="text-gray-400 mt-2">Your participation determines the future.</p>
                        {message?.proofId && (
                            <div className="mt-6 text-center max-w-md">
                                <p className="text-sm text-gray-400 mb-2">Your Cryptographic Proof ID:</p>
                                <div className="bg-black/40 border border-gray-700 p-3 rounded-lg break-all text-xs font-mono text-green-400">
                                    {message.proofId}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Use this ID to verify your vote in the public audit log.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
