import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

export default function ShippingInfo() {
  return (
    <div className="min-h-screen bg-[#F9FAF5] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#E6F6CA] rounded-2xl">
              <Truck className="w-8 h-8 text-[#3B8524]" />
            </div>
            <h1 className="text-3xl font-bold text-[#111111]">Shipping Information</h1>
          </div>

          <div className="space-y-10 text-gray-600">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[#3B8524]" />
                <h2 className="text-xl font-bold text-[#111111]">Delivery Timelines</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-bold text-[#111111] mb-1">Standard Delivery</p>
                  <p className="text-sm">2-4 business days for major cities.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-bold text-[#111111] mb-1">Rural Areas</p>
                  <p className="text-sm">5-7 business days depending on accessibility.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#3B8524]" />
                <h2 className="text-xl font-bold text-[#111111]">Shipping Rates</h2>
              </div>
              <p className="mb-4 leading-relaxed">
                We strive to keep our shipping rates simple and affordable. We currently offer a flat-rate 
                shipping model to ensure transparency for our customers.
              </p>
              <div className="p-6 border-2 border-dashed border-[#E6F6CA] rounded-2xl text-center">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Flat Rate</p>
                <p className="text-3xl font-bold text-[#3B8524]">Rs. 150</p>
                <p className="text-xs text-gray-400 mt-2">Applies to all orders nationwide</p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#3B8524]" />
                <h2 className="text-xl font-bold text-[#111111]">Delivery Areas</h2>
              </div>
              <p className="leading-relaxed">
                Shop Herbal delivers to over 100 cities across the country. We use a combination of 
                in-house delivery specialists and trusted third-party logistics partners to ensure 
                your organic products arrive in perfect condition.
              </p>
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Fresh produce orders placed after 4:00 PM will be processed 
                  on the following business day to ensure maximum freshness.
                </p>
              </div>
            </section>

            <section className="pt-8 border-t border-gray-100">
              <h3 className="font-bold text-[#111111] mb-2">Order Tracking</h3>
              <p className="text-sm">
                Once your order is shipped, you will receive a confirmation email with a tracking link. 
                You can also track your order status directly from your account dashboard.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
