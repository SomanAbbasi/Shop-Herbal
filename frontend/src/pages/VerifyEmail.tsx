import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Leaf, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        toast.success('Email verified successfully!');
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        const errorMsg = err?.response?.data?.error?.message || 'Verification failed. The link may be expired.';
        setMessage(errorMsg);
        toast.error(errorMsg);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="w-8 h-8 text-[#3B8524]" />
          <span className="text-2xl font-bold text-[#111111]">Shop Herbal</span>
        </Link>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-100/50 text-center">
          {status === 'loading' && (
            <div className="py-10">
              <Loader2 className="w-16 h-16 text-[#3B8524] animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[#111111] mb-2">Verifying your email</h1>
              <p className="text-gray-500">Please wait while we verify your account...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-10">
              <CheckCircle2 className="w-16 h-16 text-[#3B8524] mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[#111111] mb-2">Verification Successful!</h1>
              <p className="text-gray-500 mb-8">{message}</p>
              <p className="text-sm text-gray-400 mb-6">Redirecting you to login page...</p>
              <Link
                to="/login"
                className="inline-block px-8 py-3 bg-[#3B8524] text-white rounded-xl font-medium hover:bg-[#2d6b1b] transition-colors shadow-lg shadow-[#3B8524]/20"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-10">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[#111111] mb-2">Verification Failed</h1>
              <p className="text-gray-500 mb-8">{message}</p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/register"
                  className="px-8 py-3 bg-[#3B8524] text-white rounded-xl font-medium hover:bg-[#2d6b1b] transition-colors"
                >
                  Try Registering Again
                </Link>
                <Link to="/login" className="text-sm text-gray-500 hover:text-[#3B8524] font-medium transition-colors">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
