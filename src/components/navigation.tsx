'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  Repeat,
  Gauge,
  FileText,
  Tag,
  Radio,
  Key,
  Search,
  Bell,
  ChevronDown,
  Check,
  Plus,
  Building2,
  LogOut,
  User,
  Settings,
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Menu,
} from 'lucide-react';

interface NavigationProps {
  onOpenCommand: () => void;
  isLiveMode?: boolean;
  onToggleMode?: () => void;
}

export function Navigation({
  onOpenCommand,
  isLiveMode = true,
  onToggleMode,
}: NavigationProps) {
  const pathname = usePathname();

  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dropdown States
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Modal States
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isBillingPlansOpen, setIsBillingPlansOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isNewWorkspaceOpen, setIsNewWorkspaceOpen] = useState(false);

  // Form & User States
  const [userName, setUserName] = useState('Alex Chen');
  const [userEmail, setUserEmail] = useState('alex@acmecorp.com');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password & Security States
  const [accountTab, setAccountTab] = useState<'general' | 'security'>('general');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Workspace States
  const [selectedOrg, setSelectedOrg] = useState('Acme Corp');
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState('Scale Tier');
  const [currentPlan, setCurrentPlan] = useState('Enterprise');

  const [orgs, setOrgs] = useState([
    { id: 'org_1', name: 'Acme Corp', plan: 'Enterprise' },
    { id: 'org_2', name: 'HyperAI Cloud', plan: 'Scale Tier' },
    { id: 'org_3', name: 'Vortex Labs', plan: 'Pro Dev' },
  ]);

  const orgRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const notifications = [
    { id: 'n1', title: 'Payment received', desc: '$2,450.00 from HyperAI Technologies', time: '2m ago', unread: true },
    { id: 'n2', title: 'Subscription upgraded', desc: 'Zenith Vector upgraded to Pro Plan ($99/mo)', time: '14m ago', unread: true },
    { id: 'n3', title: 'Invoice settled', desc: 'INV-2026-0042 marked as paid', time: '1h ago', unread: false },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;
    const newWs = {
      id: `org_${Date.now()}`,
      name: newOrgName,
      plan: newOrgPlan,
    };
    setOrgs((prev) => [...prev, newWs]);
    setSelectedOrg(newWs.name);
    setNewOrgName('');
    setIsNewWorkspaceOpen(false);
    showToast(`Workspace "${newWs.name}" created and switched`);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAccountSettingsOpen(false);
    showToast('Account profile settings updated');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('Error: Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Error: Passwords do not match');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsAccountSettingsOpen(false);
    showToast('Password changed successfully');
  };

  const handleChangePlan = (planName: string) => {
    setCurrentPlan(planName);
    showToast(`Subscription plan updated to ${planName}`);
  };

  const navSections = [
    {
      title: null,
      items: [
        { label: 'Overview', href: '/', icon: LayoutGrid },
      ],
    },
    {
      title: 'Billing & Operations',
      items: [
        { label: 'Payments', href: '/payments', icon: CreditCard },
        { label: 'Invoices', href: '/invoices', icon: FileText },
        { label: 'Subscriptions', href: '/subscriptions', icon: Repeat },
        { label: 'Usage', href: '/usage', icon: Gauge },
        { label: 'Customers', href: '/customers', icon: Users },
        { label: 'Coupons', href: '/coupons', icon: Tag },
      ],
    },
    {
      title: 'Developers',
      items: [
        { label: 'API Keys', href: '/api-keys', icon: Key },
        { label: 'Webhooks', href: '/webhooks', icon: Radio },
      ],
    },
  ];

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md">
        {/* Left: Brand & Workspace Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
              <img src="/icon.png" alt="Stripoo" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">Stripoo</span>
          </Link>

          <div className="hidden h-4 w-[1px] bg-slate-200 md:block" />

          {/* Interactive Workspace Selector */}
          <div className="relative" ref={orgRef}>
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
            >
              <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
              <span className="font-semibold text-slate-900">{selectedOrg}</span>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-150 ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Workspaces
                </div>
                <div className="space-y-0.5">
                  {orgs.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        setSelectedOrg(org.name);
                        setIsOrgDropdownOpen(false);
                        showToast(`Switched to ${org.name}`);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                        selectedOrg === org.name
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <div>
                          <div>{org.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{org.plan}</div>
                        </div>
                      </div>
                      {selectedOrg === org.name && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>

                <div className="mt-1.5 border-t border-slate-100 pt-1.5">
                  <button
                    onClick={() => {
                      setIsOrgDropdownOpen(false);
                      setIsNewWorkspaceOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create new workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <button
          onClick={onOpenCommand}
          className="flex h-9 w-full max-w-sm items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 transition shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
            <span>Search customers, payments, invoices...</span>
          </div>
          <div className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-2xs">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </button>

        {/* Right: Mode Toggle, Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* Live / Test Toggle */}
          <button
            onClick={onToggleMode}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition shadow-2xs cursor-pointer ${
              isLiveMode
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/70'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100/70'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isLiveMode ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isLiveMode ? 'Live' : 'Test data'}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-1.5 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-700">
                    2 new
                  </span>
                </div>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-lg p-2.5 text-xs transition ${
                        n.unread ? 'bg-indigo-50/50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-600">{n.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 font-mono text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
            >
              AC
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                <div className="border-b border-slate-100 px-3 py-2">
                  <div className="text-xs font-bold text-slate-900">{userName}</div>
                  <div className="text-[11px] text-slate-500">{userEmail}</div>
                </div>

                <div className="mt-1 space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsAccountSettingsOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Account settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsBillingPlansOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    <span>Billing & plans</span>
                  </button>
                </div>

                <div className="mt-1 border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsSignOutOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stripe-Standard Sectioned Sidebar */}
      <aside className="fixed left-0 top-14 bottom-0 z-30 hidden w-64 flex-col justify-between border-r border-slate-200 bg-white p-3 lg:flex">
        <div className="space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 stroke-[1.75] ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Clean System Operational Footer */}
        <div className="border-t border-slate-100 p-2 text-xs flex items-center justify-between text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-slate-600">All systems 100%</span>
          </div>
          <span className="text-[10px] text-slate-400">v1.0</span>
        </div>
      </aside>

      {/* Mobile Slide-Out Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex w-72 flex-col justify-between border-r border-slate-200 bg-white p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img src="/icon.png" alt="Stripoo" className="h-7 w-7 object-contain" />
                  <span className="font-bold text-slate-900 text-sm">Stripoo Engine</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {navSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  {section.title && (
                    <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {section.title}
                    </div>
                  )}
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`h-4 w-4 stroke-[1.75] ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Systems 100%</span>
              </span>
              <span>v1.0</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Account Settings */}
      {isAccountSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Account Settings</h2>
                <p className="text-xs text-slate-500">Manage your profile, security, and authentication</p>
              </div>
              <button onClick={() => setIsAccountSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Account Tabs */}
            <div className="flex gap-2 border-b border-slate-100 pt-3 pb-2 text-xs">
              <button
                type="button"
                onClick={() => setAccountTab('general')}
                className={`rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  accountTab === 'general'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Profile & 2FA
              </button>
              <button
                type="button"
                onClick={() => setAccountTab('security')}
                className={`rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  accountTab === 'security'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Password & Security
              </button>
            </div>

            {accountTab === 'general' ? (
              <form onSubmit={handleSaveAccount} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Two-Factor Authentication (2FA)</div>
                      <div className="text-[11px] text-slate-500">Require an authenticator app for logins</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        twoFactorEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAccountSettingsOpen(false)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700 transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                  {newPassword && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="h-1 flex-1 rounded bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full ${
                            newPassword.length < 8
                              ? 'w-1/3 bg-rose-500'
                              : newPassword.length < 12
                              ? 'w-2/3 bg-amber-500'
                              : 'w-full bg-emerald-500'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {newPassword.length < 8 ? 'Weak' : newPassword.length < 12 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAccountSettingsOpen(false)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700 transition cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Billing & Plans */}
      {isBillingPlansOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Billing & Plans</h2>
                <p className="text-xs text-slate-500">Stripoo Platform Subscription & Quotas</p>
              </div>
              <button onClick={() => setIsBillingPlansOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Current Active Plan Card */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
                      Current Plan
                    </span>
                    <h3 className="mt-1 text-base font-bold text-slate-900">{currentPlan}</h3>
                    <p className="text-[11px] text-slate-600">5M meter events/mo • Unlimited seats • Dedicated webhooks</p>
                  </div>
                  <div className="text-right font-mono font-bold text-lg text-slate-900">
                    $499<span className="text-xs font-normal text-slate-500">/mo</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="h-4 w-4 text-slate-600" />
                  <div>
                    <div className="font-semibold text-slate-900">Visa ending in 4242</div>
                    <div className="text-[11px] text-slate-500">Expires 12/2028 • Primary card</div>
                  </div>
                </div>
                <span className="rounded bg-white px-2 py-1 text-[11px] font-medium text-slate-700 border border-slate-200">
                  Default
                </span>
              </div>

              {/* Available Plans */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Available Tiers</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChangePlan('Pro Scale Tier')}
                    className="flex flex-col items-start rounded-xl border border-slate-200 p-3 hover:border-indigo-400 hover:bg-indigo-50/30 transition text-left cursor-pointer"
                  >
                    <span className="font-bold text-slate-900">Pro Scale</span>
                    <span className="font-mono text-xs text-indigo-600 font-semibold">$199/mo</span>
                    <span className="text-[10px] text-slate-500 mt-1">1M events/mo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChangePlan('Enterprise Custom')}
                    className="flex flex-col items-start rounded-xl border border-slate-200 p-3 hover:border-indigo-400 hover:bg-indigo-50/30 transition text-left cursor-pointer"
                  >
                    <span className="font-bold text-slate-900">Custom Enterprise</span>
                    <span className="font-mono text-xs text-indigo-600 font-semibold">$999/mo</span>
                    <span className="text-[10px] text-slate-500 mt-1">Unlimited scale</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBillingPlansOpen(false)}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Sign Out Confirmation */}
      {isSignOutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-base font-bold text-slate-900">Sign Out</h2>
            <p className="mt-1 text-xs text-slate-500">
              Are you sure you want to end your current session for <span className="font-semibold text-slate-700">{userName}</span>?
            </p>

            <div className="mt-6 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsSignOutOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignOutOpen(false);
                  showToast('Signed out successfully. Session reset.');
                }}
                className="rounded-lg bg-rose-600 px-4 py-1.5 font-semibold text-white hover:bg-rose-700 transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Create Workspace */}
      {isNewWorkspaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Create New Workspace</h2>
              <button onClick={() => setIsNewWorkspaceOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Workspace / Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anthropic AI"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tier Plan</label>
                <select
                  value={newOrgPlan}
                  onChange={(e) => setNewOrgPlan(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono"
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Scale Tier">Scale Tier</option>
                  <option value="Pro Dev">Pro Dev</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewWorkspaceOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700 transition cursor-pointer"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
