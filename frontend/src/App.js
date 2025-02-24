import React from "react";
import Navbar from "./components/Navbar";
import AppRoutes from "./config/AppRoutes";
import Footer from "./components/Footer";

const App = () => {
  return (
    <>
      <Navbar />
      <AppRoutes />
      <Footer />
    </>
  );
};

export default App;
