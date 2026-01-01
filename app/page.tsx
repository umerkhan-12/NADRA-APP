"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowRight,
  Shield,
  CreditCard,
  FileCheck,
  UserCheck,
  Fingerprint,
  FileText,
  Clock,
  Smartphone,
  HeadphonesIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Users,
  Globe,
  Award,
  TrendingUp,
  Zap,
  Lock,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import Chatbot from "@/components/Chatbot";
import VisitorTracker from "@/components/VisitorTracker";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (index: number) => {
    const icons = [CreditCard, FileText, FileCheck, UserCheck, Fingerprint, Shield, Award, Globe];
    return icons[index % icons.length];
  };

  const getServiceColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-600 border-blue-200",
      "bg-green-100 text-green-600 border-green-200",
      "bg-purple-100 text-purple-600 border-purple-200",
      "bg-orange-100 text-orange-600 border-orange-200",
      "bg-pink-100 text-pink-600 border-pink-200",
      "bg-teal-100 text-teal-600 border-teal-200",
      "bg-indigo-100 text-indigo-600 border-indigo-200",
      "bg-cyan-100 text-cyan-600 border-cyan-200",
    ];
    return colors[index % colors.length];
  };

  const stats = [
    { icon: Users, value: "50M+", label: "Registered Citizens" },
    { icon: FileCheck, value: "100M+", label: "Documents Issued" },
    { icon: Globe, value: "1000+", label: "Service Centers" },
    { icon: Award, value: "99.9%", label: "Success Rate" },
  ];

  const features = [
    {
      icon: Clock,
      title: "24/7 Availability",
      description:
        "Access services anytime, anywhere with our always-on digital platform.",
    },
    {
      icon: Shield,
      title: "Secure & Encrypted",
      description:
        "Bank-level security with end-to-end encryption for all your data.",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description:
        "Fully responsive design works seamlessly on all your devices.",
    },
    {
      icon: HeadphonesIcon,
      title: "Customer Support",
      description:
        "Dedicated support team ready to assist you with any queries.",
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Fast Processing",
      description: "Get your documents processed within 24-48 hours with our efficient system.",
    },
    {
      icon: Lock,
      title: "Data Privacy",
      description: "Your personal information is protected with state-of-the-art encryption.",
    },
    {
      icon: BadgeCheck,
      title: "Verified Services",
      description: "All services are government-authorized and legally compliant.",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your application status in real-time through your dashboard.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-linear-to-br from-green-600 via-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="text-white w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-linear-to-br from-amber-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="text-white w-2.5 h-2.5" strokeWidth={3} />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold bg-linear-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent tracking-tight">
                NADRA
              </div>
              <div className="text-[10px] text-gray-500 -mt-1 tracking-wider">
                NATIONAL DATABASE
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 text-gray-700">
            <a href="#home" className="hover:text-green-600">
              Home
            </a>
            <a href="#services" className="hover:text-green-600">
              Services
            </a>
            <a href="#about" className="hover:text-green-600">
              About
            </a>
            <a href="#contact" className="hover:text-green-600">
              Contact
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex space-x-4">
            <button className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <Link href="/login">Login</Link>
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg ">
              <Link href="/register">Register</Link>
            </button>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden  px-4 pb-4 flex justify-center items-center flex-col space-y-3">
            <a href="#home" className="hover:text-green-600">
              Home
            </a>
            <a href="#services" className="hover:text-green-600">
              Services
            </a>
            <a href="#about" className="hover:text-green-600">
              About
            </a>
            <a href="#contact" className="hover:text-green-600">
              Contact
            </a>
            <a href="/login" >
            
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Login
            </button>
            </a>
            <a href="/register" >
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Register
            </button>
            </a>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 py-16 md:py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-green-600/10 border border-green-600/20 text-green-700 px-4 py-2 rounded-full backdrop-blur-sm">
              <Shield size={16} />
              <span className="text-sm font-medium">Trusted by 50M+ Citizens</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Your Digital Identity,{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-teal-600">
                Simplified
              </span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
              Access all NADRA services from anywhere. Apply for ID cards,
              verify documents, and manage your digital identity securely with Pakistan's most trusted platform.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Government Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Secure Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">24/7 Support</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/register" className="group px-8 py-4 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl flex items-center justify-center hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold">
                Get Started Free
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#services" className="px-8 py-4 border-2 border-green-600 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-300 font-semibold flex items-center justify-center">
                Explore Services
              </Link>
            </div>
          </div>

          {/* Hero Image/Card */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white p-2">
              <Image
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80"
                alt="Digital Identity Services"
                width={600}
                height={400}
                className="rounded-xl object-cover w-full h-auto"
              />
              {/* Floating Stats Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">100M+</div>
                    <div className="text-xs text-gray-600">Documents</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">1000+</div>
                    <div className="text-xs text-gray-600">Centers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-600">99.9%</div>
                    <div className="text-xs text-gray-600">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3 group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-linear-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
              <FileCheck size={16} />
              <span className="text-sm font-medium">Our Services</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive NADRA Services
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Access all essential identity and registration services through our secure digital platform
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-6 border border-gray-200 rounded-2xl bg-white animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service: any, index: number) => {
                const Icon = getServiceIcon(index);
                const colorClass = getServiceColor(index);
                return (
                  <div
                    key={service.id}
                    className="group p-6 border border-gray-200 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white hover:border-green-300 relative overflow-hidden"
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-50 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10">
                      <div
                        className={`w-14 h-14 rounded-xl ${colorClass} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon size={28} />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-green-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {service.description || "Apply for this service through our secure platform with fast processing."}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm font-semibold text-green-600">
                          Fee: Rs. {service.fee.toLocaleString()}
                        </span>
                        <Link href="/register" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Apply Now
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-4">
              <Award size={16} />
              <span className="text-sm font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Benefits of Digital Services
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience the convenience and security of Pakistan's premier digital identity platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-green-100 to-emerald-100 text-green-600 mb-4">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-linear-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-green-50 mb-10 text-lg md:text-xl leading-relaxed">
              Join millions of citizens who trust NADRA for their identity and
              registration needs. Start your application today and experience the convenience of digital services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="group px-8 py-4 bg-white text-green-600 hover:bg-gray-50 rounded-xl transition-all duration-300 font-semibold inline-flex items-center justify-center shadow-lg hover:shadow-2xl">
                Apply Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link href="/login" className="px-8 py-4 border-2 border-white text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-semibold inline-flex items-center justify-center backdrop-blur-sm">
                Track Application
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex flex-wrap justify-center items-center gap-8">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5" />
                  <span className="text-sm">Government Authorized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  <span className="text-sm">Data Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-linear-to-br from-green-600 via-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="text-white w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-linear-to-br from-amber-400 to-orange-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                    <CheckCircle className="text-white w-2.5 h-2.5" strokeWidth={3} />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white tracking-tight">NADRA</div>
                  <div className="text-[10px] text-gray-400 -mt-1 tracking-wider">NATIONAL DATABASE</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                National Database and Registration Authority — Securing
                identities, enabling services.
              </p>
              <div className="flex space-x-4 mt-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white mb-4 font-semibold">Services</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    National ID Card
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Passport Services
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Verification
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Family Registration
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Certificates
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white mb-4 font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white mb-4 font-semibold">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin size={18} className=" mt-0.5" />
                  <span>State Life Building, Blue Area, Islamabad</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={18} className="shrink-0" />
                  <span>+92 51 111 786 100</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={18} className="shrink-0" />
                  <span>info@nadra.gov.pk</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 NADRA. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <Chatbot />
      
      {/* Visitor Tracker */}
      <VisitorTracker page="home" />
    </div>
  );
}
