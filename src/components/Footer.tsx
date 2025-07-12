
import React from 'react';

const Footer: React.FC = () => {
  const trustedCompanies = [
    { name: 'Safaricom', logo: '/placeholder.svg' },
    { name: 'KCB Bank', logo: '/placeholder.svg' },
    { name: 'Equity Bank', logo: '/placeholder.svg' },
    { name: 'M-Pesa', logo: '/placeholder.svg' },
    { name: 'Airtel Money', logo: '/placeholder.svg' },
    { name: 'Co-operative Bank', logo: '/placeholder.svg' }
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Trusted by section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Trusted by leading financial institutions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {trustedCompanies.map((company) => (
              <div key={company.name} className="flex items-center justify-center">
                <div className="w-24 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">{company.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer content */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">LendChain</h4>
              <p className="text-sm text-gray-600">
                Empowering financial inclusion through blockchain technology and community-driven lending.
              </p>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Services</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Peer-to-Peer Lending</li>
                <li>Investment Opportunities</li>
                <li>Mobile Money Integration</li>
                <li>Financial Education</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Support</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Community</li>
                <li>Dispute Resolution</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
                <li>Compliance</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            © 2024 LendChain. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
