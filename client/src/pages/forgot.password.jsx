// ForgotPassword.js
import { useState } from "react";
import { toast } from "react-hot-toast";
import { API_URL } from "../../config";

const ForgotPassword = ({ onOtpSent }) => {
    const [email, setEmail] = useState("");

    const handleSendOtp = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            toast.success("OTP sent to your email");
            onOtpSent(email); // Pass the email to the next step
        } catch (error) {
            toast.error(error.message || "Failed to send OTP");
        }
    };

    return (
        <div className="h-cover flex items-center justify-center">
            <form className="w-[80%] max-w-[400px]" onSubmit={handleSendOtp}>
                <h2 className="text-4xl font-gelasio capitalize text-center mb-12">Forgot Password</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="input-box"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button className="btn-dark center mt-16" type="submit">Send OTP</button>
            </form></div>
    );
};

export default ForgotPassword;
