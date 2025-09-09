import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./ModeToggle";

export default function NavBar(props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {props.children}
      </main>
    </SidebarProvider>
  );
}

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="my-3 mx-3">
        <div>
          <ModeToggle />
          <span className="ml-3">REQUI APP</span>
        </div>
        <div>Shrek - Superuser</div>
      </SidebarHeader>
      <SidebarContent className="my-3 mx-3">
        <SidebarGroup>Dashboard</SidebarGroup>
        <SidebarGroup>Requisition</SidebarGroup>
        <SidebarGroup>Purchase Orders</SidebarGroup>
        <SidebarGroup>Suppliers</SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="my-3 mx-3">
        Sidebar Footer
        <br />
      </SidebarFooter>
    </Sidebar>
  );
}
