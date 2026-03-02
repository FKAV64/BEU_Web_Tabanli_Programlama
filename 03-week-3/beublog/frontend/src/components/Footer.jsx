import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t mt-8 p-6 text-center bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 transition-colors">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} BEUBlog. Tüm hakları saklıdır.
      </p>
      <p className="text-xs mt-2 text-gray-500">
        Bu proje eğitim amaçlı geliştirilmiştir.
      </p>
    </footer>
  );
}