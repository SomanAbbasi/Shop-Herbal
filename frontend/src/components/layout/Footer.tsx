import { Link } from 'react-router-dom';
import { Leaf, Github, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#E6F6CA] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Leaf className="w-6 h-6 text-[#3B8524]" />
              <span className="text-xl font-bold text-[#111111]">Shop Herbal</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Your trusted partner for organic produce and herbal wellness. Delivering nature's 
              best directly to your doorstep with love and care.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-[#3B8524] mt-1 shrink-0" />
                <span>123 Herbal Plaza, DHA Phase 6, Karachi, Pakistan</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-[#3B8524] shrink-0" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-[#3B8524] shrink-0" />
                <span>support@shopherbal.com</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#111111] mb-6">Company</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/about-us" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  Our Products
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#111111] mb-6">Support</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/shipping-info" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  Your Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#111111] mb-6">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/privacy-policy" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#3B8524]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Shop Herbal. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a href="#" className="p-2.5 bg-white rounded-full text-gray-500 hover:text-[#3B8524] hover:shadow-md transition-all">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2.5 bg-white rounded-full text-gray-500 hover:text-[#3B8524] hover:shadow-md transition-all">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="p-2.5 bg-white rounded-full text-gray-500 hover:text-[#3B8524] hover:shadow-md transition-all">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
