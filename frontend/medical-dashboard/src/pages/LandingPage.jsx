import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Enhanced animation components
const FadeIn = ({ children, delay = 0, className = '' }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 0.77, 0.47, 0.97] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Pulse = ({ children }) => {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Testimonials data
  const testimonials = [
    {
      quote: "MedConnect saved me a 2-hour drive to Nairobi to see a specialist. The cardiologist I consulted was incredibly thorough and even coordinated with my local doctor for follow-up care.",
      name: "Sarah J.",
      role: "Cardiac Patient",
      location: "Nakuru",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      quote: "As a new mom, leaving the house for doctor appointments was stressful. With MedConnect, I got pediatric advice while my baby napped. The meeting link worked perfectly on my phone.",
      name: "Michael T.",
      role: "Parent",
      location: "Mombasa",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/45.jpg"
    },
    {
      quote: "I was skeptical about online consultations until I tried MedConnect. The dermatologist diagnosed my skin condition and sent the prescription to my local pharmacy - all in one 20-minute video call.",
      name: "Lisa M.",
      role: "Dermatology Patient",
      location: "Kisumu",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'hidden';
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    document.body.style.overflow = 'auto';
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  // Preload images
  useEffect(() => {
    const images = [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ];
    images.forEach(image => {
      new Image().src = image;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Floating WhatsApp Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Pulse>
          <a 
            href="https://wa.me/254113535094" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-500 text-white p-4 rounded-full shadow-xl flex items-center justify-center hover:bg-green-600 transition-colors"
            aria-label="Chat with us on WhatsApp"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-6.29 3.617c-.545 0-1.06-.113-1.53-.338l-.13-.066-1.377.352.368-1.343-.078-.13a4.71 4.71 0 01-.384-2.233c0-2.618 2.136-4.75 4.763-4.75 1.274 0 2.456.496 3.347 1.396.89.9 1.38 2.093 1.38 3.368 0 2.618-2.136 4.75-4.763 4.75M12 0C5.373 0 0 5.373 0 12c0 2.126.549 4.126 1.517 5.874L0 24l6.335-1.652A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12"/>
            </svg>
          </a>
        </Pulse>
      </motion.div>

      {/* Animated Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-opacity-90"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 flex items-center"
            >
              <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="ml-2 text-2xl font-bold text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MedConnect
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              {['about', 'features', 'how-it-works', 'contact'].map((section, index) => (
                <motion.button
                  key={section}
                  whileHover={{ 
                    scale: 1.05,
                    color: '#2563eb'
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  onClick={() => scrollToSection(section)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-all"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </motion.button>
              ))}
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex space-x-4 ml-4"
              >
                <motion.button 
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 5px 15px rgba(37, 99, 235, 0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAuthModal(true)}
                  className="px-6 py-2 rounded-full text-sm font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 transition-all"
                >
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 5px 15px rgba(37, 99, 235, 0.4)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAuthModal(false)}
                  className="px-6 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Sign Up
                </motion.button>
              </motion.div>
            </div>
            
            <div className="md:hidden flex items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
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
              </motion.button>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-4 space-y-2 bg-white rounded-lg shadow-lg">
                {['about', 'features', 'how-it-works', 'contact'].map((section) => (
                  <motion.button
                    key={`mobile-${section}`}
                    whileHover={{ x: 5 }}
                    onClick={() => scrollToSection(section)}
                    className="block w-full text-left px-3 py-3 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium"
                  >
                    {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </motion.button>
                ))}
                <div className="pt-2 border-t border-gray-200 space-y-3 mt-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openAuthModal(true)}
                    className="w-full px-4 py-3 rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 font-medium"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openAuthModal(false)}
                    className="w-full px-4 py-3 rounded-full text-blue-600 border border-blue-600 font-medium hover:bg-blue-50"
                  >
                    Sign Up
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section with Particle Background */}
      <section className="relative py-32 bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
        {/* Particle background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white bg-opacity-10"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                width: Math.random() * 10 + 5,
                height: Math.random() * 10 + 5,
              }}
              animate={{
                x: [null, Math.random() * 50 - 25],
                y: [null, Math.random() * 50 - 25],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeIn delay={0.2}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Your Health, Our Priority
              </span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
              Connect with expert doctors anytime, anywhere with our revolutionary telemedicine platform
            </p>
          </FadeIn>
          
          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 10px 25px rgba(255, 255, 255, 0.3)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuthModal(false)}
                className="px-8 py-4 rounded-full font-bold bg-white text-blue-600 hover:bg-gray-100 transition-all text-lg shadow-lg"
              >
                Get Started - It's Free
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}
                whileTap={{ scale: 0.95 }} 
                onClick={() => scrollToSection('how-it-works')}
                className="px-8 py-4 rounded-full font-bold border-2 border-white hover:bg-white hover:text-blue-600 transition-all text-lg"
              >
                <span className="flex items-center justify-center">
                  Learn More
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                </span>
              </motion.button>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.8} className="mt-16">
            <div className="inline-flex items-center space-x-4 bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm px-6 py-3 rounded-full">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <motion.img
                    key={i}
                    src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${30 + i}.jpg`}
                    alt="Happy patient"
                    className="w-10 h-10 rounded-full border-2 border-white"
                    initial={{ x: -20 * i, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Trusted by over 50,000 patients</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                  <span className="ml-1 text-xs">4.9/5 (2,458 reviews)</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
        
        {/* Animated wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".25" 
              className="fill-current text-white"
            ></path>
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".5" 
              className="fill-current text-white"
            ></path>
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              className="fill-current text-white"
            ></path>
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div 
                className="lg:w-1/2 relative"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    alt="Doctor with patient" 
                    className="w-full h-auto object-cover transform transition duration-500 hover:scale-105"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-full mr-3">
                        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">500+</p>
                        <p className="text-sm text-gray-600">Certified Doctors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <div className="lg:w-1/2">
                <FadeIn delay={0.2}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                      About MedConnect
                    </span>
                  </h2>
                </FadeIn>
                
                <FadeIn delay={0.4}>
                  <div className="space-y-5 text-gray-600">
                    <p>
                      Founded in 2025 by a passionate healthcare innovator and technology expert, MedConnect emerged from a simple yet powerful vision: to make quality healthcare accessible to everyone, everywhere. Our journey began in Nakuru, Kenya, where we witnessed firsthand the challenges patients faced in accessing specialist care.
                    </p>
                    
                    <p>
                      Today, we've grown into a trusted telemedicine platform serving over 100,000 patients across East Africa. Our network includes more than 500 board-certified doctors across 25+ specialties, all committed to delivering compassionate, convenient care.
                    </p>
                    
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 mt-6"
                    >
                      <svg className="h-6 w-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-blue-700 font-medium italic">
                        "We believe technology should remove barriers to healthcare, not create them. That's why we've designed MedConnect to be simple, secure, and accessible to everyone."
                      </p>
                      <p className="text-blue-600 mt-3 font-medium">- Eng. Emmanuel Leakono, Founder</p>
                    </motion.div>
                  </div>
                </FadeIn>
                
                <FadeIn delay={0.6} className="mt-8">
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 5px 15px rgba(37, 99, 235, 0.3)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToSection('how-it-works')}
                    className="px-6 py-3 rounded-full font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    Learn How It Works
                  </motion.button>
                </FadeIn>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "50,000+", label: "Happy Patients" },
                { number: "500+", label: "Expert Doctors" },
                { number: "25+", label: "Specialties" },
                { number: "24/7", label: "Availability" }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  How MedConnect Works
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Getting quality healthcare has never been easier. Just follow these simple steps.
              </p>
            </div>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "1",
                title: "Create Your Account",
                description: "Sign up in less than 2 minutes with just your basic information. Complete your medical profile to help us match you with the right specialist.",
                features: [
                  "Secure, encrypted registration",
                  "Takes less than 2 minutes",
                  "No credit card required"
                ]
              },
              {
                step: "2",
                title: "Find Your Doctor",
                description: "Browse our network of specialists by specialty, availability, languages spoken, or patient reviews. Filter to find your perfect match.",
                features: [
                  "500+ board-certified doctors",
                  "25+ medical specialties",
                  "Verified patient reviews"
                ]
              },
              {
                step: "3",
                title: "Secure Consultation",
                description: "After booking confirmation, your doctor will send a secure Google Meet link to your email at your appointment time for a private video consultation.",
                features: [
                  "HIPAA-compliant video calls",
                  "No software installation needed",
                  "Automatic appointment reminders"
                ]
              }
            ].map((item, index) => (
              <FadeIn key={item.step} delay={0.2 * index}>
                <motion.div 
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                  }}
                  className="bg-white p-8 rounded-xl border border-gray-200 h-full transform transition-all duration-300 hover:border-blue-200"
                >
                  <div className="relative">
                    <div className="absolute -top-12 -left-4 text-9xl font-bold text-gray-100 z-0">
                      {item.step}
                    </div>
                    <div className="relative z-10">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                        <span className="text-blue-600 text-2xl font-bold">{item.step}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                      <p className="text-gray-600 mb-5">{item.description}</p>
                      <ul className="space-y-3">
                        {item.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
          
          <FadeIn>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-inner">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                <motion.div 
                  className="lg:w-1/2 relative"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="rounded-xl overflow-hidden shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                      alt="Video call with doctor" 
                      className="w-full h-auto object-cover transform transition duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="absolute -bottom-5 -left-5 bg-white p-3 rounded-lg shadow-md">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-2">
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Secure & HIPAA Compliant</p>
                    </div>
                  </div>
                </motion.div>
                
                <div className="lg:w-1/2">
                  <h3 className="text-2xl md:text-3xl font-bold mb-5 text-gray-800">
                    Seamless Virtual Healthcare Experience
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Our platform connects you with healthcare providers through secure, high-quality video consultations. After booking, you'll receive a unique, encrypted meeting link via email at your appointment time.
                  </p>
                  
                  <div className="space-y-5 mb-8">
                    {[
                      {
                        icon: (
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ),
                        title: "Maximum Privacy",
                        description: "End-to-end encrypted connections protect your health information"
                      },
                      {
                        icon: (
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                        ),
                        title: "Easy Access",
                        description: "Join from any device - no downloads required"
                      },
                      {
                        icon: (
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                        title: "Continuity of Care",
                        description: "Your doctor can send prescriptions directly to your pharmacy"
                      }
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ x: 5 }}
                        className="flex items-start"
                      >
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{feature.title}</h4>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 5px 15px rgba(37, 99, 235, 0.4)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openAuthModal(false)}
                    className="px-8 py-3 rounded-full font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
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
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Our Premium Features
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need for comprehensive virtual healthcare
              </p>
            </div>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "24/7 Access",
                description: "Healthcare on your schedule, not limited by traditional office hours. Connect with doctors anytime, anywhere.",
                features: [
                  "Emergency consultations available",
                  "Weekend and holiday availability",
                  "Reduced wait times"
                ]
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Expert Doctors",
                description: "Access to highly qualified professionals across multiple specialties, all vetted through our rigorous credentialing process.",
                features: [
                  "Board-certified specialists",
                  "Average 15+ years experience",
                  "Continuous quality monitoring"
                ]
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Comprehensive Care",
                description: "Complete healthcare solution with integrated features that go beyond just video consultations.",
                features: [
                  "Electronic prescriptions",
                  "Lab test integration",
                  "Health records management"
                ]
              }
            ].map((feature, index) => (
              <FadeIn key={index} delay={0.2 * index}>
                <motion.div 
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)"
                  }}
                  className="bg-white p-8 rounded-xl border border-gray-200 transform transition-all duration-300 hover:border-blue-200"
                >
                  <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-5">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose MedConnect?
              </h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                The trusted choice for thousands of patients across East Africa
              </p>
            </div>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                emoji: "🏥",
                title: "500+ Specialists",
                description: "Board-certified doctors across 25+ specialties including Cardiology, Pediatrics, and Mental Health"
              },
              {
                emoji: "⏱️",
                title: "24/7 Availability",
                description: "Access care whenever you need it - nights, weekends, and holidays included"
              },
              {
                emoji: "💰",
                title: "Affordable",
                description: "Consultations starting at just $25, with transparent pricing and no hidden fees"
              },
              {
                emoji: "⭐",
                title: "4.9/5 Rating",
                description: "Trusted by over 50,000 patients with 96% satisfaction rate in post-consultation surveys"
              }
            ].map((item, index) => (
              <FadeIn key={index} delay={0.2 * index}>
                <motion.div 
                  whileHover={{ 
                    y: -10,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)'
                  }}
                  className="bg-white bg-opacity-10 p-8 rounded-xl backdrop-filter backdrop-blur-sm border border-white border-opacity-20 transform transition-all duration-300 hover:border-opacity-40"
                >
                  <div className="text-5xl mb-5">{item.emoji}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="opacity-90">{item.description}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Patient Success Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Don't just take our word for it. Here's what our patients say:
              </p>
            </div>
          </FadeIn>
          
          <div className="relative h-96">
            <AnimatePresence mode="wait">
              {testimonials.map((testimonial, index) => (
                index === currentTestimonial && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 grid md:grid-cols-3 gap-8"
                  >
                    {testimonials.slice(index, index + 3).map((item, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -10 }}
                        className="bg-gray-50 p-6 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex items-center mb-4">
                          {[...Array(item.rating)].map((_, i) => (
                            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-600 mb-6 italic">"{item.quote}"</p>
                        <div className="flex items-center">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-full mr-4 object-cover"
                          />
                          <div>
                            <p className="font-bold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.role} • {item.location}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
          
          <FadeIn className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full ${currentTestimonial === index ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience Better Healthcare?
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of happy patients across Kenya who've transformed their healthcare experience
            </p>
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 10px 25px rgba(255, 255, 255, 0.3)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuthModal(false)}
                className="px-8 py-4 rounded-full font-bold bg-white text-blue-600 hover:bg-gray-100 transition-all text-lg shadow-lg"
              >
                Sign Up Now - It's Free
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}
                whileTap={{ scale: 0.95 }} 
                onClick={() => scrollToSection('how-it-works')}
                className="px-8 py-4 rounded-full font-bold border-2 border-white hover:bg-white hover:text-blue-600 transition-all text-lg"
              >
                See How It Works
              </motion.button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
                  Get In Touch
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Have questions about our services or need support? Our team is available 24/7 to assist you.
                </p>
                
                <div className="space-y-6">
                  {[
                    {
                      icon: (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      ),
                      title: "Phone Support",
                      detail: "+254 113535094",
                      note: "Available 24 hours, 7 days a week"
                    },
                    {
                      icon: (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ),
                      title: "Email Us",
                      detail: "leakonoemmanuel3@gmail.com",
                      note: "Typically respond within 1 business day"
                    },
                    {
                      icon: (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ),
                      title: "Visit Us",
                      detail: "123 Healthcare Lane, Nakuru, Kenya",
                      note: "By appointment only"
                    }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ x: 5 }}
                      className="flex items-start bg-gray-50 p-5 rounded-lg"
                    >
                      <div className="bg-blue-100 p-3 rounded-full mr-5">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                        <p className="text-gray-600">{item.detail}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.note}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-xl shadow-xl border border-gray-200"
                >
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">
                    Send us a message
                  </h3>
                  <form 
  action="https://formsubmit.co/leakonoemmanuel3@gmail.com" 
  method="POST"
  className="space-y-5"
>
  <input type="hidden" name="_next" value="https://yourwebsite.com/thank-you" />
  <input type="hidden" name="_subject" value="New Message from MedConnect!" />
  <input type="hidden" name="_captcha" value="false" />
  
  <div>
    <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">Your Name</label>
    <input 
      type="text" 
      id="name" 
      name="name"  
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      placeholder="John Doe"
      required
    />
  </div>
  
  <div>
    <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">Email Address</label>
    <input 
      type="email" 
      id="email" 
      name="email"  
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      placeholder="you@example.com"
      required
    />
  </div>
  
  <div>
    <label htmlFor="subject" className="block text-gray-700 mb-2 font-medium">Subject</label>
    <select
      id="subject"
      name="subject"  
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      required
    >
      <option value="" disabled selected>Select a subject</option>
      <option value="General Inquiry">General Inquiry</option>
      <option value="Technical Support">Technical Support</option>
      <option value="Billing Question">Billing Question</option>
      <option value="Feedback">Feedback</option>
    </select>
  </div>
  
  <div>
    <label htmlFor="message" className="block text-gray-700 mb-2 font-medium">Your Message</label>
    <textarea 
      id="message" 
      name="message"  
      rows="5" 
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      placeholder="How can we help you?"
      required
    ></textarea>
  </div>
  
  <motion.button
    whileHover={{ 
      scale: 1.02,
      boxShadow: '0 5px 15px rgba(37, 99, 235, 0.3)'
    }}
    whileTap={{ scale: 0.98 }}
    type="submit" 
    className="w-full px-6 py-4 rounded-full font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
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
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="grid md:grid-cols-5 gap-10">
              <div className="md:col-span-2">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center mb-6">
                  <svg className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    MedConnect
                  </span>
                </motion.div>
                <p className="text-gray-400 mb-6">
                  Bridging the gap between patients and quality healthcare through innovative telemedicine solutions.
                </p>
                <div className="flex space-x-4">
                  {['twitter'].map((social) => (
                    <motion.a 
                      key={social}
                      whileHover={{ y: -3, color: '#60a5fa' }}
                      href="#"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                      aria-label={`Follow us on ${social}`}
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d={`M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z`} />
                      </svg>
                    </motion.a>
                  ))}
                </div>
              </div>
              
              {[
                {
                  title: "Quick Links",
                  items: [
                    { name: "About Us", action: () => scrollToSection('about') },
                    { name: "Features", action: () => scrollToSection('features') },
                    { name: "How It Works", action: () => scrollToSection('how-it-works') },
                    { name: "Contact", action: () => scrollToSection('contact') }
                  ]
                },
                {
                  title: "Services",
                  items: [
                    { name: "Primary Care", href: "#" },
                    { name: "Specialist Consultations", href: "#" },
                    { name: "Mental Health", href: "#" },
                    { name: "Pediatrics", href: "#" }
                  ]
                },
                {
                  title: "Legal",
                  items: [
                    { name: "Privacy Policy", href: "#" },
                    { name: "Terms of Service", href: "#" },
                    { name: "HIPAA Compliance", href: "#" },
                    { name: "Medical Disclaimers", href: "#" }
                  ]
                }
              ].map((column, index) => (
                <div key={index}>
                  <h4 className="text-lg font-bold mb-5 text-white">{column.title}</h4>
                  <ul className="space-y-3">
                    {column.items.map((item, i) => (
                      <motion.li key={i} whileHover={{ x: 5 }}>
                        {item.action ? (
                          <button 
                            onClick={item.action}
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            {item.name}
                          </button>
                        ) : (
                          <Link 
                            to={item.href} 
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            {item.name}
                          </Link>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>© {new Date().getFullYear()} MedConnect. All rights reserved.</p>
              <p className="mt-2 text-sm">Made with ❤️ in Kenya</p>
            </div>
          </FadeIn>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
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
              className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full relative mx-4"
            >
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeAuthModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              
              <div className="text-center mb-2">
                <svg className="mx-auto h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                <h2 className="text-2xl font-bold mt-4 text-gray-800">
                  {showLogin ? 'Welcome Back' : 'Join MedConnect'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {showLogin ? 'Log in to your account' : 'Create a new account in seconds'}
                </p>
              </div>
              
              <AuthForm isLogin={showLogin} />
              
              <p className="text-center mt-6 text-gray-600">
                {showLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setShowLogin(!showLogin)}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {showLogin ? 'Sign up here' : 'Login here'}
                </button>
              </p>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                    </svg>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;