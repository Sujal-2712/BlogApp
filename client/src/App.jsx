import Navbar from "./components/navbar.component";
import './index.css';
import { Route, Routes } from "react-router-dom";
import UserAuthForm from "./pages/userAuthForm.page";
import { Toaster } from "react-hot-toast";
import { createContext, useEffect, useState } from "react";
import { lockInSession } from "./common/session";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import Editor from "./pages/editor.pages";
import PageNotFound from "./pages/404.page";
import ManageBlogs from "./pages/manage-blogs.page";
import HomePage from "./pages/home.page";
import Notification from "./pages/notifications.page";
import ChangePassword from "./pages/change-password.page";
import SearchPage from "./pages/search.page";
import ForgotPasswordFlow from "./pages/ForgotPasswordFlow";
import SideNav from "./components/sidenavbar.component";
import EditProfile from "./pages/edit-profile.page";
import ForgotPasswordPage from "./pages/forgot.password"; // Import the new page

export const UserContext = createContext();

const App = () => {
    const [userAuth, setUserAuth] = useState({ access_token: null, profile_img: null, username: null, fullname: null });

    useEffect(() => {
        // Check if user data is available in session storage
        let userInSession = lockInSession("user");
        if (userInSession) {
            setUserAuth(JSON.parse(userInSession)); // Set user from session if exists
        }
    }, []);

    return (
        <UserContext.Provider value={{ userAuth, setUserAuth }}>
            {/* Display toast notifications */}
            <Toaster position="top-right" />

            <Routes>
                {/* Define root route with Navbar */}
                <Route path="/" element={<Navbar />}>
                    {/* Main Routes */}
                    <Route index element={<HomePage />} />
                    <Route path="signin" element={<UserAuthForm type="signin" />} />
                    <Route path="signup" element={<UserAuthForm type="signup" />} />
                    <Route path="search/:query" element={<SearchPage />} />
                    <Route path="user/:id" element={<ProfilePage />} />
                    <Route path="blog/:blog_id" element={<BlogPage />} />
                    
                    {/* Forgot Password Route */}
                    <Route path="forgot-password" element={<ForgotPasswordFlow />} /> {/* Add the route */}

                    {/* Dashboard Routes with SideNav */}
                    <Route path="dashboard" element={<SideNav />}>
                        <Route path="blogs" element={<ManageBlogs />} />
                        <Route path="notifications" element={<Notification />} />
                        <Route path="change-password" element={<ChangePassword />} />
                    </Route>

                    {/* Settings Routes with SideNav */}
                    <Route path="settings" element={<SideNav />}>
                        <Route path="edit-profile" element={<EditProfile />} />
                        <Route path="change-password" element={<ChangePassword />} />
                    </Route>

                    {/* Editor Route under Navbar */}
                    <Route path="blog/editor/:blog_id" element={<Editor />} />
                    
                    {/* 404 Route */}
                    <Route path="*" element={<PageNotFound />} />
                </Route>
                <Route path="editor" element={<Editor />} />
            </Routes>

        </UserContext.Provider>
    );
};

export default App;
