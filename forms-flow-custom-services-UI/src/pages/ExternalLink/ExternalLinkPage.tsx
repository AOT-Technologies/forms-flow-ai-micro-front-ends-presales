import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from '@formio/react';
import { Formio } from '@formio/js';
import { ApiClient as apiClient } from '../../utils/ApiClient';
import { API_ROUTES } from '../../constants/routes';

import { AppConfig } from '../../config/AppConfig';

const FORMIO_URL = AppConfig.formioUrl;

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
    <>
      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {status === 'loading' && (
        <div className="ff-status-page">
          <div className="ff-status-card ff-status-card--loading">
            {/* 3-dot bouncing spinner — mirrors SpinnerSVG from forms-flow-submissions */}
            <svg
              className="ff-spinner"
              version="1.1" id="L5" x="0px" y="0px"
              viewBox="0 0 100 100"
              fill="#868e96"
              style={{ width: 60, height: 60 }}
            >
              <circle stroke="none" cx="6" cy="50" r="6">
                <animateTransform attributeName="transform" dur="1s" type="translate"
                  values="0 15 ; 0 -15; 0 15" repeatCount="indefinite" begin="0.1" />
              </circle>
              <circle stroke="none" cx="30" cy="50" r="6">
                <animateTransform attributeName="transform" dur="1s" type="translate"
                  values="0 10 ; 0 -10; 0 10" repeatCount="indefinite" begin="0.2" />
              </circle>
              <circle stroke="none" cx="54" cy="50" r="6">
                <animateTransform attributeName="transform" dur="1s" type="translate"
                  values="0 5 ; 0 -5; 0 5" repeatCount="indefinite" begin="0.3" />
              </circle>
            </svg>
            <h1>Preparing Your Form</h1>
            <p>We're securely fetching your form and verifying the access link.</p>
          </div>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {status === 'error' && (
        <div className="ff-status-page">
          <div className="ff-status-card ff-status-card--error">
            <div className="ff-icon-circle ff-icon-circle--warning">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1>Access Denied</h1>
            <p>{errorMessage}</p>
            <div className="ff-footer-note">
              If you need immediate assistance, please contact the{' '}
              <span className="ff-support-link">support team</span>.
            </div>
          </div>
        </div>
      )}

      {/* ── Success ─────────────────────────────────────────────────────── */}
      {status === 'success' && (
        <div className="ff-status-page">
          <div className="ff-status-card ff-status-card--success">
            <div className="ff-icon-circle ff-icon-circle--success">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1>Submitted Successfully</h1>
            <p>Your response has been securely recorded. You may now close this window.</p>
          </div>
        </div>
      )}

      {/* ── Ready — render form ──────────────────────────────────────────── */}
      {status === 'ready' && formData && (
        <div className="portal-container">
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
        </div>
      )}
    </>
  );
}

export default ExternalLinkPage;
