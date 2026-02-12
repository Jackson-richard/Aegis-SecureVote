import { Link, useNavigate } from 'react-router-dom';
import { Vote, BarChart2, ScanLine, Users, ShieldCheck } from 'lucide-react';

const Navbar = () => {

    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Vote className="h-8 w-8 text-indigo-500" />
                            <span className="text-xl font-bold text-white tracking-tight">SecureVote Demo</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                            <ScanLine className="w-4 h-4" />
                            Scanner
                        </Link>
                        <Link to="/candidates" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                            <Users className="w-4 h-4" />
                            Candidates
                        </Link>
                        <Link to="/verify" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                            <ShieldCheck className="w-4 h-4" />
                            Verify
                        </Link>
                        <Link to="/results" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                            <BarChart2 className="w-4 h-4" />
                            Results
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
