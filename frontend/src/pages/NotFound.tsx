import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-[#E6F6CA] rounded-full flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-12 h-12 text-[#3B8524]" />
        </div>
        <h1 className="text-6xl font-bold text-[#111111] mb-2">404</h1>
        <p className="text-xl text-gray-500 mb-8">Page not found</p>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#3B8524] text-white rounded-full font-medium hover:bg-[#2d6b1b] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
