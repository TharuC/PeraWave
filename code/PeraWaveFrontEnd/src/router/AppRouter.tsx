import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import RegisterEmail from "../pages/RegisterEmail";
import RegisterDetails from "../pages/RegisterDetails";
import UserDashboard from "../pages/UserDashboard";
import ModLogin from "../pages/ModLogin";
import ModForgotPassword from "../pages/ModForgotPassword";
import ModRegister from "../pages/ModRegister";
import ModDashboard from "../pages/ModDashboard";
import ModHome from "../pages/ModHome";
import Home from "../pages/Home";
import CreatePost from "../pages/CreatePost";
import PostDetail from "../pages/PostDetail";
import MyForums from "../pages/MyForums";
import ModReports from "../pages/ModReports";
import UserProfile from "../pages/UserProfile";
import Events from "../pages/Events";
import CreateEvent from "../pages/CreateEvent";
import ModEvents from "../pages/ModEvents";
import EventDetail from "../pages/EventDetail";
import SelectInterests from "../pages/SelectInterests";
import WikiList from "../pages/WikiList";
import WikiArticleDetail from "../pages/WikiArticleDetail";
import CreateWikiArticle from "../pages/CreateWikiArticle";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Welcome />} />
        <Route path="/home"           element={<Home />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register"       element={<RegisterEmail />} />
        <Route path="/register/details" element={<RegisterDetails />} />
        <Route path="/select-interests" element={<SelectInterests />} />
        <Route path="/dashboard"      element={<UserDashboard />} />
        <Route path="/mods"           element={<ModLogin />} />
        <Route path="/mod-forgot-password" element={<ModForgotPassword />} />
        <Route path="/mods/register"  element={<ModRegister />} />
        <Route path="/mod-dashboard"  element={<ModDashboard />} />
        <Route path="/mod-home"       element={<ModHome />} />
        {/* Forum routes */}
        <Route path="/create-post"    element={<CreatePost />} />
        <Route path="/post/:id"       element={<PostDetail />} />
        <Route path="/my-forums"       element={<MyForums />} />
        <Route path="/mod-reports"     element={<ModReports />} />
        <Route path="/user/:id"        element={<UserProfile />} />
        {/* Events routes */}
        <Route path="/events"          element={<Events />} />
        <Route path="/events/:id"      element={<EventDetail />} />
        <Route path="/create-event"    element={<CreateEvent />} />
        <Route path="/mod-events"      element={<ModEvents />} />
        {/* Wiki routes */}
        <Route path="/wiki"             element={<WikiList />} />
        <Route path="/wiki/:id"         element={<WikiArticleDetail />} />
        <Route path="/create-wiki"      element={<CreateWikiArticle />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;