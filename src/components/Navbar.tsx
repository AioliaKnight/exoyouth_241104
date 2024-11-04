import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Menu, X, MessageCircle, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  children?: { href: string; label: string; id: string; }[];
}

const NAV_ITEMS: NavItem[] = [
  { href: '#about', label: '關於我們' },
  { 
    href: '#products', 
    label: '產品系列',
    children: [
      { id: 'featured-products', href: '#products', label: '精選產品' },
      { id: 'all-products', href: '#products-all', label: '全系列產品' }
    ]
  },
  { href: '#features', label: '產品特色' },
  { href: '#quality', label: '品質保證' }
];

const NavLink = memo(({ 
  item, 
  isActive, 
  scrolled, 
  onClick 
}: {
  item: NavItem;
  isActive: boolean;
  scrolled: boolean;
  onClick?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector(item.href);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: 'smooth'
      });
      onClick?.();
    }
  }, [item.href, onClick]);

  return (
    <div 
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="navigation"
    >
      <motion.a
        href={item.href}
        onClick={handleClick}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-md
          transition-all duration-200 relative overflow-hidden
          ${isActive 
            ? "text-blue-600 bg-blue-50/80" 
            : scrolled 
              ? "text-gray-700 hover:text-blue-600" 
              : "text-white hover:text-white"}
          hover:bg-blue-50/20
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <span className="relative z-10">{item.label}</span>
        {item.children && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-1"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        )}
        
        <motion.span 
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ originX: 0 }}
        />
      </motion.a>

      <AnimatePresence>
        {item.children && isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg
                     bg-white/95 backdrop-blur-sm ring-1 ring-black/5
                     divide-y divide-gray-100"
            role="menu"
          >
            {item.children.map((child) => (
              <motion.a
                key={child.id}
                href={child.href}
                onClick={handleClick}
                className="block px-4 py-2.5 text-sm text-gray-700
                         hover:bg-blue-50 transition-colors duration-200
                         first:rounded-t-lg last:rounded-b-lg"
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                role="menuitem"
              >
                {child.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const ConsultButton = memo(({ scrolled, isMobile = false }: { scrolled: boolean; isMobile?: boolean }) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector('#contact');
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  return (
    <motion.a
      href="#contact"
      onClick={handleClick}
      className={`
        ${isMobile ? 'block px-4 py-2.5 rounded-lg text-blue-600 font-medium bg-blue-50/50' :
        'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500'}
        transition-all duration-200 shadow-md hover:shadow-lg ml-2
      `}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <MessageCircle className={`w-4 h-4 ${isMobile ? 'hidden' : 'mr-2'}`} />
      預約諮詢
    </motion.a>
  );
});

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const lastScrollY = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 導航欄顯示/隱藏邏輯
      if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;

      // 背景變化與活動區段檢測
      setScrolled(currentScrollY > 20);
      
      const navHeight = 80;
      const sections = NAV_ITEMS.map(item => item.href.slice(1));
      
      // 使用 Intersection Observer API 檢測可見區段
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= navHeight + 20 && rect.bottom >= navHeight;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    // 節流函數
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ 
        y: isVisible ? 0 : -100,
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
      }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 h-16 sm:h-20 z-40 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <motion.a 
            href="/"
            className="flex items-center space-x-2 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: scrolled ? 0 : 360 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className={`
                h-6 w-6 transition-all duration-200
                ${scrolled ? 'text-blue-600' : 'text-white'}
                group-hover:text-blue-400
              `} />
            </motion.div>
            <span className={`
              text-xl sm:text-2xl font-bold transition-colors duration-200
              ${scrolled ? 'text-gray-900' : 'text-white'}
              group-hover:text-blue-600
            `}>
              ExoYouth
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={activeSection === item.href.slice(1)}
                scrolled={scrolled}
              />
            ))}
            <ConsultButton scrolled={scrolled} />
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              md:hidden p-2 rounded-md transition-colors duration-200
              ${scrolled ? 'text-gray-600' : 'text-white'}
              hover:bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isOpen ? "關閉選單" : "開啟選單"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isOpen ? 'close' : 'open'}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-x-0 top-[64px] sm:top-[80px]
                     bg-white/95 backdrop-blur-sm shadow-lg
                     border-t border-gray-100"
          >
            <div className="max-w-7xl mx-auto px-4 py-2 space-y-1">
              {NAV_ITEMS.map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector(item.href);
                    if (element) {
                      const navHeight = 80;
                      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                      window.scrollTo({
                        top: elementPosition - navHeight,
                        behavior: 'smooth'
                      });
                      setIsOpen(false);
                    }
                  }}
                  className={`
                    block px-4 py-2.5 rounded-lg text-base font-medium
                    transition-all duration-200 hover:bg-blue-50
                    ${activeSection === item.href.slice(1)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600'}
                  `}
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                </motion.a>
              ))}
              <ConsultButton scrolled={scrolled} isMobile={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default memo(Navbar);