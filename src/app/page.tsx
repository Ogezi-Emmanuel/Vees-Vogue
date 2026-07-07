"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// All media assets with poster images for videos
const mediaAssets = {
  videos: [
    { src: "/Vees Hero.mp4", title: "Hero Collection", description: "The signature VEES VOGUE experience", poster: "/Vees 2.jpg" },
    { src: "/Vees 1.mp4", title: "Bridal Elegance", description: "Timeless sophistication for your special day", poster: "/Vees 2.jpg" },
    { src: "/Vees 4.mp4", title: "Prom Glamour", description: "Unforgettable moments in luxury", poster: "/Vees Prom 1.jpg" },
    { src: "/Vees Prom 2.mp4", title: "Custom Creations", description: "Designed uniquely for you", poster: "/Vees Prom 1.jpg" },
  ],
  images: [
    { src: "/Vees 2.jpg", title: "Bridal Masterpiece", category: "Bridal" },
    { src: "/Vees 3.jpg", title: "Evening Elegance", category: "Evening" },
    { src: "/Vees Prom 1.jpg", title: "Prom Perfection", category: "Prom" },
  ],
};

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  futureOnly?: boolean;
}

// Enhanced form validation
const validationRules: Record<string, ValidationRule> = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  service: { required: true },
  eventDate: { required: true, futureOnly: true },
  budget: { required: true },
  inspiration: { maxLength: 2000 },
};

// Helper to generate WhatsApp links for gallery items
const getWhatsAppLinkForProduct = (title: string, type: 'image' | 'video', category?: string) => {
  const baseUrl = "https://api.whatsapp.com/send?phone=2347046644690";
  const message = category 
    ? `Hello VEES VOGUE! I'm interested in the "${title}" (${category}) from your collection. Can you provide more details?`
    : `Hello VEES VOGUE! I'm interested in the "${title}" from your collection. Can you provide more details?`;
  return `${baseUrl}&text=${encodeURIComponent(message)}`;
};

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    service: "",
    eventDate: "",
    budget: "",
    inspiration: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [activeVideo, setActiveVideo] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const bookingRef = useRef<HTMLDivElement>(null);

  // Defensive input handling
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    try {
      const { name, value } = e.target;
      let sanitizedValue = value;

      // Sanitize inputs
      if (name === "name") {
        sanitizedValue = value.replace(/[<>]/g, "");
      }

      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));

      // Validate on change if touched
      if (touched[name]) {
        // For validation, trim the value
        validateField(name, sanitizedValue.trim());
      }
    } catch (error) {
      console.error("Input error:", error);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value.trim());
  };

  const validateField = (name: string, value: string) => {
    const rules = validationRules[name as keyof typeof validationRules];
    if (!rules) return "";

    if (rules.required && !value) {
      setErrors((prev) => ({ ...prev, [name]: "This field is required" }));
      return "This field is required";
    }

    if (rules.minLength && value.length < rules.minLength) {
      setErrors((prev) => ({
        ...prev,
        [name]: `Must be at least ${rules.minLength} characters`,
      }));
      return `Must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      setErrors((prev) => ({
        ...prev,
        [name]: `Must be less than ${rules.maxLength} characters`,
      }));
      return `Must be less than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: "Please enter a valid name" }));
      return "Please enter a valid name";
    }

    if (rules.futureOnly && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setErrors((prev) => ({ ...prev, [name]: "Date cannot be in the past" }));
        return "Date cannot be in the past";
      }
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    return "";
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    Object.keys(validationRules).forEach((key) => {
      const value = formData[key as keyof typeof formData];
      // Trim only for validation purposes
      const error = validateField(key, value.trim());
      if (error) {
        isValid = false;
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );

    return isValid;
  };

  // Helper to format budget for display
  const formatBudgetForDisplay = (budgetValue: string) => {
    switch (budgetValue) {
      case "<200k":
        return "₦<200,000";
      case "200k-500k":
        return "₦200,000 - ₦500,000";
      case "500k+":
        return "₦500,000+";
      default:
        return budgetValue;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (validateForm()) {
        const safeName = encodeURIComponent(formData.name.trim());
        const safeService = encodeURIComponent(formData.service);
        const safeDate = encodeURIComponent(formData.eventDate.trim());
        const safeBudget = encodeURIComponent(formatBudgetForDisplay(formData.budget));
        const safeInspiration = encodeURIComponent(formData.inspiration);

        const message = `*VEES VOGUE VIP Consultation Request*%0A%0A*Full Name:* ${safeName}%0A*Service:* ${safeService}%0A*Event Date:* ${safeDate}%0A*Budget:* ${safeBudget}%0A*Design Brief:* ${safeInspiration}`;
        window.open(`https://api.whatsapp.com/send?phone=2347046644690&text=${message}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-rotate video carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVideo((prev) => (prev + 1) % mediaAssets.videos.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3">
                <Image
                  src="/Vees Logo.png"
                  alt="VEES VOGUE Logo"
                  width={50}
                  height={50}
                  priority
                  className="rounded-full object-cover"
                />
                <span className="font-serif text-2xl text-champagne">VEES VOGUE</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-8">
                <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-champagne transition-colors">
                  Home
                </button>
                <button onClick={scrollToBooking} className="hover:text-champagne transition-colors">
                  Book Consultation
                </button>
                <a
                  href="https://api.whatsapp.com/send?phone=2347046644690"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-champagne text-black px-6 py-2 rounded-full hover:bg-champagne/90 transition-all font-bold"
                >
                  Contact Us
                </a>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-2xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-black border-t border-gray-800"
              >
                <div className="px-4 py-6 space-y-4">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left hover:text-champagne"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => {
                      scrollToBooking();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left hover:text-champagne"
                  >
                    Book Consultation
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section with Video Carousel */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.video
              key={activeVideo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={mediaAssets.videos[activeVideo].poster}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={mediaAssets.videos[activeVideo].src} type="video/mp4" />
              Your browser does not support the video tag.
            </motion.video>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

          <div className="relative z-10 text-center px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <p className="text-champagne uppercase tracking-widest mb-4">Luxury Fashion Atelier</p>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6">
                Confidence in <span className="text-champagne">Every Stitch.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-10">
                {mediaAssets.videos[activeVideo].description}
              </p>
              <button
                onClick={scrollToBooking}
                className="bg-champagne text-black font-bold py-4 px-10 rounded-full hover:bg-champagne/90 transition-all transform hover:scale-105"
              >
                Start Your Bespoke Journey
              </button>
            </motion.div>

            {/* Video Navigation Dots */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-3">
              {mediaAssets.videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveVideo(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === activeVideo ? "bg-champagne w-8" : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Service Categories Section */}
        <section className="py-24 px-4 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-4xl md:text-5xl text-center mb-16"
            >
              Our <span className="text-champagne">Signature Services</span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Bridal Artistry", icon: "👰", description: "Exquisite wedding gowns crafted with unparalleled attention to detail" },
                { title: "Prom Glamour", icon: "✨", description: "Show-stopping prom dresses that make you the center of attention" },
                { title: "Custom Bespoke", icon: "✂️", description: "One-of-a-kind pieces designed and created exclusively for you" },
              ].map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center hover:border-champagne/50 transition-all"
                >
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="font-serif text-2xl text-champagne mb-4">{service.title}</h3>
                  <p className="text-gray-400">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Gallery */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-4xl md:text-5xl text-center mb-16"
            >
              The <span className="text-champagne">VOGUISH</span> Collection
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Image Gallery Items */}
              {mediaAssets.images.map((item, index) => (
                <motion.div
                  key={item.src}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="relative group overflow-hidden rounded-2xl aspect-[3/4]"
                >
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="text-champagne text-sm uppercase tracking-wider mb-2">{item.category}</span>
                    <h3 className="font-serif text-2xl mb-4">{item.title}</h3>
                    <a
                      href={getWhatsAppLinkForProduct(item.title, 'image', item.category)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-champagne text-black font-bold py-3 px-6 rounded-full text-center hover:bg-champagne/90 transition-all"
                    >
                      DM to Order
                    </a>
                  </div>
                </motion.div>
              ))}

              {/* Video Gallery Items */}
              {mediaAssets.videos.slice(1).map((video, index) => (
                <motion.div
                  key={video.src}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="relative group overflow-hidden rounded-2xl aspect-[3/4]"
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    poster={video.poster}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  >
                    <source src={video.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <h3 className="font-serif text-2xl mb-4 text-champagne">{video.title}</h3>
                    <a
                      href={getWhatsAppLinkForProduct(video.title, 'video')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-champagne text-black font-bold py-3 px-6 rounded-full text-center hover:bg-champagne/90 transition-all"
                    >
                      DM to Order
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Booking Section */}
        <section ref={bookingRef} id="booking" className="py-24 px-4 bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-4xl md:text-5xl mb-4">Schedule Your <span className="text-champagne">VIP Consultation</span></h2>
              <p className="text-gray-400 text-lg">Let's create something extraordinary together</p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label className="block mb-2 text-gray-300 font-medium">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full bg-white/10 border rounded-xl px-5 py-4 text-white focus:outline-none transition-all ${
                    touched.name && errors.name ? "border-red-500" : "border-gray-700 focus:border-champagne"
                  }`}
                  placeholder="Enter your full name"
                />
                {touched.name && errors.name && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-gray-300 font-medium">Preferred Service *</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full bg-gray-900 border rounded-xl px-5 py-4 text-white focus:outline-none transition-all ${
                    touched.service && errors.service ? "border-red-500" : "border-gray-700 focus:border-champagne"
                  }`}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="bg-gray-900 text-white">Select a service</option>
                  <option value="Bridal Artistry" className="bg-gray-900 text-white">Bridal Artistry</option>
                  <option value="Prom Dress" className="bg-gray-900 text-white">Prom Dress</option>
                  <option value="Custom Bespoke" className="bg-gray-900 text-white">Custom Bespoke</option>
                </select>
                {touched.service && errors.service && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.service}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-gray-300 font-medium">Event Date *</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full bg-gray-900 border rounded-xl px-5 py-4 text-white focus:outline-none transition-all ${
                      touched.eventDate && errors.eventDate ? "border-red-500" : "border-gray-700 focus:border-champagne"
                    }`}
                    style={{ colorScheme: 'dark' }}
                  />
                  {touched.eventDate && errors.eventDate && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠️</span> {errors.eventDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-gray-300 font-medium">Budget Estimate *</label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full bg-gray-900 border rounded-xl px-5 py-4 text-white focus:outline-none transition-all ${
                      touched.budget && errors.budget ? "border-red-500" : "border-gray-700 focus:border-champagne"
                    }`}
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-gray-900 text-white">Select a budget</option>
                    <option value="<200k" className="bg-gray-900 text-white">₦&lt;200,000</option>
                    <option value="200k-500k" className="bg-gray-900 text-white">₦200,000 - ₦500,000</option>
                    <option value="500k+" className="bg-gray-900 text-white">₦500,000+</option>
                  </select>
                  {touched.budget && errors.budget && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠️</span> {errors.budget}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-300 font-medium">Design Inspiration/Brief</label>
                <textarea
                  name="inspiration"
                  value={formData.inspiration}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  rows={5}
                  className="w-full bg-white/10 border border-gray-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-champagne transition-all resize-none"
                  placeholder="Share your design references, vision, and any specific requirements..."
                />
                <p className="text-gray-500 text-sm mt-2">{formData.inspiration.length}/2000</p>
              </div>

              <button
                type="submit"
                className="w-full bg-champagne text-black font-bold py-5 px-8 rounded-xl hover:bg-champagne/90 transition-all transform hover:scale-[1.02] text-lg"
              >
                Request VIP Consultation
              </button>
            </motion.form>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="border-t border-gray-800 py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <Image
                    src="/Vees Logo.png"
                    alt="VEES VOGUE Logo"
                    width={60}
                    height={60}
                    className="rounded-full object-cover"
                  />
                  <span className="font-serif text-3xl text-champagne">VEES VOGUE</span>
                </div>
                <p className="text-gray-400">Abuja's premier atelier for bespoke bridal and prom artistry.</p>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-serif text-xl text-champagne mb-4">Contact</h4>
                <a
                  href="https://api.whatsapp.com/send?phone=2347046644690"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-champagne transition-colors block mb-2"
                >
                  WhatsApp: +234 704 664 4690
                </a>
                <p className="text-gray-400">Abuja, Nigeria 🇳🇬</p>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-serif text-xl text-champagne mb-4">Services</h4>
                <p className="text-gray-400 mb-2">Bridal Artistry</p>
                <p className="text-gray-400 mb-2">Prom Glamour</p>
                <p className="text-gray-400">Worldwide Shipping Available 🌍</p>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-500">Engineered for Digital Sovereignty</p>
              <p className="text-gray-600 text-sm mt-2">© 2026 VEES VOGUE. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
