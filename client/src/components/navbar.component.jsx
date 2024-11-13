import { Link, Outlet, useNavigate } from 'react-router-dom';
import logo from '../imgs/logo.png';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../App';
import UserNavigationPanel from './user-navigation.component';
import axios from 'axios';
import { API_URL } from '../../config';

const Navbar = () => {
    const { userAuth, setUserAuth } = useContext(UserContext);
    const { access_token, profile_img, new_notification_available } = userAuth;
    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
    const [userNavPanel, setUserNavPanel] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearchFun = (e) => {
        const query = e.target.value;
        if (e.keyCode === 13 && query.length) {
            navigate(`/search/${query}`);
            setSearchBoxVisibility(false);
        }
    };

    const handleLinkClick = () => {
        setSearchBoxVisibility(false);
        setUserNavPanel(false);
    };

    const fetchNotification = async () => {
        if (!access_token) return;

        setLoading(true);
        try {
            const result = await axios.get(`${API_URL}/new-notification`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

            if (result.status === 200) {
                setUserAuth(prevState => ({ ...prevState, ...result.data }));
            } else {
                console.error("Unexpected response status:", result.status);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavPanel=(e)=>{
        setUserNavPanel(!userNavPanel)
    }

    useEffect(() => {
        if (access_token) {
            fetchNotification();
        }
    }, [access_token]);

    return (
        <>
            <nav className='z-10 sticky top-0 flex items-center gap-12 w-full px-[5vw] py-5 h-[80px] border-b border-grey bg-white'>
                <Link to="/" className='flex-none w-10' onClick={handleLinkClick}>
                    <img src={logo} className='w-full' alt="Logo" />
                </Link>

                <div className={`absolute w-full left-0 top-full mt-0 border-b border-gray-300 py-2 px-[5vw] md:relative md:border-0 md:inset-0 md:opacity-100 ${searchBoxVisibility ? "opacity-100 pointer-events-auto duration-100" : "opacity-0"}`}>
                    <input type="text" placeholder='Search'
                        className='w-full md:w-auto bg-gray-300 p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey' onKeyDown={handleSearchFun} />
                    <i className='fi fi-rr-search absolute md:hidden right-[10%] md:pointer-events-none md:left-12 top-1/2 -translate-y-1/2 text-2xl md:text-xl'></i>
                </div>

                <div className='flex items-center gap-3 md:gap-6 ml-auto'>
                    <button className='md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center' onClick={() => setSearchBoxVisibility(!searchBoxVisibility)}>
                        <i className='fi fi-rr-search text-xl'></i>
                    </button>

                    <Link to="/editor" className='hidden md:flex rounded-full gap-2 link' onClick={handleLinkClick}>
                        <i className='fi fi-rr-file-edit'></i>
                        <p>Write</p>
                    </Link>

                    {access_token ? (
                        <>
                            <Link to="/dashboard/notifications" onClick={handleLinkClick}>
                                <button className='w-12 h-12 rounded-full bg-grey relative hover:bg-black/10'>
                                    <i className='fi fi-rr-bell text-2xl block mt-1'></i>
                                    {new_notification_available && <span className='bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2'></span>}
                                </button>
                            </Link>

                            <div className='relative'>
                                <button className='w-12 h-12 mt-1' onClick={handleNavPanel}>
                                    <img src={profile_img} className='w-full h-full object-cover rounded-full' alt="Profile" />
                                </button>
                                {userNavPanel && <UserNavigationPanel setNavPanel={setUserNavPanel} onClick={handleLinkClick} />}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link className='btn-dark py-2' to="/signin" onClick={handleLinkClick}>
                                Sign In
                            </Link>
                            <Link className='btn-light hidden md:block py-2' to="/signup" onClick={handleLinkClick}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
            <Outlet />
        </>
    );
};

export default Navbar;
