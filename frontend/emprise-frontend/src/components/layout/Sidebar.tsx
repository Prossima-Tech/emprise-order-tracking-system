import { cn } from "../../lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { NavLink } from 'react-router-dom';
import { MENU_ITEMS } from '../../lib/config/menu';
import { useAuthStore } from '../../lib/stores/auth-store';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const { user } = useAuthStore();

  // Filter menu items based on user role and permissions
  const authorizedMenuItems = MENU_ITEMS.filter(item => {
    // Admin can see everything
    if (user?.role === 'ADMIN') return true;

    // PO Specialist can only see PO-related items
    if (user?.role === 'PO_SPECIALIST') {
      return ['/purchase-orders', '/items', '/vendors'].some(
        path => item.path.startsWith(path)
      );
    }

    // BO Specialist can only see Budgetary Offers
    if (user?.role === 'BO_SPECIALIST') {
      return ['/budgetary-offers'].some(
        path => item.path.startsWith(path)
      );
    }

    return false;
  });

  return (
    <>
      {/* Mobile sidebar overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-600"
          onClick={() => setCollapsed(true)}
        />
      )}
      <div className={cn(
        "fixed inset-y-0 left-0 bg-white transition-all duration-300 lg:relative",
        "border-r shadow-sm",
        "z-50 mt-14 lg:mt-0",
        collapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "w-64 translate-x-0",
      )}>
        <ScrollArea className="h-full py-2">
          <div className="space-y-4">
            <div className="px-3 py-2">
              <div className="space-y-1">
                {authorizedMenuItems.map((item) => (
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