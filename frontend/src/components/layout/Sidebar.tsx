import { useState } from "react";
import { cn } from "../../lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { NavLink } from 'react-router-dom';
import { MENU_ITEMS, MENU_SECTIONS } from '../../lib/config/menu';
import { useAuthStore } from '../../lib/stores/auth-store';

import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";


interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const { user } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

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

  // Group menu items by section
  const menuItemsBySection = MENU_SECTIONS.map(section => ({
    ...section,
    items: authorizedMenuItems.filter(item => item.section === section.id)
  })).filter(section => section.items.length > 0);


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
        "fixed inset-y-0 left-0 bg-white dark:bg-gray-900 transition-all duration-300 lg:relative",
        "border-r shadow-sm",
        "z-50 mt-14 lg:mt-0",
        collapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "w-64 translate-x-0",
      )}>
        <ScrollArea className="h-full py-2">
          <div className="space-y-2">
            {menuItemsBySection.map((section) => (
              <div key={section.id} className="px-2 py-1">
                {collapsed ? (
                  <div className="mb-2">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 p-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium">
                              {section.title.charAt(0)}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {section.title}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <Accordion
                    type="multiple"
                    value={expandedSections}
                    onValueChange={setExpandedSections}
                    className="border-none"
                  >
                    <AccordionItem value={section.id} className="border-none">
                      <AccordionTrigger 
                        className="py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 no-underline text-left"
                      >
                        {section.title}
                      </AccordionTrigger>
                      <AccordionContent className="pb-1 pt-0 px-0">
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                                  isActive 
                                    ? "bg-gray-100 dark:bg-gray-800 text-primary" 
                                    : "text-gray-700 dark:text-gray-300"
                                )
                              }
                            >
                              <item.icon className="h-4 w-4" />
                              <span className="truncate">{item.title}</span>
                            </NavLink>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                
                {collapsed && (
                  <div className="mt-1 space-y-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center justify-center p-2 rounded-md",
                            isActive 
                              ? "bg-gray-100 dark:bg-gray-800 text-primary" 
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )
                        }
                        title={item.title}
                      >
                        <item.icon className="h-4 w-4" />
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};