import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import CourseList from './components/courses/CourseList';
import CreateCourse from './components/courses/CreateCourse';
import PostList from './components/posts/PostList';
import CreatePost from './components/posts/CreatePost';
import PostDetail from './components/posts/PostDetail';
import CourseDetail from './components/courses/CourseDetail';
import Profile from './components/profile/Profile';
import Navbar from './components/Navbar';
import ItemList from './components/marketplace/ItemList';
import CreateItem from './components/marketplace/CreateItem';
import ItemDetail from './components/marketplace/ItemDetail';
import Cart from './components/cart/Cart';
import { CartProvider } from './context/CartContext';
import Checkout from './components/cart/Checkout';
import Orders from './components/orders/Orders';
import PrivacyPolicy from './components/privacy/PrivacyPolicy';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import About from './components/static/About';
import Contact from './components/static/Contact';
import Terms from './components/static/Terms';
import Refunds from './components/static/Refunds';
import Guidelines from './components/static/Guidelines';
import Help from './components/static/Help';
import Support from './components/static/Support';
import Messaging from './components/messaging/Messaging';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/help" element={<Help />} />
          <Route path="/support" element={<Support />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messaging /></PrivateRoute>} />
          <Route path="/courses" element={<PrivateRoute><CourseList /></PrivateRoute>} />
          <Route
            path="/courses/create"
            element={
              <PrivateRoute>
                <CreateCourse />
              </PrivateRoute>
            }
          />
          <Route path="/events" element={<PrivateRoute><PostList /></PrivateRoute>} />
          <Route path="/events/create" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
          <Route path="/events/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
          <Route path="/courses/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/marketplace" element={<PrivateRoute><ItemList /></PrivateRoute>} />
          <Route path="/marketplace/create" element={<PrivateRoute><CreateItem /></PrivateRoute>} />
          <Route path="/marketplace/:id" element={<PrivateRoute><ItemDetail /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        </Routes>
        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App; 