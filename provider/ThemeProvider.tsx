// provider/ThemeProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setCookie, getCookie } from 'cookies-next';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // استخدام الحالة المحفوظة في الكوكي أو السمة الافتراضية "light"
  const [theme, setTheme] = useState<Theme>('light');
  
  // تحقق من تفضيلات المستخدم وتطبيقها عند تحميل الصفحة
  useEffect(() => {
    const savedTheme = getCookie('theme') as Theme;
    // التحقق من تفضيلات السمة المحفوظة أو استخدام تفضيلات النظام
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);

  // تطبيق السمة على عنصر html عند تغيير السمة
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // حفظ التفضيل في الكوكي
    setCookie('theme', theme, { maxAge: 60 * 60 * 24 * 365 }); // تخزين لمدة سنة
  }, [theme]);

  // دالة لتبديل السمة
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook لاستخدام السمة في المكونات
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}