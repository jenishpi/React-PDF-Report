import React from 'react';
import { Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { useDesigner } from 'context/DesignerContext';

function HeaderInspector() {
  const { template, updateSection, scalarPaths } = useDesigner();
  const header = template.sections.header || {};
  const fields = header.fields || [];

  const handleTitleChange = (e) => {
    updateSection('header', { title: e.target.value });
  };

  const handleSubtitleChange = (e) => {
    updateSection('header', { subtitle: e.target.value });
  };

  const handleAddField = () => {
    const newFields = [...fields, { label: 'New Field', key: '', value: 'Value' }];
    updateSection('header', { fields: newFields });
  };

  const handleUpdateField = (index, prop, value) => {
    const newFields = fields.map((f, i) => (i === index ? { ...f, [prop]: value } : f));
    updateSection('header', { fields: newFields });
  };

  const handleDeleteField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    updateSection('header', { fields: newFields });
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
        <h6 className="font-weight-bold mb-0 text-primary">
          <i className="fas fa-heading mr-2"></i> Header Section
        </h6>
      </div>

      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold">Report Title</Form.Label>
        <Form.Control
          type="text"
          size="sm"
          value={header.title || ''}
          onChange={handleTitleChange}
          placeholder="e.g. TAX INVOICE"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold">Subtitle</Form.Label>
        <Form.Control
          type="text"
          size="sm"
          value={header.subtitle || ''}
          onChange={handleSubtitleChange}
          placeholder="e.g. Original for Recipient"
        />
      </Form.Group>

      <hr className="my-3" />

      <div className="d-flex align-items-center justify-content-between mb-2">
        <Form.Label className="small font-weight-bold mb-0">Document Metadata Fields</Form.Label>
        <Button variant="outline-primary" size="sm" onClick={handleAddField} className="py-0 px-2" style={{ fontSize: '11px' }}>
          <i className="fas fa-plus mr-1"></i> Add Field
        </Button>
      </div>
      <p className="small text-muted mb-2" style={{ fontSize: '11px' }}>
        Key-value items shown on the top-right of the document header (e.g. Date, Invoice #).
      </p>

      {fields.map((field, idx) => (
        <div key={idx} className="p-2 mb-2 bg-light border rounded">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="small font-weight-bold text-muted">Field #{idx + 1}</span>
            <Button
              variant="link"
              size="sm"
              className="text-danger p-0"
              onClick={() => handleDeleteField(idx)}
              title="Delete field"
            >
              <i className="fas fa-trash-alt"></i>
            </Button>
          </div>

          <Form.Group className="mb-1">
            <Form.Control
              type="text"
              size="sm"
              placeholder="Field Label (e.g. Invoice No)"
              value={field.label}
              onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label className="text-muted mb-0" style={{ fontSize: '10px' }}>
              Data Binding Path
            </Form.Label>
            <Form.Control
              as="select"
              size="sm"
              value={field.key || ''}
              onChange={(e) => handleUpdateField(idx, 'key', e.target.value)}
            >
              <option value="">-- Direct Static Value --</option>
              {scalarPaths.map((p) => (
                <option key={p.path} value={p.path}>
                  {p.path} ({p.label})
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {(!field.key || field.key === '') && (
            <Form.Group className="mb-0">
              <Form.Control
                type="text"
                size="sm"
                placeholder="Static Value"
                value={field.value}
                onChange={(e) => handleUpdateField(idx, 'value', e.target.value)}
              />
            </Form.Group>
          )}
        </div>
      ))}
    </div>
  );
}

export default HeaderInspector;

