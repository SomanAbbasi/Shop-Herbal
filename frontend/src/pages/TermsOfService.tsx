import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#F9FAF5] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#E6F6CA] rounded-2xl">
              <FileText className="w-8 h-8 text-[#3B8524]" />
            </div>
            <h1 className="text-3xl font-bold text-[#111111]">Terms of Service</h1>
          </div>

          <div className="prose prose-green max-w-none text-gray-600 space-y-6">
            <p className="text-sm text-gray-400">Last updated: June 18, 2026</p>

            <p>
              By accessing or using the Shop Herbal website, you agree to be bound by these Terms of Service. 
              Please read them carefully before using our services.
            </p>

            <h2 className="text-xl font-bold text-[#111111] pt-4">1. Account Registration</h2>
            <p>
              To use certain features of our site, you must register for an account. You are responsible 
              for maintaining the confidentiality of your account credentials and for all activities 
              that occur under your account.
            </p>

            <h2 className="text-xl font-bold text-[#111111] pt-4">2. Orders and Pricing</h2>
            <p>
              All orders are subject to acceptance and availability. We reserve the right to refuse or 
              cancel any order for any reason, including errors in pricing or product information. 
              Prices are subject to change without notice.
            </p>

            <h2 className="text-xl font-bold text-[#111111] pt-4">3. Shipping and Delivery</h2>
            <p>
              Delivery times are estimates and not guaranteed. We are not responsible for delays 
              beyond our control, such as weather or carrier issues. Risk of loss passes to you 
              upon delivery to the carrier.
            </p>

            <h2 className="text-xl font-bold text-[#111111] pt-4">4. Returns and Refunds</h2>
            <p>
              Due to the perishable nature of our products, returns are generally not accepted. 
              If you receive a damaged or incorrect item, please contact us within 24 hours of 
              delivery for a replacement or refund.
            </p>

            <h2 className="text-xl font-bold text-[#111111] pt-4">5. Prohibited Conduct</h2>
            <p>
              You agree not to use our site for any unlawful purpose or to interfere with the proper 
              working of the site. This includes attempting to bypass any security measures or 
              accessing data not intended for you.
            </p>

            <h2 className="text-xl font-bold text-[#111111] pt-4">6. Limitation of Liability</h2>
            <p>
              Shop Herbal shall not be liable for any indirect, incidental, or consequential damages 
              arising out of your use of our services. Our total liability is limited to the amount 
              paid by you for the products in question.
            </p>

            <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm">
                For any inquiries regarding these terms, please contact us at{' '}
                <a href="mailto:legal@shopherbal.com" className="text-[#3B8524] font-medium underline">
                  legal@shopherbal.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
