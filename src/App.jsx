import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Register from "./pages/public/Register";
import Login from "./pages/public/Login";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";
import Home from "./pages/public/Home";
import ProductDetail from "./pages/private/ProductDetail";
import NotFound from "./pages/public/NotFound";
import { AuthContextProvider } from "./context/AuthContext";
import MainLayout from "./components/MainLayout";
import SearchResults from "./pages/SearchResults";
import Cart from "./pages/private/Cart";
import Order from "./pages/private/Order";
import Checkout from "./pages/private/Checkout";
import Product from "./pages/private/Product";
import { CartContextProvider } from "./context/CartContext";

function App() {
  return (
    <AuthContextProvider>
      <CartContextProvider>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/account/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/account/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />
            <Route path="/" element={<MainLayout />}>
              <Route
                index
                element={
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PublicRoute>
                    <div>Profile Page</div>
                  </PublicRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <PublicRoute>
                    <Cart />
                  </PublicRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <PrivateRoute>
                    <Product />
                  </PrivateRoute>
                }
              />
              <Route
                path="/products/:slug"
                element={
                  <PrivateRoute>
                    <ProductDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <PrivateRoute>
                    <Order />
                  </PrivateRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <PrivateRoute>
                    <div>Wishlist Page</div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                }
              />
              <Route path="/search" element={<SearchResults />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </CartContextProvider>
    </AuthContextProvider>
  );
}

export default App;
