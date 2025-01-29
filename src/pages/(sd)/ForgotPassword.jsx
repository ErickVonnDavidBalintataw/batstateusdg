import React, { useState } from "react";
import loginBG from "../../assets/login-cover.png";

import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser"; // Import emailjs
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ForgotPassword = () => {
    const [loginCredentials, setLoginCredentials] = useState({
        email: "",
        otp: "",
        password: "",
        confirmPassword: "",
    });
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [isOTPVerified, setIsOTPVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for show password
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

    // Handle sending OTP
    const handleSendOtp = async () => {
        try {
            const response = await fetch(
                "https://ai-backend-drcx.onrender.com/api/send-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: loginCredentials.email }),
                }
            );
            const data = await response.json();

            if (data.success) {
                setIsOTPSent(true);
                Swal.fire(
                    "OTP Sent",
                    "Please check your email for the OTP",
                    "success"
                );

                // Send email using emailjs after OTP is successfully sent
                try {
                    await emailjs.send(
                        "service_84tcmsn", // Your EmailJS service ID
                        "template_oj00ezl", // Your EmailJS template ID
                        {
                            to_email: loginCredentials.email, // Send to the entered email
                            subject: "OTP for Password Reset",
                            message: `
                                ==============================
                                PASSWORD RESET OTP
                                ==============================

                                Hello,

                                We have received a request to reset your password.

                                Your OTP is: ${data.otp}

                                Please enter this OTP on the website to reset your password.

                                If you did not request a password reset, please ignore this email.

                                Thank you,
                                SDO Team
                            `,
                        },
                        "F6fJuRNFyTkkvDqbm" // Your EmailJS user ID
                    );
                } catch (error) {
                    console.error("Error sending OTP email:", error);
                    Swal.fire("Error", "Failed to send OTP email.", "error");
                }
            } else {
                Swal.fire("Error", data.message, "error");
            }
        } catch (error) {
            Swal.fire(
                "Error",
                "Could not send OTP. Please try again.",
                "error"
            );
        }
    };

    // Handle OTP submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                "https://ai-backend-drcx.onrender.com/api/verify-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: loginCredentials.email,
                        otp: loginCredentials.otp,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                setIsOTPVerified(true); // Mark OTP as verified
                Swal.fire("Success", "OTP verified successfully!", "success");
            } else {
                Swal.fire("Error", data.message, "error");
            }
        } catch (error) {
            Swal.fire(
                "Error",
                "Failed to verify OTP. Please try again.",
                "error"
            );
        }
    };

    // Handle password reset
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (loginCredentials.password !== loginCredentials.confirmPassword) {
            Swal.fire("Error", "Passwords do not match.", "error");
            return;
        }
        try {
            const response = await fetch(
                "https://ai-backend-drcx.onrender.com/api/reset-password",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: loginCredentials.email,
                        password: loginCredentials.password,
                    }),
                }
            );
            const data = await response.json();

            if (data.success) {
                Swal.fire(
                    "Success",
                    "Password reset successfully!",
                    "success"
                ).then(() => {
                    window.location.href = "/Login";
                });
            } else {
                Swal.fire("Error", data.message, "error");
            }
        } catch (error) {
            Swal.fire(
                "Error",
                "Failed to reset password. Please try again.",
                "error"
            );
        }
    };

    return (
        <section className="h-screen">
            <div className="flex justify-center items-center h-full">
                <div className="form__container w-2/5 h-full flex items-center">
                    <form
                        className="p-10"
                        onSubmit={
                            isOTPVerified ? handleResetPassword : handleSubmit
                        }
                    >
                        <div className="form__header mb-10">
                            <h1 className="text-2xl">
                                Center for Sustainable Development Office
                            </h1>
                            <h3 className="text-xl">
                                Batangas State University - TNEU
                            </h3>
                        </div>

                        {!isOTPVerified ? (
                            // Email and OTP fields
                            <>
                                <div className="form__group mt-6">
                                    <label className="block text-sm font-medium">
                                        Email
                                    </label>
                                    <div className="flex items-center mt-1">
                                        <input
                                            type="email"
                                            value={loginCredentials.email}
                                            onChange={(e) =>
                                                setLoginCredentials({
                                                    ...loginCredentials,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="form__input border mb-2 mt-1 block w-full px-3 py-4 rounded-md shadow-sm sm:text-sm focus:outline-none"
                                            required
                                            disabled={isOTPSent} // Disable email input after OTP is sent
                                        />
                                        {!isOTPSent && (
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 duration-300 text-white rounded-md"
                                                disabled={
                                                    !loginCredentials.email
                                                }
                                            >
                                                Send OTP
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {isOTPSent && (
                                    <>
                                        <div className="form__group mt-6">
                                            <label className="block text-sm font-medium">
                                                OTP
                                            </label>
                                            <input
                                                type="text"
                                                value={loginCredentials.otp}
                                                onChange={(e) =>
                                                    setLoginCredentials({
                                                        ...loginCredentials,
                                                        otp: e.target.value,
                                                    })
                                                }
                                                className="form__input border mb-2 mt-1 block w-full px-3 py-4 rounded-md shadow-sm sm:text-sm focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 duration-300 text-white rounded-md"
                                            disabled={!loginCredentials.otp}
                                        >
                                            Verify OTP
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            // Password reset fields
                            <>
                                <div className="form__group mt-6">
                                    <label className="block text-sm font-medium">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={loginCredentials.password}
                                            onChange={(e) =>
                                                setLoginCredentials({
                                                    ...loginCredentials,
                                                    password: e.target.value,
                                                })
                                            }
                                            className="form__input border mb-2 mt-1 block w-full px-3 py-4 rounded-md shadow-sm sm:text-sm focus:outline-none"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute top-1/2 right-3 transform -translate-y-1/2"
                                        >
                                            {showPassword ? (
                                                <FontAwesomeIcon
                                                    icon={faEyeSlash}
                                                />
                                            ) : (
                                                <FontAwesomeIcon icon={faEye} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="form__group mt-6">
                                    <label className="block text-sm font-medium">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                loginCredentials.confirmPassword
                                            }
                                            onChange={(e) =>
                                                setLoginCredentials({
                                                    ...loginCredentials,
                                                    confirmPassword:
                                                        e.target.value,
                                                })
                                            }
                                            className="form__input border mb-2 mt-1 block w-full px-3 py-4 rounded-md shadow-sm sm:text-sm focus:outline-none"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="absolute top-1/2 right-3 transform -translate-y-1/2"
                                        >
                                            {showConfirmPassword ? (
                                                <FontAwesomeIcon
                                                    icon={faEyeSlash}
                                                />
                                            ) : (
                                                <FontAwesomeIcon icon={faEye} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 duration-300 text-white rounded-md"
                                    disabled={!loginCredentials.password}
                                >
                                    Reset Password
                                </button>
                            </>
                        )}

                        <Link
                            to={"/login"}
                            className="mt-10 px-4 py-2 bg-red-500 hover:bg-red-600 duration-300 text-white rounded-md"
                        >
                            Back
                        </Link>
                    </form>
                </div>

                <div className="bg__container w-3/5 h-full">
                    <img
                        src={loginBG}
                        alt="login-bg"
                        className="h-full object-cover"
                    />
                </div>
            </div>
        </section>
    );
};

export default ForgotPassword;
