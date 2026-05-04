import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase tracking-widest text-blue-400">Aaple Ghar</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your trusted partner for finding the perfect property in Nashik and surrounding areas.
              Discover residential, commercial, and plot options with expert guidance.
            </p>
           
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-200">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-slate-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/properties" className="text-slate-400 hover:text-white transition-colors">Properties</a></li>
              <li><a href="/builders" className="text-slate-400 hover:text-white transition-colors">Builders</a></li>
              <li><a href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Property Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-200">Property Types</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/properties?type=residential" className="text-slate-400 hover:text-white transition-colors">Residential</a></li>
              <li><a href="/properties?type=commercial" className="text-slate-400 hover:text-white transition-colors">Commercial</a></li>
              <li><a href="/properties?type=plot" className="text-slate-400 hover:text-white transition-colors">Plots</a></li>
              <li><a href="/properties?status=ready" className="text-slate-400 hover:text-white transition-colors">Ready to Move</a></li>
              <li><a href="/properties?status=under_construction" className="text-slate-400 hover:text-white transition-colors">Under Construction</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-200">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-300">Nashik, Maharashtra</p>
                  <p className="text-slate-300">India - 422001</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="mailto:info@aaplghar.com" className="text-slate-300 hover:text-white transition-colors">
                  info@aaplghar.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-slate-300 hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Aaple Ghar. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="/sitemap" className="text-slate-400 hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Aaple Ghar",
          "url": "https://aaplghar.com",
          "logo": "https://aaplghar.com/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-98765-43210",
            "contactType": "customer service",
            "email": "info@aaplghar.com"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Nashik",
            "addressRegion": "Maharashtra",
            "addressCountry": "IN",
            "postalCode": "422001"
          },
          "sameAs": [
            "https://www.facebook.com/aaplghar",
            "https://www.twitter.com/aaplghar",
            "https://www.instagram.com/aaplghar",
            "https://www.linkedin.com/company/aaplghar"
          ]
        })}
      </script>
    </footer>
  );
};

export default Footer;