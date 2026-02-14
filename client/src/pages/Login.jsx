import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ScanLine } from 'lucide-react';
import QRScanner from '../components/QRScanner';

const Login = () => {
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);
    const navigate = useNavigate();

    const handleScanSuccess = async (decodedData) => {
        try {
            const baseUrl = `http://${window.location.hostname}:5000`;

            const { studentId, token } = decodedData;

            if (!studentId || !token) {
                setError("Invalid QR Code structure");
                return;
            }

            const response = await axios.post(`${baseUrl}/api/auth/verify-qr`, {
                studentId,
                token
            });

            if (response.data.valid) {
                const { student } = response.data;
                localStorage.setItem('studentId', student.id);
                localStorage.setItem('token', token);
                localStorage.setItem('studentName', student.name);

                navigate('/dashboard');
            } else {
                setError(response.data.message || "Verification failed");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Verification Error');
        }
    };

    const handleScanError = (errMsg) => {
        if (errMsg === "Invalid QR Format") {
            setError("QR Code must contain valid Student JSON data");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-900/40 to-transparent blur-3xl rounded-full" />
                <div className="absolute top-1/2 left-1/2 w-full h-full bg-gradient-to-tl from-indigo-900/40 to-transparent blur-3xl rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md p-8 backdrop-blur-xl bg-gray-900/60 border border-gray-800/50 rounded-2xl shadow-2xl text-center"
            >
                <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        Secure Vote
                    </h2>
                    <p className="text-gray-400 mt-2">Scan your Identity Token to Vote</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="bg-black/40 p-4 rounded-xl border border-gray-700/50 min-h-[300px] flex items-center justify-center">
                    {!scanning ? (
                        <div className="flex flex-col items-center">
                            <ScanLine className="w-16 h-16 text-indigo-500 mb-4 animate-pulse" />
                            <button
                                onClick={() => setScanning(true)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-lg shadow-indigo-500/30"
                            >
                                Start Camera
                            </button>
                        </div>
                    ) : (
                        <QRScanner
                            onScanSuccess={handleScanSuccess}
                            onScanError={handleScanError}
                        />
                    )}
                </div>

                <p className="text-xs text-gray-500 mt-6">
                    Demo Mode: Ensure you are connected to the campus network.
                </p>

            </motion.div>
        </div>
    );
};

export default Login;
