import { Link } from 'react-router-dom';
import { Leaf, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#E6F6CA] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold text-[#111111] mb-4">Shop</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/products?category=fresh-fruit" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  Fresh Fruit
                </Link>
              </li>
              <li>
                <Link to="/products?category=fresh-vegetables" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  Fresh Vegetables
                </Link>
              </li>
              <li>
                <Link to="/products?sortBy=newest" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/products?sortBy=price_asc" className="text-sm text-gray-600 hover:text-[#3B8524] transition-colors">
                  Best Deals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#111111] mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-gray-600 cursor-default">About Us</span>
              </li>
              <li>
                <span className="text-sm text-gray-600 cursor-default">Our Farmers</span>
              </li>
              <li>
                <span className="text-sm text-gray-600 cursor-default">Sustainability</span>
              </li>
              <li>
                <span className="text-sm text-gray-600 cursor-default">Careers</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#111111] mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-gray-600 cursor-default">Help Center</span>
              </li>
              <li>
                <span className="text-sm text-gray-600 cursor-default">Shipping Info</span>
              </li>
              <li>
                <span className="text-sm text-gray-600 cursor-default">Returns</span>
              </li>
              <li>
                <span className="text-sm text-gray-600 cursor-default">Contact Us</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#111111] mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-gray-600 cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-gray-600 cursor-default">Terms of Service</span>
              </li>
              <li>
                <span className="text-sm text-gray-600 cursor-default">Cookie Policy</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#3B8524]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[#3B8524]" />
            <span className="text-lg font-bold text-[#111111]">Shop Herbal</span>
          </div>

          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Shop Herbal. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className="p-2 text-gray-500 hover:text-[#3B8524] transition-colors cursor-pointer">
              <Twitter className="w-5 h-5" />
            </span>
            <span className="p-2 text-gray-500 hover:text-[#3B8524] transition-colors cursor-pointer">
              <Instagram className="w-5 h-5" />
            </span>
            <span className="p-2 text-gray-500 hover:text-[#3B8524] transition-colors cursor-pointer">
              <Github className="w-5 h-5" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
