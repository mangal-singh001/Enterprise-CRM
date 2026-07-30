import React, { useState, useEffect } from 'react';
import { X, Save, Key, Sparkles, Plus, Trash, Code2, AlertCircle } from 'lucide-react';
import { cloudmetricService } from '../../services/api';

export const DynamicEntityForm = ({
  schema,
  initialData = null,
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState({});
  const [jsonRaw, setJsonRaw] = useState({});
  const [jsonErrors, setJsonErrors] = useState({});
  const [generatingKey, setGeneratingKey] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      // Initialize raw JSON strings for any json typed fields
      const jsonFields = {};
      schema?.fields?.forEach(f => {
        if (f.type === 'json') {
          jsonFields[f.key] = JSON.stringify(initialData[f.key] || f.default || {}, null, 2);
        }
      });
      setJsonRaw(jsonFields);
    } else if (schema) {
      // Set defaults for new record creation
      const defaults = {};
      const jsonFields = {};

      schema.fields.forEach(field => {
        if (field.key === 'api_key' && schema.product_id === 'cloudmetric') {
          defaults[field.key] = `cm_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 10)}`;
        } else if (field.default !== undefined) {
          defaults[field.key] = field.default;
        } else {
          defaults[field.key] = '';
        }

        // Special default initializer for EduPulse Message Template channel config
        if (schema.id === 'message_templates' && field.key === 'configuration') {
          defaults[field.key] = {
            subject: 'Transactional Notification',
            html_body: '<h2>Hello {{name}}</h2><p>Your update is complete.</p>',
            sender_email: 'notifications@edupulse.io'
          };
          jsonFields[field.key] = JSON.stringify(defaults[field.key], null, 2);
        } else if (schema.id === 'subscription_plans' && field.key === 'features') {
          defaults[field.key] = { max_students: 500, custom_domain: true, analytics: "Basic" };
          jsonFields[field.key] = JSON.stringify(defaults[field.key], null, 2);
        } else if (field.type === 'json') {
          jsonFields[field.key] = JSON.stringify({}, null, 2);
        }
      });
      setFormData(defaults);
      setJsonRaw(jsonFields);
    }
  }, [initialData, schema, isOpen]);

  if (!isOpen || !schema) return null;

  const handleChange = (key, value) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };

      // Channel-dependent configuration updates for EduPulse Message Templates
      if (schema.id === 'message_templates' && key === 'channel') {
        let channelConfig = {};
        if (value === 'Email') {
          channelConfig = {
            subject: 'Email Notification Subject',
            html_body: '<h1>Hello {{user_name}}</h1>',
            sender_email: 'noreply@edupulse.io'
          };
        } else if (value === 'SMS') {
          channelConfig = {
            message_text: 'EduPulse Alert: {{message_content}}',
            sender_id: 'EDUPULSE'
          };
        } else if (value === 'WhatsApp') {
          channelConfig = {
            template_name: 'grade_alert_v1',
            language: 'en_US',
            header_text: 'Official Report'
          };
        } else {
          channelConfig = { body: 'Notification content' };
        }
        updated.configuration = channelConfig;
        setJsonRaw(prevRaw => ({
          ...prevRaw,
          configuration: JSON.stringify(channelConfig, null, 2)
        }));
      }

      return updated;
    });
  };

  const handleJsonTextChange = (key, textValue) => {
    setJsonRaw(prev => ({ ...prev, [key]: textValue }));
    try {
      const parsed = JSON.parse(textValue);
      setFormData(prev => ({ ...prev, [key]: parsed }));
      setJsonErrors(prev => ({ ...prev, [key]: null }));
    } catch (e) {
      setJsonErrors(prev => ({ ...prev, [key]: "Invalid JSON format syntax" }));
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      setGeneratingKey(true);
      const res = await cloudmetricService.generateApiKey();
      setFormData(prev => ({ ...prev, api_key: res.api_key }));
    } catch (err) {
      console.error("API Key generation failed:", err);
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    // Validate JSON fields
    const hasJsonErrors = Object.values(jsonErrors).some(err => err !== null);
    if (hasJsonErrors) {
      alert("Please fix JSON formatting syntax errors before saving.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {initialData ? `Edit ${schema.name}` : `Create New ${schema.name}`}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Product: <span className="uppercase font-semibold text-brand-600 dark:text-brand-400">{schema.product_id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form id="entity-form" onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-6">
          {schema.fields.map(field => {
            if (field.read_only && !initialData) return null;

            return (
              <div key={field.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  {field.key === 'api_key' && schema.product_id === 'cloudmetric' && (
                    <button
                      type="button"
                      onClick={handleGenerateApiKey}
                      disabled={generatingKey}
                      className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Auto-Generate API Key</span>
                    </button>
                  )}
                </div>

                {field.help_text && (
                  <p className="text-[11px] text-slate-400">{field.help_text}</p>
                )}

                {/* Input Controls depending on type */}
                {field.type === 'text' && (
                  <input
                    type="text"
                    required={field.required}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    step="any"
                    required={field.required}
                    value={formData[field.key] !== undefined ? formData[field.key] : ''}
                    onChange={(e) => handleChange(field.key, parseFloat(e.target.value) || 0)}
                    placeholder={field.placeholder}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                  />
                )}

                {field.type === 'select' && (
                  <select
                    value={formData[field.key] || field.default || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}

                {field.type === 'json' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Code2 className="w-3.5 h-3.5 text-brand-500" />
                        <span>JSON Configuration Schema</span>
                      </span>
                      {jsonErrors[field.key] && (
                        <span className="text-rose-500 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{jsonErrors[field.key]}</span>
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={6}
                      value={jsonRaw[field.key] || ''}
                      onChange={(e) => handleJsonTextChange(field.key, e.target.value)}
                      className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </form>

        {/* Modal Footer Controls */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            form="entity-form"
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving Record..." : "Save Record"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
