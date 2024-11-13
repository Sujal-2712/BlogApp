import React, { useContext, useRef } from 'react';
import InputBox from "./../components/input.component";
import axios from 'axios';
import { API_URL } from '../../config';
import { UserContext } from '../App';
import toast from 'react-hot-toast';

const ChangePassword = () => {
    const changePasswordForm = useRef();
    const { userAuth: { access_token } } = useContext(UserContext);

    const validatePassword = (password) => {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
        if (password.length < minLength) {
            toast.error("Password must be at least 6 characters long.");
            return false;
        }
        if (!hasUpperCase) {
            toast.error("Password must include at least one uppercase letter.");
            return false;
        }
        if (!hasLowerCase) {
            toast.error("Password must include at least one lowercase letter.");
            return false;
        }
        if (!hasNumber) {
            toast.error("Password must include at least one number.");
            return false;
        }
        if (!hasSpecialChar) {
            toast.error("Password must include at least one special character.");
            return false;
        }
    
        return true;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData(changePasswordForm.current);
        const formData = {};
    
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
    
        const { currentPassword, newPassword } = formData;
    
        if (!currentPassword.trim() || !newPassword.trim()) {
            return toast.error("Fill all the inputs!!");
        }
    
        if (!validatePassword(newPassword)) {
            return; // Stop submission if validation fails
        }
    
        e.target.setAttribute("disabled", true);
        const loadingToast = toast.loading("Updating...");
    
        try {
            const result = await axios.post(`${API_URL}/change-password`, formData, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });
            toast.dismiss(loadingToast);
            toast.success("Password Updated");
        } catch (error) {
            toast.dismiss(loadingToast);
            const errorMessage = error.response?.data?.error || "An error occurred";
            toast.error(errorMessage);
        } finally {
            e.target.removeAttribute("disabled");
        }
    };
    

    return (
        <div>
            <form ref={changePasswordForm} onSubmit={handleSubmit}>
                <h1 className='max-md:hidden text-xl'>Change Password</h1>
                <div className='py-10 w-full md:max-w-[400px]'>
                    <InputBox 
                        name="currentPassword" 
                        type="password" 
                        className="profile-edit-input" 
                        placeholder="Current Password"
                        icon="fi-rr-unlock" 
                    />
                    <InputBox 
                        name="newPassword" 
                        type="password" 
                        className="profile-edit-input" 
                        placeholder="New Password"
                        icon="fi-rr-unlock" 
                    />
                    <button className='btn-dark px-10' type="submit">Change Password</button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
