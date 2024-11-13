import { useState } from "react";
import { toast } from "react-hot-toast";
import { API_URL } from "../../config";
import { useNavigate } from "react-router-dom";

const ResetPasswordWithOtp = ({ email }) => {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [cnewPassword, setCnewPassword] = useState("");
    const [errorMsg, setErrormsg] = useState("");

    const navigate = useNavigate();

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

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== cnewPassword) {
            setErrormsg("Passwords do not match");
            return;
        }

        if (!validPassword(newPassword)) {
            return; // Prevent submission if password is invalid
        }

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            toast.success("Password reset successful");
            setErrormsg("");

            setTimeout(() => {
                navigate("/signin");
            }, 500);
        } catch (error) {
            toast.error(error.message || "Failed to reset password");
        }
    };

    return (
        <div className="h-cover flex items-center justify-center">
            <form className="w-[80%] max-w-[400px]" onSubmit={handleResetPassword}>
                <h2 className="text-4xl font-gelasio capitalize text-center mb-12">Reset Password</h2>
                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    className="input-box mb-2"
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    className="input-box mb-2"
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={cnewPassword}
                    className="input-box mb-2"
                    onChange={(e) => setCnewPassword(e.target.value)}
                    required
                />
                {errorMsg && <p className="absolute text-red text-center font-semibold mb-4 mt-1">{errorMsg}</p>}
               
                <button className="btn-dark center mt-16" type="submit">Reset Password</button>
            </form>
        </div>
    );
};

export default ResetPasswordWithOtp;
