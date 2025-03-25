import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Animation components
const FadeIn = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openAuthModal = (isLogin) => {
    setShowLogin(isLogin);
    setShowAuthModal(true);
    setIsMobileMenuOpen(false); // Close mobile menu when auth modal opens
  };

  // Smooth scroll function
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false); // Close mobile menu after clicking a link
  };

  // Preload images
  useEffect(() => {
    const images = [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ];
    images.forEach(image => {
      new Image().src = image;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <motion.h1 
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-blue-600"
            >
              MedConnect
            </motion.h1>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4">
              <button 
                onClick={() => scrollToSection('about')}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contact
              </button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuthModal(true)}
                className="btn-primary"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuthModal(false)}
                className="btn-secondary"
              >
                Sign Up
              </motion.button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4"
            >
              <div className="px-2 pt-2 pb-4 space-y-2 bg-white rounded-lg shadow-lg">
                <button 
                  onClick={() => scrollToSection('about')}
                  className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Contact
                </button>
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openAuthModal(true)}
                    className="w-full btn-primary"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openAuthModal(false)}
                    className="w-full btn-secondary"
                  >
                    Sign Up
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-r from-blue-500 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center"></div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 text-center relative z-10"
        >
          <FadeIn delay={0.2}>
            <h1 className="text-5xl font-bold mb-6">Your Health, Our Priority</h1>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Connect with expert doctors anytime, anywhere with our revolutionary telemedicine platform
            </p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div className="space-x-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuthModal(false)}
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }} 
                onClick={() => scrollToSection('how-it-works')}
                className="border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-blue-600 transition-all"
              >
                Learn More
              </motion.button>
            </div>
          </FadeIn>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="md:w-1/2"
              >
                <img 
                  src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="Doctor with patient" 
                  className="rounded-lg shadow-xl transform transition duration-500 hover:shadow-2xl"
                />
              </motion.div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">About MedConnect</h2>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Founded in 2025 by a passionate healthcare innovator and technology expert, MedConnect emerged from a simple yet powerful vision: to make quality healthcare accessible to everyone, everywhere. Our journey began in Nakuru, Kenya, where we witnessed firsthand the challenges patients faced in accessing specialist care.
                  </p>
                  <p className="text-gray-600">
                    Today, we've grown into a trusted telemedicine platform serving over 100,000 patients across East Africa. Our network includes more than 500 board-certified doctors across 25+ specialties, all committed to delivering compassionate, convenient care.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-blue-700 font-medium">
                      "We believe technology should remove barriers to healthcare, not create them. That's why we've designed MedConnect to be simple, secure, and accessible to everyone."
                    </p>
                    <p className="text-blue-600 mt-2">- Dr. Emmanuel Leakono, Founder</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection('how-it-works')}
                  className="btn-primary mt-6"
                >
                  Learn How It Works
                </motion.button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-16 text-center text-gray-800">How MedConnect Works</h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <FadeIn delay={0.2}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-lg shadow-md text-center h-full transform transition duration-300 hover:shadow-lg"
              >
                <div className="bg-blue-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Create Your Account</h3>
                <p className="text-gray-600 mb-4">
                  Sign up in less than 2 minutes with just your basic information. Complete your medical profile to help us match you with the right specialist.
                </p>
                <ul className="text-left text-gray-600 space-y-2 mb-4">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Secure, encrypted registration</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Takes less than 2 minutes</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No credit card required</span>
                  </li>
                </ul>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-lg shadow-md text-center h-full transform transition duration-300 hover:shadow-lg"
              >
                <div className="bg-blue-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Find Your Doctor</h3>
                <p className="text-gray-600 mb-4">
                  Browse our network of specialists by specialty, availability, languages spoken, or patient reviews. Filter to find your perfect match.
                </p>
                <ul className="text-left text-gray-600 space-y-2 mb-4">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>500+ board-certified doctors</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>25+ medical specialties</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Verified patient reviews</span>
                  </li>
                </ul>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-lg shadow-md text-center h-full transform transition duration-300 hover:shadow-lg"
              >
                <div className="bg-blue-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Secure Consultation</h3>
                <p className="text-gray-600 mb-4">
                  After booking confirmation, your doctor will send a secure Google Meet link to your email at your appointment time for a private video consultation.
                </p>
                <ul className="text-left text-gray-600 space-y-2 mb-4">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>HIPAA-compliant video calls</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No software installation needed</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Automatic appointment reminders</span>
                  </li>
                </ul>
              </motion.div>
            </FadeIn>
          </div>
          
          <FadeIn>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="md:w-1/2"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    alt="Video call with doctor" 
                    className="rounded-lg transform transition duration-500 hover:shadow-lg"
                  />
                </motion.div>
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold mb-4">Seamless Virtual Healthcare Experience</h3>
                  <p className="text-gray-600 mb-4">
                    Our platform connects you with healthcare providers through secure, high-quality video consultations. After booking, you'll receive a unique, encrypted meeting link via email at your appointment time. This system ensures:
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Maximum Privacy</h4>
                        <p className="text-gray-600">End-to-end encrypted connections protect your health information</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Easy Access</h4>
                        <p className="text-gray-600">Join from any device - no downloads required</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Continuity of Care</h4>
                        <p className="text-gray-600">Your doctor can send prescriptions directly to your pharmacy</p>
                      </div>
                    </li>
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openAuthModal(false)}
                    className="btn-primary"
                  >
                    Book Your First Consultation
                  </motion.button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-16 text-center text-gray-800">Our Premium Features</h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={0.2}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow transform transition duration-300 hover:shadow-lg"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">24/7 Access</h3>
                <p className="text-gray-600 mb-4">
                  Healthcare on your schedule, not limited by traditional office hours. Connect with doctors anytime, anywhere.
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Emergency consultations available</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Weekend and holiday availability</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Reduced wait times</span>
                  </li>
                </ul>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow transform transition duration-300 hover:shadow-lg"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Expert Doctors</h3>
                <p className="text-gray-600 mb-4">
                  Access to highly qualified professionals across multiple specialties, all vetted through our rigorous credentialing process.
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Board-certified specialists</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Average 15+ years experience</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Continuous quality monitoring</span>
                  </li>
                </ul>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow transform transition duration-300 hover:shadow-lg"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Comprehensive Care</h3>
                <p className="text-gray-600 mb-4">
                  Complete healthcare solution with integrated features that go beyond just video consultations.
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Electronic prescriptions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Lab test integration</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Health records management</span>
                  </li>
                </ul>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-16 text-center">Why Choose MedConnect?</h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FadeIn delay={0.2}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm border border-white border-opacity-20 transform transition duration-300 hover:border-opacity-40"
              >
                <div className="text-4xl mb-4">🏥</div>
                <h3 className="text-xl font-bold mb-3">500+ Specialists</h3>
                <p>Board-certified doctors across 25+ specialties including Cardiology, Pediatrics, and Mental Health</p>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm border border-white border-opacity-20 transform transition duration-300 hover:border-opacity-40"
              >
                <div className="text-4xl mb-4">⏱️</div>
                <h3 className="text-xl font-bold mb-3">24/7 Availability</h3>
                <p>Access care whenever you need it - nights, weekends, and holidays included</p>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm border border-white border-opacity-20 transform transition duration-300 hover:border-opacity-40"
              >
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-3">Affordable</h3>
                <p>Consultations starting at just $25, with transparent pricing and no hidden fees</p>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.8}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm border border-white border-opacity-20 transform transition duration-300 hover:border-opacity-40"
              >
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-xl font-bold mb-3">4.9/5 Rating</h3>
                <p>Trusted by over 50,000 patients with 96% satisfaction rate in post-consultation surveys</p>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-16 text-center text-gray-800">Patient Success Stories</h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={0.2}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-lg shadow-sm transform transition duration-300 hover:shadow-md"
              >
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 mr-2">
                    ★★★★★
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">"MedConnect saved me a 2-hour drive to Nairobi to see a specialist. The cardiologist I consulted was incredibly thorough and even coordinated with my local doctor for follow-up care."</p>
                <div className="flex items-center">
                  <img 
                    src="https://randomuser.me/api/portraits/women/32.jpg" 
                    alt="Sarah J." 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-bold">Sarah J.</p>
                    <p className="text-sm text-gray-500">Nakuru • Cardiac Patient</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-lg shadow-sm transform transition duration-300 hover:shadow-md"
              >
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 mr-2">
                    ★★★★★
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">"As a new mom, leaving the house for doctor appointments was stressful. With MedConnect, I got pediatric advice while my baby napped. The meeting link worked perfectly on my phone."</p>
                <div className="flex items-center">
                  <img 
                    src="https://randomuser.me/api/portraits/men/45.jpg" 
                    alt="Michael T." 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-bold">Michael T.</p>
                    <p className="text-sm text-gray-500">Mombasa • Parent</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-lg shadow-sm transform transition duration-300 hover:shadow-md"
              >
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 mr-2">
                    ★★★★★
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">"I was skeptical about online consultations until I tried MedConnect. The dermatologist diagnosed my skin condition and sent the prescription to my local pharmacy - all in one 20-minute video call."</p>
                <div className="flex items-center">
                  <img 
                    src="https://randomuser.me/api/portraits/women/68.jpg" 
                    alt="Lisa M." 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-bold">Lisa M.</p>
                    <p className="text-sm text-gray-500">Kisumu • Dermatology Patient</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-6">Ready to Experience Better Healthcare?</h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-xl mb-8">Join thousands of happy patients across Kenya who've transformed their healthcare experience</p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openAuthModal(false)}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all text-lg shadow-lg"
            >
              Sign Up Now - It's Free
            </motion.button>
          </FadeIn>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="flex flex-col md:flex-row gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Get In Touch</h2>
                <p className="text-gray-600 mb-8">Have questions about our services or need support? Our team is available 24/7 to assist you.</p>
                
                <div className="space-y-6">
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start"
                  >
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Phone Support</h3>
                      <p className="text-gray-600">+254 113535094</p>
                      <p className="text-sm text-gray-500 mt-1">Available 24 hours, 7 days a week</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start"
                  >
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Email Us</h3>
                      <p className="text-gray-600">leakonoemmanuel3@gmail.com</p>
                      <p className="text-sm text-gray-500 mt-1">Typically respond within 1 business day</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start"
                  >
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Visit Us</h3>
                      <p className="text-gray-600">123 Healthcare Lane</p>
                      <p className="text-gray-600">Nakuru, Kenya</p>
                      <p className="text-sm text-gray-500 mt-1">By appointment only</p>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 p-8 rounded-lg shadow-md border border-gray-200"
                >
                  <h3 className="text-xl font-bold mb-6 text-gray-800">Send us a message</h3>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">Your Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-gray-700 mb-2 font-medium">Your Message</label>
                      <textarea 
                        id="message" 
                        rows="4" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="btn-primary w-full py-3"
                    >
                      Send Message
                    </motion.button>
                  </form>
                </motion.div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <h3 className="text-xl font-bold mb-4">MedConnect</h3>
                </motion.div>
                <p className="text-gray-400 mb-4">Bridging the gap between patients and quality healthcare through innovative telemedicine solutions.</p>
                <div className="flex space-x-4">
                  <motion.a whileHover={{ y: -3 }} href="#" className="text-gray-400 hover:text-white">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </motion.a>
                  <motion.a whileHover={{ y: -3 }} href="#" className="text-gray-400 hover:text-white">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </motion.a>
                  <motion.a whileHover={{ y: -3 }} href="#" className="text-gray-400 hover:text-white">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </motion.a>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <motion.li whileHover={{ x: 5 }}>
                    <button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-white transition-colors">About Us</button>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white transition-colors">Features</button>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <button onClick={() => scrollToSection('how-it-works')} className="text-gray-400 hover:text-white transition-colors">How It Works</button>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-white transition-colors">Contact</button>
                  </motion.li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Services</h4>
                <ul className="space-y-2">
                  <motion.li whileHover={{ x: 5 }}>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors">Primary Care</Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors">Specialist Consultations</Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors">Mental Health</Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors">Pediatrics</Link>
                  </motion.li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <motion.li whileHover={{ x: 5 }}>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors">HIPAA Compliance</Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors">Medical Disclaimers</Link>
                  </motion.li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>© {new Date().getFullYear()} MedConnect. All rights reserved.</p>
            </div>
          </FadeIn>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative"
          >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {showLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <AuthForm isLogin={showLogin} />
            <p className="text-center mt-4">
              {showLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setShowLogin(!showLogin)}
                className="text-blue-600 hover:underline font-medium"
              >
                {showLogin ? 'Sign up here' : 'Login here'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;