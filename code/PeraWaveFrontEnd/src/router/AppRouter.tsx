import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import RegisterEmail from "../pages/RegisterEmail";
import RegisterDetails from "../pages/RegisterDetails";
import UserDashboard from "../pages/UserDashboard";
import ModLogin from "../pages/ModLogin";
import ModRegister from "../pages/ModRegister";
import ModDashboard from "../pages/ModDashboard";
import Home from "../pages/Home";
import CreatePost from "../pages/CreatePost";
import PostDetail from "../pages/PostDetail";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Welcome />} />
        <Route path="/home"           element={<Home />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<RegisterEmail />} />
        <Route path="/register/details" element={<RegisterDetails />} />
        <Route path="/dashboard"      element={<UserDashboard />} />
        <Route path="/mods"           element={<ModLogin />} />
        <Route path="/mods/register"  element={<ModRegister />} />
        <Route path="/mod-dashboard"  element={<ModDashboard />} />
        {/* Forum routes */}
        <Route path="/create-post"    element={<CreatePost />} />
        <Route path="/post/:id"       element={<PostDetail />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;