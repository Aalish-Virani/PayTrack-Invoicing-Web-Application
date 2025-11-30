import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../customHooks/useAuth/useAuth.js";
import LogoutBtn from "../../components/LogoutBtn/LogoutBtn.jsx";
import { motion } from "framer-motion";

const UserProfilePage = () => {
  const { userLoggedIn, userId } = useAuth(); // userId comes from context, userLoggedIn() returns raw string or null
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidAmount: "0.00",
    pendingAmount: "0.00",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Your current userLoggedIn() returns raw userId string like "5" or null
        const currentUserId = userLoggedIn();

        // If no userId → not logged in
        if (!currentUserId) {
          setLoading(false);
          return;
        }

        // User is logged in → fetch profile
        const response = await fetch(`http://localhost:5173/user/profile/${currentUserId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();

        setUser({
          firstName: data.firstName || "User",
          lastName: data.lastName || "",
        });

        setStats({
          totalInvoices: data.totalInvoices || 0,
          paidAmount: data.paidAmount || "0.00",
          pendingAmount: data.pendingAmount || "0.00",
        });
      } catch (err) {
        console.error("Profile load error:", err);
        // On error, treat as not logged in
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userLoggedIn]);

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#141625] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#7c5dfa]"></div>
      </div>
    );
  }

  // Use userId from context — this is the most reliable source
  const isLoggedIn = !!userId;

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-gradient-to-br dark:from-[#1e2139] dark:via-[#141625] dark:to-[#1e2139] flex items-center justify-center px-4 py-12 transition-all duration-500">
      {/* Animated Blobs - Only in Dark Mode */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16">
        {isLoggedIn ? (
          /* ========== LOGGED IN – SHOW DASHBOARD ========== */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Avatar */}
            {/* <div className="mx-auto w-32 h-32 bg-gradient-to-br from-[#7c5dfa] to-[#9277ff] rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl mb-8">
              {user?.firstName?.[0]?.toUpperCase() || "U"}
            </div> */}

            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#7c5dfa] to-[#a78bfa] bg-clip-text text-transparent">
              Welcome back, {user?.firstName || "User"}!
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              Here's your invoicing overview
            </p>

            {/* Stats Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-[#1e2139] rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700"
              >
                {/* <div className="text-6xl mb-4">Invoices</div> */}
                <h3 className="text-3xl font-bold text-[#7f5cf8]">Total Invoices</h3>
                <p className="text-5xl font-extrabold mt-6 text-[#7f5cf8]">
                  {stats.totalInvoices}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-[#1e2139] rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700"
              >
                {/* <div className="text-6xl mb-4">Check</div> */}
                <h3 className="text-3xl font-bold text-[#39d09e]">Amount Paid</h3>
                <p className="text-5xl font-extrabold mt-6 text-[#39d09e]">
                  ${stats.paidAmount}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-[#1e2139] rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700"
              >
                {/* <div className="text-6xl mb-4">Clock</div> */}
                <h3 className="text-3xl font-bold text-[#fc9403]">Amount Pending</h3>
                <p className="text-5xl font-extrabold mt-6 text-[#fc9403]">
                  ${stats.pendingAmount}
                </p>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
              <button
                onClick={() => navigate("/")}
                className="px-12 py-5 bg-gradient-to-r from-[#7c5dfa] to-[#a78bfa] hover:from-[#7f5cf8] hover:to-[#7f5cf8] text-white font-bold text-lg rounded-full shadow-2xl transition-all"
              >
                Manage Invoices
              </button>
              <LogoutBtn />
            </div>
          </motion.div>
        ) : (
          //  ========== NOT LOGGED IN – WELCOME SCREEN ==========
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -30, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="text-9xl mb-8 text-black dark:text-white text-opacity-75 font-bold"
            >
              Invoices
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#7c5dfa] via-[#9277ff] to-[#b69fff] bg-clip-text text-transparent mb-8">
              Professional Invoicing <br /> Made Beautiful
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
              Create, send, and track invoices with ease. Join thousands of freelancers and businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/user/login")}
                className="px-12 py-5 bg-gradient-to-r from-[#7c5dfa] to-[#a78bfa] text-white text-xl font-bold rounded-full shadow-2xl"
              >
                Login
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/user/signup")}
                className="px-12 py-5 bg-white dark:bg-[#1e2139] text-[#7c5dfa] border-4 border-[#7c5dfa] hover:bg-[#7c5dfa] hover:text-white text-xl font-bold rounded-full shadow-2xl transition-all"
              >
                Sign Up Free
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;