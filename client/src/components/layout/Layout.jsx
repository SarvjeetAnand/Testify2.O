import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useLayout } from '../../contexts/LayoutContext';

const Layout = ({ children }) => {
  const { showHeader, showFooter } = useLayout();

  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;