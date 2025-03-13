import React from "react";
import Navbar from "./components/Navbar";
import AppRoutes from "./config/AppRoutes";
import Footer from "./components/Footer";
import LocalStorageDebugger from "./components/LocalStorageDebugger";

const App = () => {
  return (
    <>
      <Navbar />
      <AppRoutes />
      <Footer />
      {process.env.NODE_ENV !== 'production' && <LocalStorageDebugger />}
    </>
  );
};

export default App;
