import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { DataTable } from './components/entity/DataTable';
import { DynamicEntityForm } from './components/entity/DynamicEntityForm';
import { metadataService, edupulseService, cloudmetricService } from './services/api';
import { 
  ShieldAlert, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal,
  Lock,
  Layers
} from 'lucide-react';

export const AppContent = () => {
  const { user, activeProduct, activeEntity, loading, authError } = useAuth();
  const [entitySchema, setEntitySchema] = useState(null);
  const [entityData, setEntityData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Fetch Entity Schema & Data whenever activeProduct or activeEntity changes
  const loadEntityData = async () => {
    if (activeProduct === 'overview' || !activeEntity) return;

    setDataLoading(true);
    try {
      // 1. Fetch dynamic schema
      const schemaData = await metadataService.getEntitySchema(activeProduct, activeEntity);
      setEntitySchema(schemaData);

      // 2. Fetch entity data records
      let records = [];
      if (activeProduct === 'edupulse') {
        if (activeEntity === 'subscription_plans') {
          records = await edupulseService.getPlans();
        } else if (activeEntity === 'message_templates') {
          records = await edupulseService.getTemplates();
        }
      } else if (activeProduct === 'cloudmetric') {
        if (activeEntity === 'client_sites') {
          records = await cloudmetricService.getSites();
        }
      }
      setEntityData(records);
    } catch (err) {
      console.error(`Error loading ${activeProduct}/${activeEntity}:`, err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadEntityData();
  }, [activeProduct, activeEntity]);

  const handleCreateNew = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm(`Are you sure you want to delete record #${recordId}?`)) return;

    try {
      setDataLoading(true);
      if (activeProduct === 'edupulse') {
        if (activeEntity === 'subscription_plans') {
          await edupulseService.deletePlan(recordId);
        } else if (activeEntity === 'message_templates') {
          await edupulseService.deleteTemplate(recordId);
        }
      } else if (activeProduct === 'cloudmetric') {
        if (activeEntity === 'client_sites') {
          await cloudmetricService.deleteSite(recordId);
        }
      }
      await loadEntityData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.detail || "Delete operation failed.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (activeProduct === 'edupulse') {
        if (activeEntity === 'subscription_plans') {
          if (editingRecord) {
            await edupulseService.updatePlan(editingRecord.id, formData);
          } else {
            await edupulseService.createPlan(formData);
          }
        } else if (activeEntity === 'message_templates') {
          if (editingRecord) {
            await edupulseService.updateTemplate(editingRecord.id, formData);
          } else {
            await edupulseService.createTemplate(formData);
          }
        }
      } else if (activeProduct === 'cloudmetric') {
        if (activeEntity === 'client_sites') {
          if (editingRecord) {
            await cloudmetricService.updateSite(editingRecord.id, formData);
          } else {
            await cloudmetricService.createSite(formData);
          }
        }
      }
      setFormOpen(false);
      await loadEntityData();
    } catch (err) {
      console.error("Form submission failed:", err);
      alert(err.response?.data?.detail || "Save operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-brand-500 mx-auto" />
          <h2 className="text-lg font-bold">Verifying IdP SSO Credentials...</h2>
          <p className="text-xs text-slate-400 font-mono">Internal Enterprise CRM Gateway</p>
        </div>
      </div>
    );
  }

  // 2. Auth Error State (No Token / Invalid Token)
  if (authError || !user) {
    const exampleCmd = `python scripts/generate_auth_token.py --user ops.lead@company.com --role ADMIN`;

    const copyScript = () => {
      navigator.clipboard.writeText(exampleCmd);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 text-rose-500 flex items-center justify-center border border-rose-800">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Identity Provider Authentication Required</h1>
            <p className="text-sm text-slate-400">
              {authError || "This internal application requires a signed IdP authentication token."}
            </p>
          </div>

          {/* Quick Helper Box for Local Developer SSO Token Generation */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-400">
              <span className="flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Local Testing - Helper Script</span>
              </span>
              <button
                onClick={copyScript}
                className="text-slate-400 hover:text-white flex items-center space-x-1"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? "Copied" : "Copy Command"}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Run the helper script in your terminal to generate a signed login link:
            </p>
            <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
              {exampleCmd}
            </pre>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500">
            Internal Enterprise CRM • Single Sign-On Gateway v1.0
          </div>
        </div>
      </div>
    );
  }

  // 3. Main Authenticated Application Dashboard
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {activeProduct === 'overview' ? (
            <ExecutiveDashboard />
          ) : (
            <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
              {/* Entity Module Header */}
              {entitySchema && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-semibold font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{entitySchema.product_id} workspace</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {entitySchema.plural_name}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {entitySchema.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Dynamic Entity Data Table */}
              <DataTable
                schema={entitySchema}
                data={entityData}
                loading={dataLoading}
                onRefresh={loadEntityData}
                onCreate={handleCreateNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </main>
      </div>

      {/* Dynamic Entity Create/Edit Form Modal */}
      <DynamicEntityForm
        schema={entitySchema}
        initialData={editingRecord}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        loading={submitting}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppContent />
  );
}
