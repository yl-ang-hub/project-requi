import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./ModeToggle";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { use } from "react";
import AuthCtx from "./context/authContext";

export default function NavBar(props) {
  const authCtx = use(AuthCtx);
  const isAuthenticated = authCtx.accessToken.length > 0;

  return (
    <SidebarProvider className="bg-green-300">
      {isAuthenticated ? <AppSidebar /> : <GuestSidebar />}
      <main className="bg-blue-300">
        <SidebarTrigger />
      </main>
      <div>{props.children}</div>
    </SidebarProvider>
  );
}

function AppSidebar() {
  const authCtx = use(AuthCtx);

  return (
    <Sidebar>
      <SidebarHeader className="my-2 mx-3">
        <div>
          <ModeToggle />
          <span className="ml-3">REQUI APP</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="my-2 mx-3">
        <Collapsible className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                {`${authCtx.name} (${authCtx.role})`}
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/">Edit my profile</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/resetpassword">Change my password</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/logout">Sign out</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarGroup>
          <SidebarGroupLabel>Important Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {authCtx.role !== "Staff" ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/approvals/pending">Pending Approvals</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/approvals/history">Approval History</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : (
                ""
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/search">Global Search</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* REQUISITION NAV */}
        <SidebarGroup>
          <SidebarGroupLabel>Requisitions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/pr/create">Create New PR</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/pr">My PRs</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {authCtx.role.includes("MMD") ||
              authCtx.role === "System Admin" ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/pr/mmd_pool">PRs Awaiting MMD Action</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                ""
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* PURCHASE ORDERS NAV - only for MMD & Finance */}
        {authCtx.role.includes("Finance") ||
        authCtx.role.includes("MMD") ||
        authCtx.role === "System Admin" ? (
          <SidebarGroup>
            <SidebarGroupLabel>Purchase Orders</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/">POs Pending Delivery</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/">POs Pending Payment</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/">Completed POs</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          ""
        )}

        {/* SUPPLIERS NAV */}
        {authCtx.role.includes("MMD") || authCtx.role === "System Admin" ? (
          <SidebarGroup>
            <SidebarGroupLabel>Suppliers</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/">Add New Supplier</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/">Manage Suppliers</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          ""
        )}

        {/* ADMIN NAV */}
        {authCtx.role === "IT Officer" || authCtx.role === "System Admin" ? (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/admin/users/add">Add New User</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/admin/users/search">Search/Edit User</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/">Add New Role</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/">Edit Existing Role</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          ""
        )}
      </SidebarContent>

      <SidebarFooter className="my-3 mx-3">
        Sidebar Footer
        <br />
      </SidebarFooter>
    </Sidebar>
  );
}

function GuestSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="my-2 mx-3">
        <div>
          <ModeToggle />
          <span className="ml-3">REQUI APP</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="my-2 mx-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/login">Login</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
