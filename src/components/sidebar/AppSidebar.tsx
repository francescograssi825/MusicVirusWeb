import {
  Music,
  ChevronUp,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// Importa gli items definiti in user.tsx
import { mainItems, settingsItems } from "./User";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "../auth/AuthContext";
import ProfileImage from "./ProfileImage";

export function AppSidebar() {
  const location = useLocation();
    const { logout: authLogout} = useAuth();

  return (
    <Sidebar
      className="bg-black border-r border-gray-800"
      collapsible="icon"
    >
      <SidebarHeader className="bg-black">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="text-white hover:bg-gray-800">
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-black">
                  <Music className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">MusicVirus</span>
                  <span className="truncate text-xs text-gray-300">La tua musica preferita</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-black">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Navigazione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className={`text-white hover:bg-gray-800 ${location.pathname === item.url
                        ? 'bg-gray-800 text-white'
                        : ''
                      }`}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="text-white" />
                      <span className="text-white">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className={`text-white hover:bg-gray-800 ${location.pathname === item.url
                        ? 'bg-gray-800 text-white'
                        : ''
                      }`}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="text-white" />
                      <span className="text-white">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-black">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="text-white hover:bg-gray-800"
                  tooltip={localStorage.getItem('username')}
                >
                  <ProfileImage/>
                  <span className="text-white">{localStorage.getItem('username')}</span>
                  <ChevronUp className="ml-auto text-white" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] bg-gray-800 border-gray-700"
              >
                <DropdownMenuItem className="text-white hover:bg-gray-700">
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-700">
                  <span>Fatturazione</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-white hover:bg-gray-700"
                  onClick={() => {
                    authLogout();

                    window.location.reload(); 

                    window.location.replace("/")
                  }}
                >
                  <span>Esci</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
