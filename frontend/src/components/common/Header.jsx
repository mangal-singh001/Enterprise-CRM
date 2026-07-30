import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  Layers, 
  CheckCircle2, 
  ChevronDown, 
  GraduationCap, 
  Activity, 
  LayoutDashboard,
  Sparkles,
  Lock
} from 'lucide-react';

export const Header = () => {
  const { user, products, activeProduct, setActiveProduct, logout, darkMode, toggleDarkMode } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  const getProductIcon = (iconName) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case 'Activity': return <Activity className="w-4 h-4 text-cyan-500" />;
      default: return <Layers className="w-4 h-4 text-indigo-500" />;
    }
  };

  const activeProductData = products.find(p => p.id === activeProduct);

  return (
    <header className="glass-header px-4 lg:px-8 py-3 flex items-center justify-between shadow-sm border-b border-slate-200 dark:border-slate-800">
      {/* Brand & Product Selector */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveProduct('overview')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight">Enterprise CRM</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                Unified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Multi-Product Operations</p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

        {/* Product Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProductDropdownOpen(!productDropdownOpen)}
            className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            {activeProduct === 'overview' ? (
              <>
                <LayoutDashboard className="w-4 h-4 text-brand-500" />
                <span>Executive Dashboard</span>
              </>
            ) : (
              <>
                {getProductIcon(activeProductData?.icon)}
                <span>{activeProductData?.name || activeProduct}</span>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {productDropdownOpen && (
            <div 
              className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseLeave={() => setProductDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Workspaces
              </div>
              
              <button
                onClick={() => { setActiveProduct('overview'); setProductDropdownOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  activeProduct === 'overview' 
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <LayoutDashboard className="w-4 h-4 text-brand-500" />
                  <span>Executive Overview</span>
                </div>
                {activeProduct === 'overview' && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
              
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                SaaS Products
              </div>

              {products.map((prod) => (
                <button
                  key={prod.id}
                  disabled={!prod.authorized}
                  onClick={() => {
                    if (prod.authorized) {
                      setActiveProduct(prod.id);
                      setProductDropdownOpen(false);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    !prod.authorized
                      ? 'opacity-40 cursor-not-allowed text-slate-400'
                      : activeProduct === prod.id
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {getProductIcon(prod.icon)}
                    <div className="text-left">
                      <div>{prod.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal font-mono">{prod.code}</div>
                    </div>
                  </div>
                  {prod.authorized ? (
                    activeProduct === prod.id && <CheckCircle2 className="w-4 h-4 text-brand-500" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              ))}

              <div className="mt-2 p-2 mx-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Extensible architecture: dynamic plugin modules supported.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: SSO Identity & Theme */}
      <div className="flex items-center space-x-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Identity Profile Pill */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs shadow">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono leading-none">
                  {user.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">IdP Authenticated</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      SSO Verified
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1 text-sm">{user.name}</p>
                  <p className="text-xs text-slate-500 font-mono truncate">{user.email}</p>
                </div>

                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Authorized Scopes</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {user.products.map(p => (
                      <span key={p} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="px-2 pt-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out (Clear SSO Token)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
