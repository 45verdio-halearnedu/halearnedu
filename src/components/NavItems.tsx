
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { mainNavItems, secondaryNavItems, settingsNavItems } from '@/data/navigationItems';

interface NavItemsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  collapsed: boolean;
}

const NavItems: React.FC<NavItemsProps> = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Main Navigation */}
      <div className="px-3 py-2">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(item.path)
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
            >
              {item.icon}
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="px-3 py-2">
        {!collapsed && (
          <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Services
          </h3>
        )}
        <div className="mt-2 space-y-1">
          {secondaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(item.path)
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
            >
              {item.icon}
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="px-3 py-2">
        <div className="space-y-1">
          {settingsNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(item.path)
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
            >
              {item.icon}
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavItems;
