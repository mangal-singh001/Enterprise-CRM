import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  Mail, 
  Globe, 
  FolderTree, 
  Sparkles, 
  Database,
  ArrowRight
} from 'lucide-react';

export const Sidebar = () => {
  const { activeProduct, activeEntity, setActiveEntity, setActiveProduct, products } = useAuth();

  const getEntityIcon = (entityId) => {
    switch (entityId) {
      case 'subscription_plans': return <CreditCard className="w-4 h-4" />;
      case 'message_templates': return <Mail className="w-4 h-4" />;
      case 'client_sites': return <Globe className="w-4 h-4" />;
      default: return <FolderTree className="w-4 h-4" />;
    }
  };

  const currentProductData = products.find(p => p.id === activeProduct);

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-61px)]">
      <div className="p-4 space-y-6">
        {/* Navigation Sections */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          <button
            onClick={() => setActiveProduct('overview')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeProduct === 'overview'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Executive Dashboard</span>
          </button>
        </div>

        {/* Active Product Entity Module Selector */}
        {activeProduct !== 'overview' && currentProductData && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>{currentProductData.name} Entities</span>
              <span className="font-mono text-[10px] text-slate-400">v1.0</span>
            </div>

            <div className="space-y-1">
              {currentProductData.entities?.map(entity => {
                const isActive = activeEntity === entity.id;
                return (
                  <button
                    key={entity.id}
                    onClick={() => setActiveEntity(entity.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold border border-slate-200 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={isActive ? "text-brand-500" : "text-slate-400"}>
                        {getEntityIcon(entity.id)}
                      </span>
                      <span>{entity.plural_name}</span>
                    </div>
                    {isActive && <ArrowRight className="w-3.5 h-3.5 text-brand-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Switch Quick Bar */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspaces
          </div>
          <div className="space-y-1">
            {products.map(p => (
              <button
                key={p.id}
                disabled={!p.authorized}
                onClick={() => setActiveProduct(p.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeProduct === p.id
                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-semibold'
                    : p.authorized
                    ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    : 'text-slate-400 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.name}</span>
                </div>
                {p.authorized ? (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                    {p.entities?.length || 0} entities
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-500 font-medium">Locked</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extensibility Footer Info */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Plugin Ready</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
          New modules & products register dynamically via the backend metadata architecture.
        </p>
      </div>
    </aside>
  );
};
