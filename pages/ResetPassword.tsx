import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your email for password reset instructions');
    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="mx-auto h-12 w-12 text-emerald-400" />
          <h2 className="mt-6 text-3xl font-bold text-white">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email address and we'll send you instructions
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg shadow-xl p-8">
          {error && (
            <div className="mb-4 p-4 rounded bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-4 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400">
              <Mail size={20} />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send reset instructions'}
            </button>

            <div className="text-center">
              <span className="text-gray-400 text-sm">
                Remember your password?{' '}
                <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}