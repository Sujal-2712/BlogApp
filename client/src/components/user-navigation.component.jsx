import { useContext, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { removeFromSession } from '../common/session';
import { toast } from "react-hot-toast";


const UserNavigationPanel = ({setNavPanel}) => {
    const { userAuth: { username }, setUserAuth } = useContext(UserContext);
    const navigate = useNavigate();
    const signOut = () => {
        removeFromSession("user");
        toast.success("Logout Successfully");
        setUserAuth({ access_token: null });
        setTimeout(() => {
            navigate("/");
        }, 500);
        setNavPanel(false);
    }
    const handleNav=(e)=>{
        setNavPanel(false);
    }
    return (
        <div className="bg-white absolute right-0 z-50 border border-gray-400 rounded-xl w-60 overflow-hidden duration-200">
            <Link to="/editor" onClick={handleNav} className="flex gap-2 link md:hidden pl-8 py-4">
                <i className='fi fi-rr-file-edit'></i><p>Write</p>
            </Link>
            <Link onClick={handleNav} to={`/user/${username}`} className='link pl-8 py-4'>Profile</Link>
            <Link onClick={handleNav} to={`/dashboard/blogs`} className='link pl-8 py-4'>Dashboard</Link>
            <Link onClick={handleNav} to={`/settings/edit-profile`} className='link pl-8 py-4'>Settings</Link>
            <button className='text-left p-4 hover:bg-grey w-full pl-8 py-4' onClick={() => {
                signOut();
            }}>
                <h1 className='font-blod text-xl mg-1'>Sign Out</h1>
                <p className='text-dark-grey'>@{username}</p>
            </button>
        </div>
    )
}

export default UserNavigationPanel;