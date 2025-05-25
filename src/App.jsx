import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Register from "./pages/public/Register";
import Login from "./pages/public/Login";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";
import Home from "./pages/public/Home";
import NotFound from "./pages/public/NotFound";
import { AuthContextProvider } from "./context/AuthContext";
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <AuthContextProvider>
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
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthContextProvider>
  );
}

export default App;
