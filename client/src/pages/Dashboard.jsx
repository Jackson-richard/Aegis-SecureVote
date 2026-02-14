import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, LogOut, Wallet, Clock, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [binding, setBinding] = useState(false);
    const [message, setMessage] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [electionStatus, setElectionStatus] = useState('LOADING');
    const [demoMode, setDemoMode] = useState(false);
    const [realStatus, setRealStatus] = useState('');

    const [walletAddress, setWalletAddress] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isBound, setIsBound] = useState(false);

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
        checkElectionStatus();
        checkBindingStatus();
    }, [token, studentId, navigate]);

    const checkElectionStatus = async () => {
        try {
            const baseUrl = `http://${window.location.hostname}:5000`;
            const response = await axios.get(`${baseUrl}/api/status`);

            const { status, demoMode } = response.data;
            setRealStatus(status);
            setDemoMode(demoMode);

            if (demoMode) {
                setElectionStatus('ONGOING');
            } else {
                setElectionStatus(status);
            }
        } catch (error) {
            console.error(error);
            setElectionStatus('CLOSED');
        }
    };

    const checkBindingStatus = async () => {
        try {
            const baseUrl = `http://${window.location.hostname}:5000`;
            const response = await axios.post(`${baseUrl}/api/auth/verify-qr`, { studentId, token });
            if (response.data.valid && response.data.student.walletBound) {
                setIsBound(true);
                setWalletAddress(response.data.student.walletAddress);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchCandidates = async () => {
        try {
            const baseUrl = `http://${window.location.hostname}:5000`;
            const response = await axios.get(`${baseUrl}/api/candidates`);
            setCandidates(response.data);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: "Failed to load candidates." });
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            setMessage({ type: 'error', text: "MetaMask not detected. Please install a wallet." });
            return;
        }
        setIsConnecting(true);
        try {
            const { ethers } = await import('ethers');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setWalletAddress(address);

            if (isBound && address.toLowerCase() !== walletAddress?.toLowerCase()) {
                setMessage({ type: 'error', text: "Connected wallet does not match the bound wallet for this student." });
            } else {
                setMessage({ type: 'success', text: "Wallet connected." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Failed to connect wallet." });
        } finally {
            setIsConnecting(false);
        }
    };

    const handleBindWallet = async () => {
        if (!walletAddress) return;
        setBinding(true);
        setMessage(null);

        try {
            const { ethers } = await import('ethers');
            const nonce = crypto.randomUUID();
            const timestamp = new Date().toISOString();
            const message = `BIND_WALLET\nstudentId=${studentId}\ntimestamp=${timestamp}\nnonce=${nonce}`;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const signature = await signer.signMessage(message);

            const baseUrl = `http://${window.location.hostname}:5000`;
            const response = await axios.post(`${baseUrl}/api/auth/bind-wallet`, {
                studentId,
                token,
                walletAddress,
                message,
                signature
            });

            if (response.data.success) {
                setIsBound(true);
                setMessage({ type: 'success', text: "Wallet successfully bound to Student ID!" });
            }
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.message || 'Wallet binding failed';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setBinding(false);
        }
    };

    const handleVote = async (candidateId) => {
        setMessage(null);

        if (!studentId || !token) {
            setMessage({ type: 'error', text: 'Authentication missing. Please scan again.' });
            return;
        }

        if (!walletAddress) {
            setMessage({ type: 'error', text: 'Please connect your wallet.' });
            return;
        }

        if (!isBound) {
            setMessage({ type: 'error', text: 'You must bind your wallet before voting.' });
            return;
        }

        if (electionStatus !== 'ONGOING') {
            setMessage({ type: 'error', text: 'Election is not currently active.' });
            return;
        }

        setVoting(true);

        try {
            const timestamp = new Date().toISOString();
            const { ethers } = await import('ethers');
            const nonce = crypto.randomUUID();

            const message = `VOTE_CAST\nstudentId=${studentId}\ncandidateId=${candidateId}\ntimestamp=${timestamp}\nnonce=${nonce}`;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const signature = await signer.signMessage(message);

            const baseUrl = `http://${window.location.hostname}:5000`;
            const payload = {
                studentId,
                token,
                candidateId,
                message,
                signature,
                walletAddress
            };

            const response = await axios.post(`${baseUrl}/api/cast`, payload);

            if (response.data.success) {
                setMessage({
                    type: 'success',
                    text: 'Vote confirmed! Thank you for voting.',
                    proofId: response.data.proofId
                });
                setHasVoted(true);
            }

        } catch (error) {
            console.error(error);
            if (error.code === 4001 || error.info?.error?.code === 4001) {
                setMessage({ type: 'error', text: 'Signature rejected. Vote processing cancelled.' });
            } else {
                const errMsg = error.response?.data?.message || 'Voting failed';
                setMessage({ type: 'error', text: errMsg });
                if (error.response?.status === 403 && errMsg.includes("Double voting")) {
                    setHasVoted(true);
                }
            }
        } finally {
            setVoting(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const copyProofToClipboard = () => {
        if (message?.proofId) {
            navigator.clipboard.writeText(message.proofId);
            alert("Proof ID copied to clipboard!");
        }
    };

    const getStatusBadge = () => {
        if (demoMode) {
            return (
                <div className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Clock className="w-4 h-4" />
                    Demo Mode Active
                </div>
            );
        }

        switch (realStatus) {
            case 'ONGOING':
                return (
                    <div className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30">
                        <Clock className="w-4 h-4" />
                        Election Live
                    </div>
                );
            case 'UPCOMING':
                return (
                    <div className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <Clock className="w-4 h-4" />
                        Election Upcoming
                    </div>
                );
            default:
                return (
                    <div className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30">
                        <Clock className="w-4 h-4" />
                        Election Closed
                    </div>
                );
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading election data...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Hello, {studentName}</h1>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                        <span>ID: {studentId}</span>
                        {isBound ? (
                            <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full text-xs">
                                <Wallet className="w-3 h-3" /> Bound
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full text-xs">
                                <AlertCircle className="w-3 h-3" /> Unbound
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {getStatusBadge()}
                    <button
                        onClick={handleLogout}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>

            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 mb-4">
                    {hasVoted ? "Voting Complete" :
                        !isBound ? "Identity Setup" :
                            "Cast Your Vote"}
                </h1>
                <p className="text-gray-400 text-lg">
                    {hasVoted ? "Your vote has been securely recorded." :
                        !isBound ? "Bind your wallet to your Student ID to enable voting." :
                            "Select a candidate below. This action is irreversible."}
                </p>

                {!hasVoted && (
                    <div className="mt-8 flex flex-col items-center gap-4">
                        {!walletAddress ? (
                            <button
                                onClick={connectWallet}
                                disabled={isConnecting}
                                className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2"
                            >
                                <Wallet className="w-5 h-5" />
                                {isConnecting ? "Connecting..." : "Connect Wallet"}
                            </button>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="text-sm text-gray-400 flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                                </div>

                                {!isBound && (
                                    <button
                                        onClick={handleBindWallet}
                                        disabled={binding}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2"
                                    >
                                        <UserCheck className="w-5 h-5" />
                                        {binding ? "Binding..." : "Bind Wallet to Student ID"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
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
                            <div
                                onClick={copyProofToClipboard}
                                className="mt-2 text-sm bg-black/30 p-2 rounded text-mono break-all cursor-pointer hover:bg-black/50 transition-colors"
                            >
                                <span className="text-gray-400">Proof ID: </span>
                                <span className="text-green-300">{message.proofId}</span>
                                <p className="text-xs text-gray-500 mt-1">Click to copy</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {!hasVoted && isBound && electionStatus === 'ONGOING' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((candidate) => (
                        <motion.div
                            key={candidate.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all shadow-xl"
                        >
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-gray-700 to-gray-800 mb-3 shadow-lg">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=random&color=fff&size=128&font-size=0.4`}
                                        alt={candidate.name}
                                        className="w-full h-full rounded-full object-cover border-4 border-gray-900"
                                    />
                                </div>
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
                                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${voting
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                {voting && <span className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin"></span>}
                                {voting ? 'Processing Vote...' : 'Vote For Candidate'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {(hasVoted || electionStatus === 'CLOSED' || (!isBound && walletAddress && electionStatus === 'ONGOING')) && !hasVoted && electionStatus !== 'ONGOING' && (
                <div className="flex justify-center mt-10">
                    <div className="p-10 bg-gray-900/50 border border-gray-700/50 rounded-2xl flex flex-col items-center">
                        <Clock className="w-16 h-16 text-gray-500 mb-4" />
                        <h2 className="text-2xl font-bold text-white">Election Closed</h2>
                        <p className="text-gray-400 mt-2">Voting is currently not available.</p>
                    </div>
                </div>
            )}

            {hasVoted && (
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
