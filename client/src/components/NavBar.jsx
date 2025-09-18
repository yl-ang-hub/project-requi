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
    <SidebarProvider>
      {isAuthenticated ? <AppSidebar /> : <GuestSidebar />}
      <main>
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
          <span className="text-gray-900 text-4xl font-extrabold md:text-xl lg:text-3xl">
            <span className="ml-3 text-transparent bg-clip-text bg-gradient-to-r to-indigo-600 from-violet-400">
              REQUI APP
            </span>
          </span>
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
                    <Link to="/po/pending/delivery">POs Pending Delivery</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/po/pending/payment">POs Pending Payment</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/po/completed">Completed POs</Link>
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          ""
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function GuestSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="my-2 mx-3">
        <div>
          <ModeToggle />
          <span className="text-gray-900 text-4xl font-extrabold md:text-xl lg:text-3xl">
            <span className="ml-3 text-transparent bg-clip-text bg-gradient-to-r to-indigo-600 from-violet-400">
              REQUI APP
            </span>
          </span>
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
