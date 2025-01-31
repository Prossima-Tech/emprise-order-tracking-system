import { cn } from "../../lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { NavLink } from 'react-router-dom';
import { MENU_ITEMS } from '../../lib/config/menu';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  return (
    <>
      {/* Mobile sidebar overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setCollapsed(true)}
        />
      )}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-gray-100/40 transition-all duration-300 lg:relative",
        "border-r",
        collapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "w-64 translate-x-0",
      )}>
        <ScrollArea className="h-full py-6">
          <div className="space-y-4">
            <div className="px-3 py-2">
              <div className="space-y-1">
                {MENU_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100",
                        isActive ? "bg-gray-100" : "transparent"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && item.title}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};