import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Activity,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Search,
  Bell,
  HelpCircle,
  Check,
  ChevronDown,
  Plus,
  Upload,
  CalendarPlus,
  Building2,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function MainLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Activities', href: '/activities', icon: Activity },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="h-full px-4 flex items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg hidden sm:block">JK Homes</span>
            </div>

            {/* Workspace Dropdown - Custom Implementation */}
            <div className="relative">
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
              >
                <span className="hidden sm:inline">My Workspace</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${workspaceDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>

              {workspaceDropdownOpen && (
                <>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setWorkspaceDropdownOpen(false)}
                  />

                  {/* Dropdown Panel */}
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-900">My Workspace</span>
                    </div>

                    {/* Workspace List */}
                    <div className="py-1">
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 text-left"
                        onClick={() => setWorkspaceDropdownOpen(false)}
                      >
                        <Check className="h-4 w-4 text-blue-600" />
                        <span>My Workspace</span>
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 pl-9 text-sm hover:bg-gray-100 text-left"
                        onClick={() => setWorkspaceDropdownOpen(false)}
                      >
                        <span>JK Real Estate</span>
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 pl-9 text-sm hover:bg-gray-100 text-left"
                        onClick={() => setWorkspaceDropdownOpen(false)}
                      >
                        <span>Chennai Sales Team</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 text-left"
                        onClick={() => setWorkspaceDropdownOpen(false)}
                      >
                        <Plus className="h-4 w-4 text-gray-500" />
                        <span>Create New Workspace</span>
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 text-left"
                        onClick={() => setWorkspaceDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-gray-500" />
                        <span>Workspace Settings</span>
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 text-left"
                        onClick={() => setWorkspaceDropdownOpen(false)}
                      >
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>Manage Members</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search leads, deals, people..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Plus className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  Add Lead
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Schedule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <HelpCircle className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-gray-100 rounded-md p-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <nav className="h-full p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
