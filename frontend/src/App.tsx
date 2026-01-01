import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Header from "./components/header";
import Profile from "./pages/profile";
import Index from "./pages";

function App() {
  return (
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
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
