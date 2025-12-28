/**
 * Header компонент з покращеною навігацією та функціональністю
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Cart } from '@/components/cart/Cart';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { SearchBar } from '@/components/catalog/SearchBar';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems, totalPrice } = useCart();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/catalog', label: 'Каталог' },
    { href: '/about', label: 'Про нас' },
    { href: '/contacts', label: 'Контакти' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Закриваємо мобільне меню при зміні роуту
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="glass-strong border-b-2 border-white/20 sticky top-0 z-50 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <rect x="2" y="7" width="16" height="10" rx="2" />
                    <path d="M20 11v2" strokeLinecap="round" />
                    <rect x="5" y="10" width="2.5" height="4" fill="currentColor" />
                    <rect x="9" y="10" width="2.5" height="4" fill="currentColor" />
                    <rect x="13" y="10" width="2.5" height="4" fill="currentColor" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                PowerCore
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:text-primary hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <SearchBar 
                onSearch={(query) => {
                  if (query) {
                    router.push(`/catalog?search=${encodeURIComponent(query)}`);
                  }
                }}
                placeholder="Пошук товарів..."
                compact={true}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Button (Mobile) */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Пошук"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group"
                aria-label="Кошик"
              >
                <svg className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-background text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
                {totalPrice > 0 && (
                  <span className="hidden lg:block absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                    {totalPrice.toFixed(0)} грн
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isAdmin ? 'bg-red-500/20' : 'bg-primary/20'
                    }`}>
                      {isAdmin ? (
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold text-primary">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="hidden lg:block">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {user?.full_name || user?.email?.split('@')[0] || 'Користувач'}
                        </span>
                        {isAdmin && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded font-semibold">
                            АДМІН
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{user?.email}</div>
                    </div>
                  </div>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button variant="primary" size="sm">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Адмін
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Вийти
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Увійти
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="primary" size="sm">
                      Реєстрація
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Меню"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="py-4">
                  <SearchBar 
                    onSearch={(query) => {
                      if (query) {
                        router.push(`/catalog?search=${encodeURIComponent(query)}`);
                        setSearchOpen(false);
                      }
                    }}
                    placeholder="Пошук товарів..."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden border-t border-white/10"
              >
                <div className="py-4 space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive(link.href)
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground hover:text-primary hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!isAuthenticated && (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:text-primary hover:bg-white/5 transition-all"
                      >
                        Увійти
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all"
                      >
                        Реєстрація
                      </Link>
                    </>
                  )}
                  {isAuthenticated && (
                    <div className="px-4 py-3 border-t border-white/10 mt-2">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isAdmin ? 'bg-red-500/20' : 'bg-primary/20'
                        }`}>
                          {isAdmin ? (
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          ) : (
                            <span className="text-sm font-bold text-primary">
                              {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {user?.full_name || user?.email?.split('@')[0] || 'Користувач'}
                            </span>
                            {isAdmin && (
                              <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded font-semibold">
                                АДМІН
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">{user?.email}</div>
                        </div>
                      </div>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="primary" size="sm" className="w-full mb-2">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Адмін панель
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full"
                      >
                        Вийти
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
