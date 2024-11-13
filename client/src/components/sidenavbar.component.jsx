import React, { useContext, useRef, useState } from 'react';
import { Outlet, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

const SideNav = () => {
    const { userAuth, userAuth: { access_token } } = useContext(UserContext);
    const location = useLocation();
    const page = location.pathname.split("/")[2];
    const [pageState, setPageState] = useState(page.replace('-', ' '));
    const [showSideNav, setShowSideNav] = useState(false);
    const activeTabline = useRef();
    const sidebarIconTab = useRef();
    const pageStateTab = useRef();

    const ChangePageState = (e) => {
        const { offsetWidth, offsetLeft } = e.target;
        activeTabline.current.style.width = `${offsetWidth}px`;
        activeTabline.current.style.left = `${offsetLeft}px`;

        // Toggle sidebar visibility
        if (e.target === sidebarIconTab.current) {
            setShowSideNav(prev => !prev);
        }
    };

    const navigate=useNavigate();

    const handleNavClick = (path, e) => {
        e.preventDefault();
        setPageState(e.currentTarget.innerText);
        setShowSideNav(false); // Hide sidebar when a link is clicked
        navigate(path);
    };

    if (access_token == null) {
        return <Navigate to="/signin" />;
    }

    return (
        <section className='relative flex gap-10 py-0 m-0 max-md:flex-col'>
            <div className='sticky top-[80px] z-30'>
                <div className='md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto'>
                    <button ref={sidebarIconTab} className='p-5 capitalize' onClick={ChangePageState}>
                        <i className='fi fi-rr-bars-staggered'></i>
                    </button>
                    <button ref={pageStateTab} className='p-5 capitalize'>
                        {pageState}
                    </button>
                    <hr ref={activeTabline} className='absolute bottom-0 duration-300' />
                </div>
                
                <div className={`min-w-[200px] h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500 ${!showSideNav ? "max-md:opacity-0 max-md:pointer-events-none" : "opacity-100 pointer-events-auto"}`}>
                    <h1 className='text-xl text-dark-grey mb-3'>Dashboard</h1>
                    <hr className='border-grey -ml-6 mb-8 mr-6' />

                    <NavLink to="/dashboard/blogs" className="sidebar-link" onClick={(e) => handleNavClick('/dashboard/blogs', e)}>
                        <i className='fi fi-rr-document'></i>Blogs
                    </NavLink>
                    <NavLink to="/dashboard/notifications" className="sidebar-link" onClick={(e) => handleNavClick('/dashboard/notifications', e)}>
                        <i className='fi fi-rr-bell'></i>Notifications
                    </NavLink>
                    <NavLink to="/editor" className="sidebar-link" onClick={(e) => handleNavClick('/editor', e)}>
                        <i className='fi fi-rr-file-edit'></i>Write
                    </NavLink>

                    <h1 className='text-xl text-dark-grey mt-20 mb-3'>Settings</h1>
                    <NavLink to="/settings/edit-profile" className="sidebar-link" onClick={(e) => handleNavClick('/settings/edit-profile', e)}>
                        <i className='fi fi-rr-user'></i>Edit Profile
                    </NavLink>
                    <NavLink to="/settings/change-password" className="sidebar-link" onClick={(e) => handleNavClick('/settings/change-password', e)}>
                        <i className='fi fi-rr-lock'></i>Change Password
                    </NavLink>
                </div>
            </div>
            <div className='max-md:-mt-8 mt-5 w-full'>
                <Outlet />
            </div>
        </section>
    );
}

export default SideNav;
