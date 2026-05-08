import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from '@formio/react';
import { Formio } from '@formio/js';
import { ApiClient as apiClient } from '../../utils/ApiClient';
import { API_ROUTES } from '../../constants/routes';

const FORMIO_URL = (window._env_?.FORMS_FLOW_FORMIO_URL as string) || 'http://localhost:3001';

// Formsflow forms embed custom JS that references authenticated user objects (groups,
// roles, currentUser, keycloak). These don't exist in an anonymous external-link session
// and cause null-reference crashes during visibility evaluation.
// This sanitizer walks the schema and:
//   1. Removes customConditional from components that reference those objects
//      → the component is ALWAYS VISIBLE (reviewer sees the full form)
//   2. Converts custom-action buttons that reference those objects to standard
//      submit buttons → they route through onSubmit without crashing
const FORMSFLOW_CTX_PATTERN =
  /\bgroups\b|\broles\b|\bcurrentUser\b|\bkeycloak\b|\binstance\b|\bmetadata\b|\bformUrl\b|\bapplicationId\b/;

function sanitizeComponent(component: any): any {
  const c = { ...component };

  if (c.customConditional && FORMSFLOW_CTX_PATTERN.test(c.customConditional)) {
    console.info(`[Schema] Stripping customConditional from '${c.key}' — always shown for external-link.`);
    delete c.customConditional;
    if (c.conditional) {
      c.conditional = { show: null, when: null, eq: '' };
    }
  }

  // 2. Intelligent Custom Action Handler
  // Instead of executing the broken Form.io HTTP save scripts normally embedded in
  // Custom Buttons, we natively trigger instance.root.submit().
  // We first SCAN the original script to see if the builder hardcoded a specific
  if (c.type === 'button' && c.action === 'custom' && c.custom) {
    // Extract the action the user was attempting to set manually in code
    const match = c.custom.match(/(?:actionType|applicationStatus|reviewerAction|actionName|action)['"]?\s*\]?\s*[:=]\s*['"]([^'"]+)['"]/i);
    const hardcodedAction = match ? match[1] : null;

    if (hardcodedAction) {
      console.info(`[Schema] Hardcoded action '${hardcodedAction}' detected in button '${c.key}'. Injecting into payload.`);
    }

    c.custom = `
      try {
        ${hardcodedAction ? `
          data.action = '${hardcodedAction}';
          data.applicationStatus = '${hardcodedAction}';
          data.reviewerAction = '${hardcodedAction}';
        ` : '// No hardcoded action detected, relying on form fields.'}

        // Native Form.io submit engine
        instance.root.submit();
      } catch (e) {
        console.error('ExternalLink Auto-Submit Error:', e);
      }
    `;
  }
  if (Array.isArray(c.components)) {
    c.components = (c.components as Array<Record<string, unknown>>).map(sanitizeComponent);
  }
  if (Array.isArray(c.columns)) {
    c.columns = c.columns.map((col: any) => ({
      ...col,
      components: Array.isArray(col.components)
        ? col.components.map(sanitizeComponent)
        : col.components,
    }));
  }
  if (Array.isArray(c.rows)) {
    c.rows = c.rows.map((row: any[]) => row.map(sanitizeComponent));
  }

  return c;
}

function sanitizeSchema(schema: any): any {
  if (!schema || !Array.isArray(schema.components)) return schema;
  return { ...schema, components: schema.components.map(sanitizeComponent) };
}

interface FormData {
  schema: any;
  prefill: any;
  taskId: string;
  formId: string;
}

function ExternalLinkPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'ready'>(
    () => (token ? 'loading' : 'error')
  );
  const [formData, setFormData] = useState<FormData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>(
    () => (token ? '' : 'Invalid or missing access link. Please request a new one.')
  );

  useEffect(() => {
    Formio.setProjectUrl(FORMIO_URL);
    Formio.setAuthUrl(FORMIO_URL);
  }, []);

  useEffect(() => {
    if (!token) return;

    apiClient.get<any>(API_ROUTES.EXTERNAL.GET_FORM(token))
      .then((res) => {
        if (res.data.schema) {
          const cleanSchema = sanitizeSchema(res.data.schema);
          setFormData({ ...res.data, schema: cleanSchema });
          setStatus('ready');
        } else {
          setStatus('error');
          setErrorMessage('Form failed to load. Please try again.');
        }
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Link expired or invalid. Please request a new one.');
      });
  }, [token]);

  const submitToBackend = (data: any) => {
    if (!token || !formData) return;
    setStatus('loading');

    apiClient.post(API_ROUTES.EXTERNAL.SUBMIT_FORM, {
      token,
      data,
      taskId: formData.taskId,
      formId: formData.formId,
    })
      .then(() => setStatus('success'))
      .catch((err: Error) => {
        console.error('Submission error', err);
        setStatus('ready');
        alert('Submission failed. Please try again.');
      });
  };

  const onFormSubmit = (submission: any) => submitToBackend(submission.data);

  const onCustomEvent = (event: any) => {
    if (event?.data) submitToBackend(event.data);
  };

  return (
    <div className="portal-container">

      {/* Loading */}
      {status === 'loading' && (
        <div className="portal-card portal-status-center">
          <div className="modern-spinner mb-5" />
          <h2>Preparing Your Form</h2>
          <p>We're securely fetching your form and verifying the access link.</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="portal-card portal-status-center">
          <div className="text-danger mb-4">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2>Access Denied</h2>
          <p style={{ marginTop: '24px' }}>{errorMessage}</p>
        </div>
      )}

      {/* Success */}
      {status === 'success' && (
        <div className="portal-card portal-status-center">
          <div className="text-success mb-4">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Submitted Successfully</h2>
          <p style={{ marginTop: '24px' }}>Your response has been securely recorded. You may now close this window.</p>
        </div>
      )}

      {/* Ready — render form */}
      {status === 'ready' && formData && (
        <div className="portal-card">
          <div className="portal-header">
            <p className="portal-header-title">Secure Form Submission</p>
            <p className="portal-header-subtitle">Authenticated via Encrypted Link &nbsp;&#183;&nbsp; {formData.taskId}</p>
          </div>

          {/* @ts-ignore */}
          <Form
            form={formData.schema}
            submission={{
              data: formData.prefill,
              metadata: {
                formUrl: '',
                applicationId: formData.taskId || ''
              }
            }}
            onSubmit={onFormSubmit}
            onCustomEvent={onCustomEvent}
          />
        </div>
      )}
    </div>


  );
}

export default ExternalLinkPage;
