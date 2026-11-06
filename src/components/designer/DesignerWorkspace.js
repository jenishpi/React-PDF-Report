import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup, Badge, Alert } from 'react-bootstrap';
import { useDesigner } from 'context/DesignerContext';
import { validateTemplate } from 'schemas/reportTemplateSchema';
import { downloadPdf } from 'utils/pdfGenerator';
import SectionListSidebar from './SectionListSidebar';
import DesignerCanvas from './DesignerCanvas';
import PropertyInspector from './PropertyInspector';
import JsonPlaygroundModal from './JsonPlaygroundModal';

function DesignerWorkspace() {
  const { template, setTemplate, data, setData, isValidTemplate, templateErrors } = useDesigner();

  const [showPlayground, setShowPlayground] = useState(false);
  const [notification, setNotification] = useState(null);

  const importTemplateRef = useRef(null);
  const importDataRef = useRef(null);

  // Export current template as .json
  const handleExportTemplate = () => {
    try {
      const jsonStr = JSON.stringify(template, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `${(template.name || 'report_template').toLowerCase().replace(/\s+/g, '_')}_template.json`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setNotification({ type: 'success', message: `Exported template as ${filename}` });
    } catch (err) {
      setNotification({ type: 'danger', message: `Export failed: ${err.message}` });
    }
  };

  // Import template .json file
  const handleImportTemplateFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => {
      setNotification({ type: 'danger', message: 'Failed to read template file from disk.' });
    };
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const validation = validateTemplate(parsed);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join('; ')}`);
        }
        setTemplate(parsed);
        setNotification({ type: 'success', message: `Successfully loaded template "${parsed.name || file.name}"` });
      } catch (err) {
        setNotification({ type: 'danger', message: `Template import error: ${err.message}` });
      }
      // Reset input value so the same file can be selected again
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Upload custom data .json file
  const handleImportDataFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => {
      setNotification({ type: 'danger', message: 'Failed to read template file from disk.' });
    };
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Data file must contain a valid JSON object or array.');
        }
        setData(parsed);
        setNotification({ type: 'success', message: `Successfully loaded data from "${file.name}"` });
      } catch (err) {
        setNotification({ type: 'danger', message: `Data load error: ${err.message}` });
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleDownloadPdf = () => {
    try {
      const filename = `${(template.name || 'report').toLowerCase().replace(/\s+/g, '_')}.pdf`;
      downloadPdf(template, data, filename);
    } catch (err) {
      setNotification({ type: 'danger', message: `Download failed: ${err.message}` });
    }
  };

  return (
    <Container fluid className="py-2 px-3">
      {/* Hidden File Inputs for Import */}
      <input
        type="file"
        ref={importTemplateRef}
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleImportTemplateFile}
      />
      <input
        type="file"
        ref={importDataRef}
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleImportDataFile}
      />

      {/* Master Top Navigation Bar */}
      <Row className="mb-2">
        <Col md="12">
          <Card className="shadow-sm border-0">
            <Card.Body className="p-2 px-3 d-flex flex-wrap align-items-center justify-content-between">
              {/* Left: Template Name & Metadata */}
              <div className="d-flex align-items-center">
                <i className="nc-icon nc-paper-2 mr-2 text-primary" style={{ fontSize: '20px' }}></i>
                <div>
                  <h6 className="font-weight-bold mb-0 text-dark">
                    {template.name || 'Untitled Report'}
                  </h6>
                  <span className="text-muted" style={{ fontSize: '11px' }}>
                    Visual Report Designer & Generator • {template.page?.pageSize} {template.page?.pageOrientation}
                  </span>
                </div>
                <Badge
                  variant={isValidTemplate ? 'success' : 'warning'}
                  className="ml-3 font-weight-normal"
                  style={{ fontSize: '10px' }}
                >
                  {isValidTemplate ? 'Template Valid' : `${templateErrors.length} Warnings`}
                </Badge>
              </div>

              {/* Right: Action Buttons */}
              <div className="d-flex align-items-center mt-2 mt-md-0">
                <ButtonGroup size="sm" className="mr-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowPlayground(true)}
                    title="Open JSON Data & Template Playground"
                  >
                    <i className="fas fa-code mr-1"></i> JSON Playground
                  </Button>

                  <Button
                    variant="outline-secondary"
                    onClick={() => importTemplateRef.current?.click()}
                    title="Import template from .json file"
                  >
                    <i className="fas fa-file-import mr-1"></i> Import Template
                  </Button>

                  <Button
                    variant="outline-secondary"
                    onClick={handleExportTemplate}
                    title="Export template as .json file"
                  >
                    <i className="fas fa-file-export mr-1"></i> Export Template
                  </Button>

                  <Button
                    variant="outline-secondary"
                    onClick={() => importDataRef.current?.click()}
                    title="Upload external data .json file"
                  >
                    <i className="fas fa-upload mr-1"></i> Upload Data
                  </Button>
                </ButtonGroup>

                <Button
                  variant="success"
                  size="sm"
                  className="btn-fill"
                  onClick={handleDownloadPdf}
                >
                  <i className="fas fa-file-pdf mr-1"></i> Download PDF
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Global Notification Banner */}
      {notification && (
        <Row className="mb-2">
          <Col md="12">
            <Alert
              variant={notification.type}
              dismissible
              onClose={() => setNotification(null)}
              className="py-2 small mb-0"
            >
              {notification.type === 'danger' && <i className="fas fa-exclamation-circle mr-1"></i>}
              {notification.type === 'success' && <i className="fas fa-check-circle mr-1"></i>}
              {notification.message}
            </Alert>
          </Col>
        </Row>
      )}

      {/* 3-Pane Designer Workspace Layout */}
      <Row className="no-gutters">
        {/* Left Panel: Structure & Presets Sidebar (20% width on XL) */}
        <Col xl="2" lg="3" md="4" className="pr-lg-2 mb-3">
          <SectionListSidebar />
        </Col>

        {/* Center Panel: Interactive Document Canvas & Live PDF (50% width on XL) */}
        <Col xl="6" lg="5" md="8" className="px-lg-2 mb-3">
          <DesignerCanvas />
        </Col>

        {/* Right Panel: Context-Aware Property Inspector (30% width on XL) */}
        <Col xl="4" lg="4" md="12" className="pl-lg-2 mb-3">
          <PropertyInspector />
        </Col>
      </Row>

      {/* JSON Data & Template Playground Modal */}
      <JsonPlaygroundModal
        show={showPlayground}
        onHide={() => setShowPlayground(false)}
      />
    </Container>
  );
}

export default DesignerWorkspace;
