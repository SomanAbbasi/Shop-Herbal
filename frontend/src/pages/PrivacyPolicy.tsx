import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F9FAF5] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#E6F6CA] rounded-2xl">
              <Shield className="w-8 h-8 text-[#3B8524]" />
            </div>
            <h1 className="text-3xl font-bold text-[#111111]">Privacy Policy</h1>
          </div>

          <div className="prose prose-green max-w-none text-gray-600 space-y-6">
            <p className="text-sm text-gray-400">Last updated: June 18, 2026</p>
            
            <p>
              At Shop Herbal, we take your privacy seriously. This policy explains how we collect, 
              use, and protect your personal information when you use our website.
            </p>

            <h2 className="text-xl font-bold text-[#111111] pt-4">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              place an order, or contact us for support. This may include your name, email address, 
              shipping address, and phone number.
            </p>

            <h2 className="text-xl font-bold text-[#111111] pt-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your account or orders</li>
              <li>To send you marketing communications (if you opt-in)</li>
              <li>To improve our website and customer service</li>
            </ul>

            <h2 className="text-xl font-bold text-[#111111] pt-4">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. 
              However, no method of transmission over the internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>

            <h2 className="text-xl font-bold text-[#111111] pt-4">4. Third-Party Services</h2>
            <p>
              We may use third-party services for payment processing and delivery. These providers 
              have their own privacy policies regarding how they handle your information.
            </p>

            <h2 className="text-xl font-bold text-[#111111] pt-4">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information at any time. 
              You can manage most of this through your account settings or by contacting our support team.
            </p>

            <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm">
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@shopherbal.com" className="text-[#3B8524] font-medium underline">
                  privacy@shopherbal.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
