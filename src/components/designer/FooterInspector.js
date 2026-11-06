import React from 'react';
import { Form } from 'react-bootstrap';
import { useDesigner } from 'context/DesignerContext';

function FooterInspector() {
  const { template, updateSection } = useDesigner();
  const footer = template.sections.footer || {};

  const handleNotesChange = (e) => {
    updateSection('footer', { notes: e.target.value });
  };

  const handleTermsChange = (e) => {
    updateSection('footer', { terms: e.target.value });
  };

  const handlePageNumbersChange = (e) => {
    updateSection('footer', { showPageNumbers: e.target.checked });
  };

  const handleCustomTextChange = (e) => {
    updateSection('footer', { customText: e.target.value });
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
        <h6 className="font-weight-bold mb-0 text-primary">
          <i className="fas fa-shoe-prints mr-2"></i> Footer Section
        </h6>
      </div>

      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold">Notes / Payment Instructions</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          size="sm"
          value={footer.notes || ''}
          onChange={handleNotesChange}
          placeholder="e.g. Please remit payment to..."
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold">Terms & Conditions</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          size="sm"
          value={footer.terms || ''}
          onChange={handleTermsChange}
          placeholder="e.g. Payment due within 30 days..."
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold">Custom Footer Branding</Form.Label>
        <Form.Control
          type="text"
          size="sm"
          value={footer.customText || ''}
          onChange={handleCustomTextChange}
          placeholder="e.g. Company Name — Confidential"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          id="showPageNumbersCheck"
          label="Display Dynamic Page Numbers (e.g. Page 1 of 2)"
          checked={!!footer.showPageNumbers}
          onChange={handlePageNumbersChange}
          className="small font-weight-bold"
        />
      </Form.Group>
    </div>
  );
}

export default FooterInspector;

