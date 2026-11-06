import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Tab, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useDesigner } from 'context/DesignerContext';
import { validateTemplate } from 'schemas/reportTemplateSchema';

function JsonPlaygroundModal({ show, onHide }) {
  const { template, setTemplate, data, setData } = useDesigner();

  const [activeTab, setActiveTab] = useState('data');
  const [dataJsonText, setDataJsonText] = useState('');
  const [templateJsonText, setTemplateJsonText] = useState('');
  const [dataError, setDataError] = useState(null);
  const [templateError, setTemplateError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sync modal text when opened or when context state changes
  useEffect(() => {
    if (show) {
      setDataJsonText(JSON.stringify(data, null, 2));
      setTemplateJsonText(JSON.stringify(template, null, 2));
      setDataError(null);
      setTemplateError(null);
      setSuccessMsg(null);
    }
  }, [show, data, template]);

  const handleApplyData = () => {
    setDataError(null);
    setSuccessMsg(null);
    try {
      const parsed = JSON.parse(dataJsonText);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Data payload must be a valid JSON object or array.');
      }
      setData(parsed);
      setSuccessMsg('Data payload applied successfully! Data bindings and column fields have been updated.');
    } catch (err) {
      setDataError(`Invalid JSON: ${err.message}`);
    }
  };

  const handleApplyTemplate = () => {
    setTemplateError(null);
    setSuccessMsg(null);
    try {
      const parsed = JSON.parse(templateJsonText);
      const validation = validateTemplate(parsed);
      if (!validation.valid) {
        throw new Error(`Template validation failed: ${validation.errors.join('; ')}`);
      }
      setTemplate(parsed);
      setSuccessMsg('Report template structure updated successfully!');
    } catch (err) {
      setTemplateError(`Invalid Template: ${err.message}`);
    }
  };

  const handleFormatData = () => {
    try {
      const parsed = JSON.parse(dataJsonText);
      setDataJsonText(JSON.stringify(parsed, null, 2));
      setDataError(null);
    } catch (err) {
      setDataError(`Formatting error: ${err.message}`);
    }
  };

  const handleFormatTemplate = () => {
    try {
      const parsed = JSON.parse(templateJsonText);
      setTemplateJsonText(JSON.stringify(parsed, null, 2));
      setTemplateError(null);
    } catch (err) {
      setTemplateError(`Formatting error: ${err.message}`);
    }
  };

  const handleCopy = (text) => {
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        setSuccessMsg('Copied to clipboard!');
      } else {
        setSuccessMsg('Please select text and use Ctrl+C / Cmd+C to copy.');
      }
    } catch {
      setSuccessMsg('Please select text and use Ctrl+C / Cmd+C to copy.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title as="h5" className="mb-0 font-weight-bold">
          <i className="fas fa-code mr-2 text-primary"></i>
          JSON Data & Template Playground
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3">
        {successMsg && (
          <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)} className="py-2 small">
            <i className="fas fa-check-circle mr-1"></i> {successMsg}
          </Alert>
        )}

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          {/* Tab 1: Sample Data Payload */}
          <Tab eventKey="data" title={<span><i className="fas fa-database mr-1"></i> Data Payload JSON</span>}>
            {dataError && (
              <Alert variant="danger" className="py-2 small">
                <i className="fas fa-exclamation-triangle mr-1"></i> {dataError}
              </Alert>
            )}

            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">
                Paste your own JSON payload to test binding fields and tables live.
              </span>
              <div>
                <Button variant="outline-secondary" size="sm" onClick={handleFormatData} className="mr-1 py-1 px-2" style={{ fontSize: '11px' }}>
                  <i className="fas fa-align-left mr-1"></i> Format
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => handleCopy(dataJsonText)} className="py-1 px-2" style={{ fontSize: '11px' }}>
                  <i className="fas fa-copy mr-1"></i> Copy
                </Button>
              </div>
            </div>

            <Form.Control
              as="textarea"
              rows={14}
              value={dataJsonText}
              onChange={(e) => setDataJsonText(e.target.value)}
              className="font-monospace small bg-light"
              style={{ fontSize: '12px', lineHeight: '1.4' }}
              spellCheck={false}
            />

            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="small text-muted">
                {Array.isArray(data) ? `Root Array (${data.length} items)` : `Object with ${Object.keys(data || {}).length} keys`}
              </span>
              <Button variant="primary" size="sm" onClick={handleApplyData}>
                <i className="fas fa-check mr-1"></i> Apply Data to Designer
              </Button>
            </div>
          </Tab>

          {/* Tab 2: Template Structure Definition */}
          <Tab eventKey="template" title={<span><i className="fas fa-file-invoice mr-1"></i> Template Definition JSON</span>}>
            {templateError && (
              <Alert variant="danger" className="py-2 small">
                <i className="fas fa-exclamation-triangle mr-1"></i> {templateError}
              </Alert>
            )}

            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">
                The complete visual template JSON. Developers can copy this into their backend systems.
              </span>
              <div>
                <Button variant="outline-secondary" size="sm" onClick={handleFormatTemplate} className="mr-1 py-1 px-2" style={{ fontSize: '11px' }}>
                  <i className="fas fa-align-left mr-1"></i> Format
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => handleCopy(templateJsonText)} className="py-1 px-2" style={{ fontSize: '11px' }}>
                  <i className="fas fa-copy mr-1"></i> Copy
                </Button>
              </div>
            </div>

            <Form.Control
              as="textarea"
              rows={14}
              value={templateJsonText}
              onChange={(e) => setTemplateJsonText(e.target.value)}
              className="font-monospace small bg-light"
              style={{ fontSize: '12px', lineHeight: '1.4' }}
              spellCheck={false}
            />

            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="small text-muted">
                Version: {template.version || '1.0'} | Sections: {Object.keys(template.sections || {}).length}
              </span>
              <Button variant="primary" size="sm" onClick={handleApplyTemplate}>
                <i className="fas fa-check mr-1"></i> Update Template from JSON
              </Button>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer className="bg-light p-2">
        <Button variant="secondary" size="sm" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default JsonPlaygroundModal;

