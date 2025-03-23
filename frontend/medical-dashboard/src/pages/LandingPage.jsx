import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">MedConnect</h1>
            <div className="space-x-4">
              <button 
                onClick={() => setShowLogin(true)}
                className="btn-primary">
                Login
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className="btn-secondary">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Your Health, Our Priority</h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with expert doctors anytime, anywhere
          </p>
        </div>
      </section>

      {/* Auth Form Section */}
      <section className="py-16">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {showLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <AuthForm isLogin={showLogin} />
          <p className="text-center mt-4">
            {showLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="text-blue-600 hover:underline">
              {showLogin ? 'Sign up here' : 'Login here'}
            </button>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">24/7 Access</h3>
            <p>Book appointments anytime from anywhere</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Expert Doctors</h3>
            <p>Qualified professionals across specialties</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Instant Updates</h3>
            <p>Real-time appointment tracking</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;