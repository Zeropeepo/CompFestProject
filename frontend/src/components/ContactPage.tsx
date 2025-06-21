import { Phone } from 'lucide-react';
const ContactPage = () => (
  <div className="container mx-auto pt-24 p-8">
    <h1 className="text-4xl font-bold">Contact Us</h1>
    <div className="mt-6 flex items-center space-x-4">
      <Phone size={20} className="text-green-600"/>
      <p className="text-lg">
          <span className="font-semibold">Manager (Brian):</span> 08123456789
      </p>
    </div>
  </div>
);
export default ContactPage;