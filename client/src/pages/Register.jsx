import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFormFocused, setIsFormFocused] = useState(false);
  
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Creating your account..." />;
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
          60% {
            transform: translateY(-3px);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.4s ease-out forwards;
        }
        
        .animate-bounce-gentle {
          animation: bounce 2s infinite;
        }
      `}</style>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="animate-fade-in-up">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-110 animate-bounce-gentle">
              <svg className="h-8 w-8 text-white transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </div>
            <h2 className="mt-8 text-center text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
              Create your account
            </h2>
            <p className="mt-4 text-center text-sm md:text-base text-gray-600">
              Or{' '}
              <Link 
                to="/login" 
                className="font-semibold text-blue-600 hover:text-blue-500 transition-all duration-300 hover:underline decoration-2 underline-offset-4"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>
          
          <form 
            className="mt-8 space-y-6 animate-fade-in-up" 
            onSubmit={handleSubmit}
            style={{ animationDelay: '0.2s' }}
            onFocus={() => setIsFormFocused(true)}
            onBlur={() => setIsFormFocused(false)}
          >
            <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-white/50 transition-all duration-500 ${isFormFocused ? 'shadow-2xl shadow-blue-500/10 scale-[1.02]' : ''}`}>
              <div className="space-y-6">
                <div className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-4 py-3 border-2 ${
                      errors.name 
                        ? 'border-red-300 bg-red-50/50' 
                        : 'border-gray-200 hover:border-blue-300 focus:border-blue-500'
                    } placeholder-gray-500 text-gray-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:z-10 text-sm md:text-base transition-all duration-300 hover:shadow-md focus:shadow-lg`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 animate-slide-in-right flex items-center">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-4 py-3 border-2 ${
                      errors.email 
                        ? 'border-red-300 bg-red-50/50' 
                        : 'border-gray-200 hover:border-blue-300 focus:border-blue-500'
                    } placeholder-gray-500 text-gray-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:z-10 text-sm md:text-base transition-all duration-300 hover:shadow-md focus:shadow-lg`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 animate-slide-in-right flex items-center">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.email}
                    </p>
                  )}
                </div>
                
                <div className="animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-4 py-3 pr-12 border-2 ${
                        errors.password 
                          ? 'border-red-300 bg-red-50/50' 
                          : 'border-gray-200 hover:border-blue-300 focus:border-blue-500'
                      } placeholder-gray-500 text-gray-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:z-10 text-sm md:text-base transition-all duration-300 hover:shadow-md focus:shadow-lg`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-blue-50 rounded-r-xl transition-all duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors duration-200" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 animate-slide-in-right flex items-center">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="animate-slide-in-right" style={{ animationDelay: '0.6s' }}>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-4 py-3 pr-12 border-2 ${
                        errors.confirmPassword 
                          ? 'border-red-300 bg-red-50/50' 
                          : 'border-gray-200 hover:border-blue-300 focus:border-blue-500'
                      } placeholder-gray-500 text-gray-900 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:z-10 text-sm md:text-base transition-all duration-300 hover:shadow-md focus:shadow-lg`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-blue-50 rounded-r-xl transition-all duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors duration-200" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 animate-slide-in-right flex items-center">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 animate-slide-in-right" style={{ animationDelay: '0.7s' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 md:py-4 px-6 border border-transparent text-sm md:text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 active:translate-y-0 disabled:hover:transform-none"
                >
                  <span className="relative z-10">
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </div>
                    ) : (
                      'Create account'
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </button>
              </div>
            </div>

            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                By creating an account, you agree to our{' '}
                <a href="/terms" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline decoration-2 underline-offset-2">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline decoration-2 underline-offset-2">
                  Privacy Policy
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;