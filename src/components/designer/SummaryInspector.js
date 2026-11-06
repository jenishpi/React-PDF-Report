import React from 'react';
import { Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { useDesigner } from 'context/DesignerContext';
import { AGGREGATE_TYPES, COLUMN_FORMATS } from 'schemas/reportTemplateSchema';

function SummaryInspector() {
  const {
    template,
    updateSection,
    selectedRowId,
    selectSummaryRow,
    addSummaryRow,
    updateSummaryRow,
    deleteSummaryRow,
    scalarPaths,
  } = useDesigner();

  const summary = template.sections.summary || {};
  const rows = summary.rows || [];
  const tableColumns = template.sections.table?.columns || [];

  const handleAlignmentChange = (alignment) => {
    updateSection('summary', { alignment });
  };

  const handleWidthChange = (width) => {
    updateSection('summary', { width });
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
        <h6 className="font-weight-bold mb-0 text-primary">
          <i className="fas fa-calculator mr-2"></i> Summary & Totals
        </h6>
      </div>

      <Row className="no-gutters mb-3">
        <Col xs="6" className="pr-1">
          <Form.Label className="small font-weight-bold mb-1">Alignment</Form.Label>
          <Form.Control
            as="select"
            size="sm"
            value={summary.alignment || 'right'}
            onChange={(e) => handleAlignmentChange(e.target.value)}
          >
            <option value="right">Right Aligned</option>
            <option value="left">Left Aligned</option>
          </Form.Control>
        </Col>
        <Col xs="6" className="pl-1">
          <Form.Label className="small font-weight-bold mb-1">Block Width</Form.Label>
          <Form.Control
            type="text"
            size="sm"
            value={summary.width || '45%'}
            onChange={(e) => handleWidthChange(e.target.value)}
            placeholder="e.g. 45%, 200"
          />
        </Col>
      </Row>

      <div className="d-flex align-items-center justify-content-between mb-2">
        <Form.Label className="small font-weight-bold mb-0">Total Rows ({rows.length})</Form.Label>
        <Button
          variant="outline-primary"
          size="sm"
          className="py-0 px-2"
          style={{ fontSize: '11px' }}
          onClick={() =>
            addSummaryRow({
              label: 'New Calculation',
              type: 'aggregate',
              aggregate: 'SUM',
              targetColumn: tableColumns[0]?.fieldKey || '',
              format: 'currency',
            })
          }
        >
          <i className="fas fa-plus mr-1"></i> Add Row
        </Button>
      </div>

      {rows.map((row, idx) => (
        <div key={row.id} className="p-2 mb-2 bg-light border rounded">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="small font-weight-bold text-dark">
              #{idx + 1}: {row.label || 'Untitled'}
            </span>
            <Button
              variant="link"
              size="sm"
              className="text-danger p-0"
              onClick={() => deleteSummaryRow(row.id)}
              title="Delete row"
            >
              <i className="fas fa-trash-alt"></i>
            </Button>
          </div>

          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              size="sm"
              placeholder="Label (e.g. Subtotal, Grand Total)"
              value={row.label}
              onChange={(e) => updateSummaryRow(row.id, { label: e.target.value })}
            />
          </Form.Group>

          <Row className="no-gutters mb-2">
            <Col xs="6" className="pr-1">
              <Form.Label className="text-muted mb-0" style={{ fontSize: '10px' }}>
                Calculation Source
              </Form.Label>
              <Form.Control
                as="select"
                size="sm"
                value={row.type || 'aggregate'}
                onChange={(e) => updateSummaryRow(row.id, { type: e.target.value })}
              >
                <option value="aggregate">Aggregate Column</option>
                <option value="binding">Bind JSON Field</option>
                <option value="static">Static Value</option>
              </Form.Control>
            </Col>
            <Col xs="6" className="pl-1">
              <Form.Label className="text-muted mb-0" style={{ fontSize: '10px' }}>
                Format
              </Form.Label>
              <Form.Control
                as="select"
                size="sm"
                value={row.format || 'currency'}
                onChange={(e) => updateSummaryRow(row.id, { format: e.target.value })}
              >
                {COLUMN_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </Form.Control>
            </Col>
          </Row>

          {/* Conditional Controls based on Type */}
          {row.type === 'aggregate' && (
            <Row className="no-gutters mb-2">
              <Col xs="5" className="pr-1">
                <Form.Label className="text-muted mb-0" style={{ fontSize: '10px' }}>
                  Function
                </Form.Label>
                <Form.Control
                  as="select"
                  size="sm"
                  value={row.aggregate || 'SUM'}
                  onChange={(e) => updateSummaryRow(row.id, { aggregate: e.target.value })}
                >
                  {AGGREGATE_TYPES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </Form.Control>
              </Col>
              <Col xs="7" className="pl-1">
                <Form.Label className="text-muted mb-0" style={{ fontSize: '10px' }}>
                  Target Column
                </Form.Label>
                <Form.Control
                  as="select"
                  size="sm"
                  value={row.targetColumn || ''}
                  onChange={(e) => updateSummaryRow(row.id, { targetColumn: e.target.value })}
                >
                  <option value="">-- Choose Column --</option>
                  {tableColumns.map((col) => (
                    <option key={col.id} value={col.fieldKey}>
                      {col.header} ({col.fieldKey})
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Row>
          )}

          {row.type === 'binding' && (
            <Form.Group className="mb-2">
              <Form.Label className="text-muted mb-0" style={{ fontSize: '10px' }}>
                Data Binding Field
              </Form.Label>
              <Form.Control
                as="select"
                size="sm"
                value={row.dataKey || ''}
                onChange={(e) => updateSummaryRow(row.id, { dataKey: e.target.value })}
              >
                <option value="">-- Choose Field --</option>
                {scalarPaths.map((p) => (
                  <option key={p.path} value={p.path}>
                    {p.path} ({p.label})
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          )}

          <Form.Check
            type="checkbox"
            id={`bold-${row.id}`}
            label="Bold Text (Emphasize)"
            checked={!!row.isBold}
            onChange={(e) => updateSummaryRow(row.id, { isBold: e.target.checked })}
            className="small"
          />
        </div>
      ))}
    </div>
  );
}

export default SummaryInspector;

