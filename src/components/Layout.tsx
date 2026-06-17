import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../language';
import { useTheme } from '../theme';
import { Menu, X, Globe, Moon, Sun, Heart, Clock } from 'lucide-react';
import { APP_NAME } from '../config/tools';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/icon.png" alt="TurboConverter" className="w-8 h-8 object-contain" />
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">{APP_NAME}</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors">
                {t('nav.home')}
              </Link>
              <Link to="/dashboard" className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
                {t('nav.history')}
              </Link>
              
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

              {/* Language Switcher */}
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{language.toUpperCase()}</span>
              </button>

              {/* Theme Switcher */}
              <button 
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-white/10 animate-fade-in-down shadow-xl">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link onClick={() => setMobileMenuOpen(false)} to="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">{t('nav.home')}</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
                <Clock className="w-4 h-4" />
                {t('nav.history')}
              </Link>
              
              <button 
                onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <Globe className="w-4 h-4" />
                <span>Switch to {language === 'en' ? 'Português' : 'English'}</span>
              </button>

              <button 
                onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                 {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-white/10 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/icon.png" alt="TurboConverter" className="w-6 h-6 object-contain" />
                <span className="font-bold text-lg text-slate-900 dark:text-white">{APP_NAME}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {t('footer.about')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('footer.tools')}</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/tool/merge-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">{t('tool_merge-pdf_name')}</Link></li>
                <li><Link to="/tool/split-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">{t('tool_split-pdf_name')}</Link></li>
                <li><Link to="/tool/compress-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">{t('tool_compress-pdf_name')}</Link></li>
                <li><Link to="/tool/rotate-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">{t('tool_rotate-pdf_name')}</Link></li>
                <li><Link to="/tool/watermark-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">{t('tool_watermark-pdf_name')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('footer.image_tools')}</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/tool/compress-img" className="hover:text-blue-600 dark:hover:text-blue-400">{t('tool_compress-img_name')}</Link></li>
                <li><Link to="/tool/resize-img" className="hover:text-blue-600 dark:hover:text-blue-400">{t('tool_resize-img_name')}</Link></li>
                <li><Link to="/tool/convert-img" className="hover:text-blue-600 dark:hover:text-blue-400">{t('tool_convert-img_name')}</Link></li>
              </ul>
            </div>
            <div>
               <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('footer.legal')}</h4>
               <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                 <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">{t('footer.privacy')}</a></li>
                 <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">{t('footer.terms')}</a></li>
               </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span>for everyone</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
