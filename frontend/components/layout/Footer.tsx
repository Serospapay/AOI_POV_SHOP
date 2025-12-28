/**
 * Footer компонент
 */

'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-glass-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">PowerCore</h3>
            <p className="text-gray-400 text-sm">
              Інтернет-магазин пристроїв резервного живлення нового покоління
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Швидкі посилання</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/catalog" className="hover:text-primary transition-colors">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Про нас
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="hover:text-primary transition-colors">
                  Контакти
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Контакти</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@powercore.ua</li>
              <li>Телефон: +380 50 123 4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-glass-border text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} PowerCore. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
}

