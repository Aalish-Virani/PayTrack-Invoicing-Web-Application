import React from "react";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Layout from "./Layout";
import MainPage from "./pages/MainPage/MainPage.jsx";
import InvoiceDetailsPage from "./pages/InvoiceDetailsPage/InvoiceDetailsPage.jsx";
import InvoiceForm from "./components/InvoiceForm/InvoiceForm.jsx";
import UserProfilePage from "./pages/UserProfilePage/UserProfilePage.jsx";
import UserLoginPage from "./pages/UserLoginPage/UserLoginPage.jsx";
import UserSignupPage from "./pages/UserSignupPage/UserSignupPage.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>

      <Route path="user/profile" element={<UserProfilePage />} />
      <Route path="user/login" element={<UserLoginPage />} />
      <Route path="user/signup" element={<UserSignupPage />} />

      <Route path="" element={<MainPage />} />

      <Route path="invoice/:id" element={<InvoiceDetailsPage />} />
      <Route path="invoice/new" element={<InvoiceForm />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
