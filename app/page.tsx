"use client";
import { useState } from "react";
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
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const services = [
    {
      icon: CreditCard,
      title: "National ID Card",
      description:
        "Apply for new ID cards, renewal, and modifications with fast processing.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: FileText,
      title: "Passport Services",
      description:
        "Complete passport application and tracking services online.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: FileCheck,
      title: "Document Verification",
      description:
        "Verify authenticity of ID cards and other documents instantly.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: UserCheck,
      title: "Family Registration",
      description:
        "Register family members and manage family tree documentation.",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: Fingerprint,
      title: "Biometric Services",
      description: "Update biometric data and resolve biometric issues.",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: Shield,
      title: "Certificate Services",
      description:
        "Birth, death, and marriage certificates issuance and verification.",
      color: "bg-teal-100 text-teal-600",
    },
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">N</span>
            </div>
            <span className="text-green-800 font-semibold text-lg">NADRA</span>
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
              Login
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
              Register
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
          <div className="md:hidden px-4 pb-4 flex flex-col space-y-3">
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
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Login
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Register
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="bg-gradient from-green-50 to-blue-50 py-20 md:py-32 flex-1">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <Shield size={16} />
              <span className="text-sm">Secure & Trusted</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Your Digital Identity, Simplified
            </h1>
            <p className="text-gray-600 text-lg">
              Access all NADRA services from anywhere. Apply for ID cards,
              verify documents, and manage your digital identity securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700">
                Get Started
                <ArrowRight size={18} className="ml-2" />
              </button>
              <button className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50">
                Learn More
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1513711827454-08548b8026ad?auto=format&fit=crop&w=800&q=80"
              alt="Digital Identity"
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 mb-12">
            Comprehensive digital identity and registration services at your
            fingertips
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(({ icon: Icon, title, description, color }, i) => (
              <div
                key={i}
                className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow bg-white"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
       <section className="py-20 bg-linear-to-r from-green-600 to-green-700">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-white mb-4 text-3xl font-semibold">
              Ready to Get Started?
            </h2>
            <p className="text-green-50 mb-8 text-lg">
              Join millions of citizens who trust NADRA for their identity and
              registration needs. Start your application today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-colors inline-flex items-center justify-center">
                Apply Now
                <ArrowRight className="ml-2" size={18} />
              </button>
              <button className="px-6 py-3 border-2 border-white text-white hover:bg-green-600 rounded-lg transition-colors">
                Track Application
              </button>
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
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">N</span>
                </div>
                <span className="text-white text-lg font-semibold">NADRA</span>
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
                  <Phone size={18} className="flex-shrink-0" />
                  <span>+92 51 111 786 100</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={18} className="flex-shrink-0" />
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
    </div>
  );
}
