// ForgotPasswordFlow.js
import { useState } from "react";
import ForgotPassword from "./forgot.password";
import ResetPasswordWithOtp from "./reset.password";

const ForgotPasswordFlow = () => {
    const [email, setEmail] = useState("");

    return (
        <div>
            {email ? (
                <ResetPasswordWithOtp email={email} />
            ) : (
                <ForgotPassword onOtpSent={setEmail} />
            )}
        </div>
    );
};

export default ForgotPasswordFlow;
