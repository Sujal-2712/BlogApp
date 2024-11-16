import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import Cookie from 'js-cookie';
import { toast } from "react-hot-toast";
import { UserContext } from "../App";
import { storeInSession } from "../common/session";
import { API_URL } from './../../config';

const UserAuthForm = ({ type }) => {
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        cpassword: ""
    });
    const navigate = useNavigate();
    const { userAuth: { access_token }, setUserAuth } = useContext(UserContext);
    const [errormsg, setErrormsg] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    useEffect(() => {
        setFormData({
            fullname: "",
            email: "",
            password: "",
            cpassword: ""
        });
        setErrormsg("");
    }, [type]);

    const validPassword = (password) => {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            setErrormsg("Password must be at least 6 characters long.");
            return false;
        }
        if (!hasUpperCase) {
            setErrormsg("Password must include at least one uppercase letter.");
            return false;
        }
        if (!hasLowerCase) {
            setErrormsg("Password must include at least one lowercase letter.");
            return false;
        }
        if (!hasNumber) {
            setErrormsg("Password must include at least one number.");
            return false;
        }
        if (!hasSpecialChar) {
            setErrormsg("Password must include at least one special character.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (type === "signup" && formData.cpassword !== formData.password) {
            setErrormsg("Passwords are not matched!!");
            return;
        }
        if (!formData.email || !formData.password) {
            setErrormsg("Email and password are required.");
            toast.error("Please fill out all required fields.");
            return;
        }

        if (type == "signup" && !validPassword(formData.password)) {
            return;
        }

        const endpoint = type === "signin" ? `${API_URL}/signin` : `${API_URL}/signup`;
        const body = type === "signin"
            ? { email: formData.email, password: formData.password }
            : formData; // For signup, send full formData

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (data.error) {
                setErrormsg(data.error);
                return;
            }

            setErrormsg(""); // Clear previous error

            if (type === "signin") {
                storeInSession("user", JSON.stringify(data));  // Store token in sessionStorage as string
                setUserAuth({ access_token: data.access_token, profile_img: data.profile_img, username: data.username, fullname: data.fullname }); // Update userAuth context
                Cookie.set("access_token", data.access_token);
                navigate('/');
                toast.success("Login Successfully");
            } else {
                navigate('/signin');
                toast.success("New Account Created Successfully");
            }
        } catch (err) {
            console.error("Request failed:", err);
            toast.error("Something went wrong. Please try again!");
        }
    };

    return (
        access_token ? <Navigate to="/" /> : (<section className="h-cover flex items-center justify-center">
            <form className="w-[80%] max-w-[400px]" onSubmit={handleSubmit}>
                <h2 className="text-4xl font-gelasio capitalize text-center mb-12">
                    {type === "signin" ? "Welcome Back" : "Join us Today"}
                </h2>

                {/* Full Name Input (only for sign up) */}
                {type === "signup" && (
                    <div className="relative w-[100%] mb-5">
                        <input
                            name="fullname"
                            type="text"
                            placeholder="Full name"
                            value={formData.fullname}
                            onChange={handleInputChange}
                            className="input-box"
                            required
                        />
                        <i className="fi fi-rr-user input-icon"></i>
                    </div>
                )}

                {/* Email Input */}
                <div className="relative w-[100%] mb-5">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input-box"
                        required
                    />
                    <i className="fi fi-rr-envelope input-icon"></i>
                </div>

                {/* Password Input */}
                <div className="relative w-[100%] mb-5">
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="input-box"
                        required
                    />
                    <i className="fi fi-rr-key input-icon"></i>
                </div>

                {/* Confirm Password Input (only for sign up) */}
                {type === "signup" && (
                    <div className="relative w-[100%] mb-5">
                        <input
                            name="cpassword"
                            type="password"
                            placeholder="Confirm Password"
                            value={formData.cpassword}
                            onChange={handleInputChange}
                            className="input-box"
                            required
                        />
                        <i className="fi fi-rr-key input-icon"></i>
                    </div>
                )}

                {/* Error Message */}
                {errormsg && (
                    <p className="absolute text-red text-center font-semibold mb-4">
                        {errormsg}
                    </p>
                )}

                {/* Submit Button */}
                <button className="btn-dark center mt-16" type="submit">
                    {type === "signin" ? "Sign In" : "Sign Up"}
                </button>

                {/* Forgot Password Link */}
                {type === "signin" && (
                    <p className="text-dark-grey mt-4 text-center text-xl">
                        Forgot your password?
                        <Link to="/forgot-password" className="underline text-xl text-black ml-1">
                            Reset it here
                        </Link>
                    </p>
                )}

                {/* Switch between Sign In and Sign Up */}
                {type === "signin" ? (
                    <p className="text-dark-grey mt-6 text-center text-xl">
                        Don't have an account?
                        <Link to="/signup" className="underline text-xl text-black ml-1">
                            Join us Today
                        </Link>
                    </p>
                ) : (
                    <p className="text-dark-grey mt-6 text-center text-xl">
                        Already a member?
                        <Link to="/signin" className="underline text-xl text-black ml-1">
                            Sign in here
                        </Link>
                    </p>
                )}
            </form>
        </section>)
    );
};

export default UserAuthForm;
