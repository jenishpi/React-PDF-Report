import React from 'react';
import { Form, Button, ButtonGroup, Badge, Row, Col, Alert } from 'react-bootstrap';
import { useDesigner } from 'context/DesignerContext';
import { COLUMN_FORMATS, COLUMN_ALIGNS, TABLE_BORDER_STYLES } from 'schemas/reportTemplateSchema';
import { generateSuggestedColumns } from 'utils/dataIntrospector';

function TableColumnBuilder() {
  const {
    template,
    updateSection,
    selectedColumnId,
    selectColumn,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    arraySources,
  } = useDesigner();

  const table = template.sections.table || {};
  const columns = table.columns || [];
  const style = table.style || {};

  // Find currently active array source
  const currentSource = arraySources.find((s) => s.key === (table.dataKey || '')) || arraySources[0];
  const availableFields = currentSource ? currentSource.fields : [];

  const handleDataKeyChange = (newKey) => {
    updateSection('table', { dataKey: newKey });
  };

  const handleAutoGenerateColumns = () => {
    if (!availableFields || availableFields.length === 0) {
      alert('No field properties detected in the selected data array.');
      return;
    }
    const suggested = generateSuggestedColumns(availableFields);
    updateSection('table', { columns: suggested });
  };

  const handleAutoDistributeWidths = () => {
    // Distribute widths: first column (often ID/#) small, description flex (*), amounts fixed
    const balanced = columns.map((col, idx) => {
      if (idx === 0 && col.header === '#') return { ...col, width: 30 };
      if (col.format === 'currency') return { ...col, width: 80 };
      if (col.format === 'number') return { ...col, width: 55 };
      if (col.format === 'date') return { ...col, width: 80 };
      return { ...col, width: '*' };
    });
    updateSection('table', { columns: balanced });
  };

  const handleMoveColumn = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= columns.length) return;
    reorderColumns(index, targetIndex);
  };

  const handleStyleChange = (prop, value) => {
    updateSection('table', {
      style: {
        ...style,
        [prop]: value,
      },
    });
  };

  const selectedCol = columns.find((c) => c.id === selectedColumnId) || columns[0];
  const selectedIndex = columns.findIndex((c) => c.id === (selectedCol ? selectedCol.id : ''));

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
        <h6 className="font-weight-bold mb-0 text-primary">
          <i className="fas fa-table mr-2"></i> Table Section & Columns
        </h6>
      </div>

      {/* Array Source Selector */}
      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold">Data Array Source</Form.Label>
        <Form.Control
          as="select"
          size="sm"
          value={table.dataKey || ''}
          onChange={(e) => handleDataKeyChange(e.target.value)}
        >
          {arraySources.map((source) => (
            <option key={source.key} value={source.key}>
              {source.label || 'Root Dataset'} ({source.count} records)
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      {/* Auto-detect Columns Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          variant="outline-info"
          size="sm"
          className="btn-fill py-1"
          style={{ fontSize: '11px' }}
          onClick={handleAutoGenerateColumns}
          title="Auto-detect column schema from data"
        >
          <i className="fas fa-magic mr-1"></i> Auto-Detect Columns
        </Button>

        <Button
          variant="outline-secondary"
          size="sm"
          className="py-1"
          style={{ fontSize: '11px' }}
          onClick={handleAutoDistributeWidths}
          title="Auto-balance column widths"
        >
          <i className="fas fa-columns mr-1"></i> Auto-Balance Widths
        </Button>
      </div>

      {/* Columns List / Reordering */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <Form.Label className="small font-weight-bold mb-0">
          Columns ({columns.length})
        </Form.Label>
        <Button
          variant="primary"
          size="sm"
          className="py-0 px-2"
          style={{ fontSize: '11px' }}
          onClick={() => addColumn({ header: 'New Col', fieldKey: '', width: '*' })}
        >
          <i className="fas fa-plus mr-1"></i> Add Column
        </Button>
      </div>

      <div className="mb-3 border rounded p-1 bg-white" style={{ maxHeight: '180px', overflowY: 'auto' }}>
        {columns.map((col, idx) => {
          const isSelected = selectedCol && selectedCol.id === col.id;
          return (
            <div
              key={col.id}
              className={`d-flex align-items-center justify-content-between p-1 px-2 mb-1 rounded ${
                isSelected ? 'bg-primary text-white' : 'bg-light text-dark'
              }`}
              style={{ cursor: 'pointer', fontSize: '12px' }}
              onClick={() => selectColumn(col.id)}
            >
              <div className="d-flex align-items-center text-truncate mr-2">
                <span className="font-weight-bold mr-2">{idx + 1}.</span>
                <span className="text-truncate font-weight-bold">{col.header || 'Untitled'}</span>
                <Badge
                  variant={isSelected ? 'light' : 'secondary'}
                  className="ml-2 font-weight-normal"
                  style={{ fontSize: '10px' }}
                >
                  {col.format}
                </Badge>
              </div>

              <div className="d-flex align-items-center">
                <button
                  type="button"
                  className={`btn btn-link p-0 mr-1 ${isSelected ? 'text-white' : 'text-muted'}`}
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveColumn(idx, -1);
                  }}
                  title="Move Up"
                >
                  <i className="fas fa-chevron-up"></i>
                </button>
                <button
                  type="button"
                  className={`btn btn-link p-0 mr-2 ${isSelected ? 'text-white' : 'text-muted'}`}
                  disabled={idx === columns.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveColumn(idx, 1);
                  }}
                  title="Move Down"
                >
                  <i className="fas fa-chevron-down"></i>
                </button>
                <button
                  type="button"
                  className={`btn btn-link p-0 ${isSelected ? 'text-white' : 'text-danger'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteColumn(col.id);
                  }}
                  title="Delete Column"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Column Editor */}
      {selectedCol && (
        <div className="p-3 mb-3 border rounded bg-light">
          <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
            <span className="small font-weight-bold text-primary">
              Editing Column #{selectedIndex + 1}: {selectedCol.header}
            </span>
          </div>

          <Form.Group className="mb-2">
            <Form.Label className="text-muted mb-0" style={{ fontSize: '11px' }}>
              Header Title
            </Form.Label>
            <Form.Control
              type="text"
              size="sm"
              value={selectedCol.header}
              onChange={(e) => updateColumn(selectedCol.id, { header: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="text-muted mb-0" style={{ fontSize: '11px' }}>
              Data Field Key
            </Form.Label>
            <Form.Control
              as="select"
              size="sm"
              value={selectedCol.fieldKey || ''}
              onChange={(e) => updateColumn(selectedCol.id, { fieldKey: e.target.value })}
            >
              <option value="">-- Choose Field Key --</option>
              {availableFields.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.key} ({f.label} - {f.type})
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Row className="no-gutters mb-2">
            <Col xs="6" className="pr-1">
              <Form.Label className="text-muted mb-0" style={{ fontSize: '11px' }}>
                Width (*, auto, or pt)
              </Form.Label>
              <Form.Control
                type="text"
                size="sm"
                value={selectedCol.width}
                onChange={(e) => updateColumn(selectedCol.id, { width: e.target.value })}
                placeholder="*, auto, 80"
              />
            </Col>
            <Col xs="6" className="pl-1">
              <Form.Label className="text-muted mb-0" style={{ fontSize: '11px' }}>
                Format
              </Form.Label>
              <Form.Control
                as="select"
                size="sm"
                value={selectedCol.format || 'text'}
                onChange={(e) => updateColumn(selectedCol.id, { format: e.target.value })}
              >
                {COLUMN_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </Form.Control>
            </Col>
          </Row>

          <Form.Group className="mb-0">
            <Form.Label className="text-muted mb-0 d-block" style={{ fontSize: '11px' }}>
              Text Alignment
            </Form.Label>
            <ButtonGroup className="w-100">
              {COLUMN_ALIGNS.map((align) => (
                <Button
                  key={align}
                  size="sm"
                  variant={selectedCol.align === align ? 'primary' : 'outline-secondary'}
                  onClick={() => updateColumn(selectedCol.id, { align })}
                  className="py-1"
                >
                  <i className={`fas fa-align-${align}`}></i>
                </Button>
              ))}
            </ButtonGroup>
          </Form.Group>
        </div>
      )}

      {/* Table Style Configuration */}
      <div className="border-top pt-3 mt-3">
        <h6 className="font-weight-bold text-muted small text-uppercase mb-2">Table Appearance</h6>

        <Form.Group className="mb-2">
          <Form.Label className="text-muted mb-0" style={{ fontSize: '11px' }}>
            Border Layout Style
          </Form.Label>
          <Form.Control
            as="select"
            size="sm"
            value={style.borderStyle || 'lightHorizontalLines'}
            onChange={(e) => handleStyleChange('borderStyle', e.target.value)}
          >
            {TABLE_BORDER_STYLES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Check
            type="checkbox"
            id="stripedRowsToggle"
            label="Striped Alternating Rows"
            checked={!!style.striped}
            onChange={(e) => handleStyleChange('striped', e.target.checked)}
            className="small"
          />
        </Form.Group>

        <Row className="no-gutters mb-2">
          <Col xs="6" className="pr-1">
            <Form.Label className="text-muted mb-0" style={{ fontSize: '11px' }}>
              Header Background
            </Form.Label>
            <input
              type="color"
              value={style.headerBg || template.page?.accentColor || '#1d4ed8'}
              onChange={(e) => handleStyleChange('headerBg', e.target.value)}
              className="form-control form-control-sm p-0 w-100"
              style={{ height: '30px' }}
            />
          </Col>
          <Col xs="6" className="pl-1">
            <Form.Label className="text-muted mb-0" style={{ fontSize: '11px' }}>
              Header Text Color
            </Form.Label>
            <input
              type="color"
              value={style.headerColor || '#ffffff'}
              onChange={(e) => handleStyleChange('headerColor', e.target.value)}
              className="form-control form-control-sm p-0 w-100"
              style={{ height: '30px' }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default TableColumnBuilder;

