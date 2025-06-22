import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; 

const RegisterPage = () => {

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // STATE UI
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const registrationData = { fullName, email, password };

    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Something went wrong');
      }

      // Success message, reset form
      setSuccess(responseData.message);
      setFullName('');
      setEmail('');
      setPassword('');

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center pt-24 pb-12">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">Create Your Account</h1>
          <p className="mt-2 text-gray-500">Join SEA Catering to start your health journey!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Must be 8+ characters and include an uppercase letter, a number, and a special character.
            </p>
          </div>

          {/* Display Server Messages */}
          {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm"><p>{error}</p></div>}
          {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md text-sm"><p>{success}</p></div>}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
