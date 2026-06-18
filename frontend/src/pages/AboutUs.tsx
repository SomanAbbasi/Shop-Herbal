import { Leaf } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#F9FAF5] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#E6F6CA] rounded-2xl">
              <Leaf className="w-8 h-8 text-[#3B8524]" />
            </div>
            <h1 className="text-3xl font-bold text-[#111111]">About Shop Herbal</h1>
          </div>

          <div className="prose prose-green max-w-none text-gray-600 space-y-6">
            <p className="text-lg leading-relaxed">
              Welcome to Shop Herbal, your premier destination for the finest organic produce and herbal products. 
              Founded with a passion for health and sustainability, we bridge the gap between local farmers 
              and health-conscious consumers.
            </p>

            <h2 className="text-2xl font-bold text-[#111111] pt-4">Our Mission</h2>
            <p>
              Our mission is simple: to make high-quality, organic nutrition accessible to everyone. 
              We believe that nature provides everything we need for a vibrant life, and we are committed 
              to delivering those gifts directly to your doorstep.
            </p>

            <h2 className="text-2xl font-bold text-[#111111] pt-4">Why Choose Us?</h2>
            <div className="grid md:grid-cols-2 gap-6 not-prose mt-4">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-[#111111] mb-2">100% Organic</h3>
                <p className="text-sm">We strictly partner with certified organic farms to ensure no harmful chemicals reach your table.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-[#111111] mb-2">Sustainable Sourcing</h3>
                <p className="text-sm">Every product is sourced with respect for the environment and fair compensation for farmers.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-[#111111] mb-2">Freshness Guaranteed</h3>
                <p className="text-sm">Our logistics chain is optimized to deliver produce at the peak of its nutritional value.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-[#111111] mb-2">Community Focused</h3>
                <p className="text-sm">We reinvest in local agricultural communities to promote sustainable farming education.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#111111] pt-8">Our Story</h2>
            <p>
              Starting as a small family initiative in 2020, Shop Herbal has grown into a trusted community 
              of thousands of families. We continue to innovate in sustainable packaging and 
              efficient delivery to ensure our carbon footprint stays as small as possible while 
              our impact on your health stays as large as possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
