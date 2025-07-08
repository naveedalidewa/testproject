const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-8 py-4 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-4">
        <div>
          <p className="text-gray-500 text-sm">
            © 2024 ZubiPOS Dashboard. All rights reserved.
          </p>
        </div>

        <div>
          <nav className="flex gap-6">
            <a
              href="#privacy"
              className="text-gray-500 text-sm hover:text-blue-600 transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-gray-500 text-sm hover:text-blue-600 transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#support"
              className="text-gray-500 text-sm hover:text-blue-600 transition-colors duration-200"
            >
              Support
            </a>
          </nav>
        </div>

        <div>
          <p className="text-gray-400 text-sm font-medium">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
