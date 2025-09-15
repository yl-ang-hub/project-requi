import React, { use, useState } from "react";
import NavBar from "./components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import AuthContext from "./components/context/authContext";
import PRCreate from "./pages/PRCreate";
import UserCreate from "./pages/UserCreate";
import UserSearch from "./pages/UserSearch";
import Dashboard from "./pages/Dashboard";
import Logout from "./components/Logout";
import ProtectedRouter from "./components/ProtectedRouter";
import ApprovalsPending from "./pages/ApprovalsPending";
import PRSelf from "./pages/PRSelf";
import PRApproval from "./pages/PRApproval";
import ApprovalsHistory from "./pages/ApprovalsHistory";
import MMDCentralPool from "./pages/MMDCentralPool";
import PRView from "./pages/PRView";

function App() {
  const authCtx = use(AuthContext);
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthContext.Provider
        value={{
          accessToken,
          setAccessToken,
          role,
          setRole,
          userId,
          setUserId,
          name,
          setName,
        }}>
        <div className="flex">
          <div className="max-w-sm">
            <NavBar></NavBar>
          </div>
          <div className="w-full flex">
            <Routes>
              {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
              <Route path="/login" element={<Login />} />
              {/* <Route path="/admin/users" /> */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRouter>
                    <Dashboard />
                  </ProtectedRouter>
                }
              />
              <Route
                path="/approvals/pending"
                element={
                  <ProtectedRouter>
                    <ApprovalsPending />
                  </ProtectedRouter>
                }
              />
              <Route
                path="/approvals/:id"
                element={
                  <ProtectedRouter>
                    <PRApproval />
                  </ProtectedRouter>
                }
              />

              <Route
                path="/approvals/history"
                element={
                  <ProtectedRouter>
                    <ApprovalsHistory />
                  </ProtectedRouter>
                }
              />

              {/* REQUISITIONS */}
              <Route
                path="/pr/create"
                element={
                  <ProtectedRouter>
                    <PRCreate />
                  </ProtectedRouter>
                }
              />
              <Route
                path="/pr"
                element={
                  <ProtectedRouter>
                    <PRSelf />
                  </ProtectedRouter>
                }
              />
              <Route
                path="/pr/:id"
                element={
                  <ProtectedRouter>
                    <PRView />
                  </ProtectedRouter>
                }
              />

              <Route
                path="/pr/mmd_pool"
                element={
                  <ProtectedRouter>
                    <MMDCentralPool />
                  </ProtectedRouter>
                }
              />

              <Route
                path="/admin/users/add"
                element={
                  <ProtectedRouter>
                    <UserCreate />
                  </ProtectedRouter>
                }
              />
              <Route
                path="/admin/users/search"
                element={
                  <ProtectedRouter>
                    <UserSearch />
                  </ProtectedRouter>
                }
              />
              <Route path="/logout" element={<Logout />} />
            </Routes>
          </div>
        </div>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;
