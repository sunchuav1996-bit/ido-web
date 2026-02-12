import React from 'react';
import { HashRouter as Router, Routes, Route, ScrollRestoration } from 'react-router-dom';
import { Layout } from './components/Layout';
import { NotificationCenter } from './components/NotificationCenter';
import { Home } from './pages/Home';
import { Order } from './pages/Order';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsAndConditions } from './pages/TermsAndConditions';
import { ShippingPolicy } from './pages/ShippingPolicy';
import { CancellationRefundPolicy } from './pages/CancellationRefundPolicy';

const ScrollToTop = () => {
  // A simple component to scroll to top on route change, usually handled by ScrollRestoration in data routers but good for manual here
  const { pathname } = React.useMemo(() => ({ pathname: window.location.hash }), []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App: React.FC = () => {
  return (
    <Router>
      <NotificationCenter />
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order" element={<Order />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/refund" element={<CancellationRefundPolicy />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;