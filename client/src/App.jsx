import React, { use, useState } from "react";
import NavBar from "./components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import AuthContext from "./components/context/authContext";
import PRCreate from "./pages/PRCreate";
import UserCreate from "./pages/UserCreate";

function App() {
  const authCtx = use(AuthContext);
  const [accessToken, setAccessToken] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthContext.Provider
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
          <div className="w-full flex">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              {/* <Route path="/admin/users" /> */}
              <Route path="/pr/create" element={<PRCreate />} />
              <Route path="/admin/users/add" element={<UserCreate />} />
            </Routes>
          </div>
        </div>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;
