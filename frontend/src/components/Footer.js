import { motion } from 'framer-motion';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <motion.footer
      initial={{ y: 100 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-t from-slate-950 to-slate-900 border-t border-slate-700/50 mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-gradient mb-4">LocalHub</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connecting local vendors with customers. Shop from trusted local businesses, support your community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="/" className="hover:text-cyan-400 transition-colors">Home</a></li>
              <li><a href="/products" className="hover:text-cyan-400 transition-colors">Shop</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Vendors */}
          <div>
            <h4 className="text-white font-semibold mb-4">Featured Vendors</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="hover:text-cyan-400 transition-colors">Kamla Printers</li>
              <li className="hover:text-cyan-400 transition-colors">Pioneer Shoes</li>
              <li className="hover:text-cyan-400 transition-colors">24/7 Medicine Shop</li>
              <li className="hover:text-cyan-400 transition-colors">Sharma Electronics</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 flex items-center justify-center transition-all duration-200"
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="border-t border-slate-700/50 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm gap-4">
            <p>&copy; 2024 LocalHub. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
