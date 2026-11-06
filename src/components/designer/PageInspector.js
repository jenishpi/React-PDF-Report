import React from 'react';
import { Card, Form, Row, Col, ButtonGroup, Button } from 'react-bootstrap';
import { useDesigner } from 'context/DesignerContext';
import { PAGE_SIZES, PAGE_ORIENTATIONS } from 'schemas/reportTemplateSchema';

const QUICK_COLORS = [
  { name: 'Blue', hex: '#1d4ed8' },
  { name: 'Teal', hex: '#0f766e' },
  { name: 'Slate', hex: '#1e293b' },
  { name: 'Indigo', hex: '#4338ca' },
  { name: 'Emerald', hex: '#047857' },
  { name: 'Crimson', hex: '#b91c1c' },
];

function PageInspector() {
  const { template, updatePageConfig } = useDesigner();
  const page = template.page || {};

  const handleSizeChange = (e) => {
    updatePageConfig({ pageSize: e.target.value });
  };

  const handleOrientationChange = (orientation) => {
    updatePageConfig({ pageOrientation: orientation });
  };

  const handleColorChange = (hex) => {
    updatePageConfig({ accentColor: hex });
  };

  const handleFontSizeChange = (e) => {
    updatePageConfig({ baseFontSize: parseFloat(e.target.value) || 8.5 });
  };

  const handleMarginChange = (index, value) => {
    const margins = [...(page.pageMargins || [36, 40, 36, 40])];
    margins[index] = parseInt(value, 10) || 0;
    updatePageConfig({ pageMargins: margins });
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
        <h6 className="font-weight-bold mb-0 text-primary">
          <i className="fas fa-sliders-h mr-2"></i> Page Configuration
        </h6>
      </div>

      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold">Paper Size</Form.Label>
        <Form.Control
          as="select"
          size="sm"
          value={page.pageSize || 'A4'}
          onChange={handleSizeChange}
        >
          {PAGE_SIZES.map((sz) => (
            <option key={sz} value={sz}>
              {sz}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold d-block">Orientation</Form.Label>
        <ButtonGroup className="w-100">
          {PAGE_ORIENTATIONS.map((ori) => (
            <Button
              key={ori}
              size="sm"
              variant={page.pageOrientation === ori ? 'primary' : 'outline-secondary'}
              onClick={() => handleOrientationChange(ori)}
              className="text-capitalize"
            >
              <i className={`fas fa-${ori === 'portrait' ? 'file-alt' : 'file'} mr-1`}></i>
              {ori}
            </Button>
          ))}
        </ButtonGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold d-block">Brand Accent Color</Form.Label>
        <div className="d-flex align-items-center mb-2">
          <input
            type="color"
            value={page.accentColor || '#1d4ed8'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="form-control form-control-sm p-0 mr-2"
            style={{ width: '40px', height: '32px', cursor: 'pointer' }}
          />
          <span className="small text-muted font-monospace">{page.accentColor || '#1d4ed8'}</span>
        </div>
        <div className="d-flex">
          {QUICK_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              className="btn btn-sm p-0 rounded-circle mr-1 border"
              style={{
                backgroundColor: c.hex,
                width: '24px',
                height: '24px',
                outline: page.accentColor === c.hex ? '2px solid black' : 'none',
              }}
              title={c.name}
              onClick={() => handleColorChange(c.hex)}
            />
          ))}
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold">
          Base Font Size ({page.baseFontSize || 8.5} pt)
        </Form.Label>
        <Form.Control
          type="range"
          min="7"
          max="12"
          step="0.5"
          value={page.baseFontSize || 8.5}
          onChange={handleFontSizeChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold">Margins (pt) [L, T, R, B]</Form.Label>
        <Row className="no-gutters">
          {['Left', 'Top', 'Right', 'Bottom'].map((side, idx) => (
            <Col xs="3" key={side} className="px-1">
              <Form.Label className="text-muted" style={{ fontSize: '10px' }}>
                {side}
              </Form.Label>
              <Form.Control
                type="number"
                size="sm"
                value={page.pageMargins ? page.pageMargins[idx] : 36}
                onChange={(e) => handleMarginChange(idx, e.target.value)}
              />
            </Col>
          ))}
        </Row>
      </Form.Group>
    </div>
  );
}

export default PageInspector;

