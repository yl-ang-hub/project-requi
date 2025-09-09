import React, { use, useState } from "react";
import NavBar from "./components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import AuthCtx from "./components/context/authContext";

function App() {
  const authCtx = use(AuthCtx);
  const [accessToken, setAccessToken] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthCtx.Provider
        value={{
          accessToken,
          setAccessToken,
          username,
          setUsername,
          userId,
          setUserId,
        }}>
        <div className="flex">
          <div className="max-w-sm">
            <NavBar></NavBar>
          </div>
          <div className="w-full flex bg-red-100">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </div>
      </AuthCtx.Provider>
    </ThemeProvider>
  );
}

export default App;
