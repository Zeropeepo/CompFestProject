import { Phone, Mail, MapPin } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative bg-green-200/60 pb-32 pt-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Get in Touch</h1>
          <p className="mt-4 text-lg text-green-800 max-w-2xl mx-auto">
            We're here to help and answer any question you might have. We look forward to hearing from you!
          </p>
        </div>
      </div>

      <div className="relative container mx-auto px-4 -mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Card: Manager */}
          <div className="bg-white p-8 rounded-xl shadow-lg text-center flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-full">
              <Phone size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold mt-4 text-gray-800">Manager (Brian)</h3>
            <p className="text-gray-500 mt-1">For immediate assistance</p>
            <a href="tel:08123456789" className="mt-3 text-lg font-semibold text-green-600 hover:text-green-700 transition-colors">
              08123456789
            </a>
          </div>

          {/* Contact Card: Email */}
          <div className="bg-white p-8 rounded-xl shadow-lg text-center flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-full">
              <Mail size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold mt-4 text-gray-800">General Inquiries</h3>
            <p className="text-gray-500 mt-1">For non-urgent questions</p>
            <a href="mailto:contact@seacatering.com" className="mt-3 text-lg font-semibold text-green-600 hover:text-green-700 transition-colors">
              contact@seacatering.com
            </a>
          </div>

          {/* Contact Card: Location */}
          <div className="bg-white p-8 rounded-xl shadow-lg text-center flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-full">
              <MapPin size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold mt-4 text-gray-800">Our Office</h3>
            <p className="text-gray-500 mt-1">Malang, East Java</p>
            <p className="mt-3 text-lg font-semibold text-gray-600">
              Indonesia
            </p>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Find Us Here</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <img 
              src="/icons/map.png" 
              alt="Map showing location in Malang, Indonesia"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;