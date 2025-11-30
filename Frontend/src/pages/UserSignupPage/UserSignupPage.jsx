import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../../customHooks/useAuth/useAuth.js";
import { motion } from "framer-motion";
import BackBtn from "../../components/BackBtn/BackBtn.jsx";

const UserSignupPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    server: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be 8+ characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, server: "" }));

    try {
      const res = await axios.post("http://localhost:5173/user/signup", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });

      if (res.status === 201) {
        login(res.data.userId);
        navigate("/");
      }
    } catch (err) {
      const msg =
        err.response?.status === 409
          ? "Email already exists"
          : err.response?.data?.message || "Signup failed";
      setErrors((prev) => ({ ...prev, server: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-gradient-to-br dark:from-[#1e2139] dark:via-[#141625] dark:to-[#1e2139] flex items-center justify-center px-4 py-12 transition-all duration-500">
      {/* Animated Blobs - Only in Dark Mode */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none dark:block hidden">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Back Button */}
        <div className="mb-8">
          <BackBtn />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-white/10 dark:backdrop-blur-xl rounded-3xl shadow-2xl dark:shadow-none dark:border dark:border-white/20 p-8 md:p-10 transition-all duration-500">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#7c5dfa] to-[#a78bfa] bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Start managing invoices like a pro
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alex"
                  className={`w-full px-5 py-4 rounded-xl border
                    bg-gray-50 dark:bg-white/10
                    border-gray-300 dark:border-white/20
                    text-gray-900 dark:text-white
                    placeholder-gray-500 dark:placeholder-gray-500
                    focus:outline-none focus:ring-4 focus:ring-[#7c5dfa]/20 focus:border-[#7c5dfa]
                    transition-all ${errors.firstName ? "border-red-500" : ""}`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  className={`w-full px-5 py-4 rounded-xl border
                    bg-gray-50 dark:bg-white/10
                    border-gray-300 dark:border-white/20
                    text-gray-900 dark:text-white
                    placeholder-gray-500 dark:placeholder-gray-500
                    focus:outline-none focus:ring-4 focus:ring-[#7c5dfa]/20 focus:border-[#7c5dfa]
                    transition-all ${errors.lastName ? "border-red-500" : ""}`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className={`w-full px-5 py-4 rounded-xl border
                  bg-gray-50 dark:bg-white/10
                  border-gray-300 dark:border-white/20
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-500
                  focus:outline-none focus:ring-4 focus:ring-[#7c5dfa]/20 focus:border-[#7c5dfa]
                  transition-all ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                className={`w-full px-5 py-4 rounded-xl border
                  bg-gray-50 dark:bg-white/10
                  border-gray-300 dark:border-white/20
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-500
                  focus:outline-none focus:ring-4 focus:ring-[#7c5dfa]/20 focus:border-[#7c5dfa]
                  transition-all ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Server Error */}
            {errors.server && (
              <div className="bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-center font-medium">
                {errors.server}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#7c5dfa] to-[#a78bfa] hover:from-[#7f5cf8] hover:to-[#7f5cf8] text-white font-bold text-lg rounded-xl shadow-xl transition-all disabled:opacity-70"
            >
              {isLoading ? "Creating Account..." : "Create Free Account"}
            </motion.button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/user/login" className="text-[#7c5dfa] font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <p className="text-center mt-10 text-sm text-gray-600 dark:text-gray-500">
          © 2025 PayTrack • Professional Invoicing
        </p>
      </motion.div>
    </div>
  );
};

export default UserSignupPage;