import {ethers} from 'ethers';
import { useState } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import Candidates from './pages/Candidates';
import Verify from './pages/Verify';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [walletAddress, setWalletAddress] = useState("");
const [signature, setSignature] = useState("");
const [message, setMessage] = useState("");

const connectWallet = async () => {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  setWalletAddress(accounts[0]);
};

  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
        <Navbar
  connectWallet={connectWallet}
  walletAddress={walletAddress}
/>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col justify-start md:justify-center w-full">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/results" element={<Results />} />
            <Route path="/verify" element={<Verify />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


export default App;
