import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Header from "./components/header";
import Profile from "./pages/profile";
import Index from "./pages";
import { AuthProvider } from "./contexts/auth";
import PrivateRoute from "./components/privateRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route
            element={
              <div className="min-h-screen">
                <Header />
                <Outlet />
              </div>
            }
          >
            <Route index element={<Index />} />
            <Route element={<PrivateRoute />}>
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route
              path="admin"
              element={<PrivateRoute requiredRoles={["admin"]} />}
            >
              <Route index element={<>hi</>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
