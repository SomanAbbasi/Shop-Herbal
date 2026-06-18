import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-[#F9FAF5] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#111111] mb-4">Get in Touch</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Have questions about our products or your order? Our team is here to help you 
            embrace a healthier lifestyle.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-[#E6F6CA] rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-[#3B8524]" />
              </div>
              <h3 className="font-bold text-[#111111] mb-1">Call Us</h3>
              <p className="text-sm text-gray-500 mb-2">Mon-Sat from 9am to 6pm.</p>
              <a href="tel:+923001234567" className="text-[#3B8524] font-semibold hover:underline">
                +92 300 1234567
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-[#E6F6CA] rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#3B8524]" />
              </div>
              <h3 className="font-bold text-[#111111] mb-1">Email Us</h3>
              <p className="text-sm text-gray-500 mb-2">Our team will respond within 24h.</p>
              <a href="mailto:support@shopherbal.com" className="text-[#3B8524] font-semibold hover:underline">
                support@shopherbal.com
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-[#E6F6CA] rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[#3B8524]" />
              </div>
              <h3 className="font-bold text-[#111111] mb-1">Visit Us</h3>
              <p className="text-sm text-gray-500 mb-2">Come say hello at our HQ.</p>
              <p className="text-[#111111] font-semibold">
                123 Herbal Plaza, DHA Phase 6, Karachi, Pakistan
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-[#3B8524]" />
                <h2 className="text-xl font-bold text-[#111111]">Send us a Message</h2>
              </div>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <input 
                    type="text" 
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <textarea 
                    rows={4}
                    placeholder="Your message here..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/20 transition-all resize-none"
                  ></textarea>
                </div>
                <button 
                  className="w-full py-4 bg-[#3B8524] text-white rounded-xl font-bold hover:bg-[#2d6b1b] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3B8524]/20"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
