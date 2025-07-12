
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from './AuthPage';
import NavItems from './NavItems';
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, loading, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show AuthPage if user is not authenticated
  if (!user) {
    return <AuthPage />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-sm transition-all duration-300 flex flex-col hidden md:flex`}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-gray-900">LendChain</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <NavItems collapsed={sidebarCollapsed} />

        {/* User section */}
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="text-sm text-gray-600 truncate">
                {user.email}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="h-16 flex items-center justify-between px-4 border-b">
              <h1 className="text-xl font-bold text-gray-900">LendChain</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <NavItems collapsed={false} />
            <div className="mt-auto p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 truncate">
                  {user.email}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">LendChain</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
