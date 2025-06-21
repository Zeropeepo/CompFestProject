import { Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-12">
            <div className="container mx-auto px-4 sm:px-8 text-center">
                <h3 className="text-2xl font-bold">Contact Us</h3>
                <p className="mt-2 text-gray-300">Have questions? We'd love to hear from you.</p>
                <div className="mt-6 flex justify-center items-center space-x-4">
                    <Phone size={20} />
                    <p>
                        <span className="font-semibold">Manager (Brian):</span> 08123456789
                    </p>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-6">
                    <p className="text-sm text-gray-400"> {new Date().getFullYear()} SEA Catering. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;