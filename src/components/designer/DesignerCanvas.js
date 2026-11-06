import React from 'react';
import { Card, Button, ButtonGroup, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useDesigner } from 'context/DesignerContext';
import { downloadPdf, formatValue, computeAggregate, getNestedValue } from 'utils/pdfGenerator';

function DesignerCanvas() {
  const {
    template,
    data,
    viewMode,
    setViewMode,
    previewUrl,
    isGeneratingPreview,
    previewError,
    selectedSectionId,
    selectSection,
    selectedColumnId,
    selectColumn,
    canUndo,
    canRedo,
    undo,
    redo,
    resetToDefault,
  } = useDesigner();

  const page = template.page || {};
  const sections = template.sections || {};
  const accentColor = page.accentColor || '#1d4ed8';

  const handleDownload = () => {
    try {
      const filename = `${(template.name || 'report').toLowerCase().replace(/\s+/g, '_')}.pdf`;
      downloadPdf(template, data, filename);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  // Global keyboard shortcuts for Undo / Redo
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Extract table rows from payload for canvas preview
  let tableRows = [];
  if (sections.table && sections.table.enabled) {
    const dataKey = sections.table.dataKey;
    if (dataKey) {
      tableRows = getNestedValue(data, dataKey, []);
    } else if (Array.isArray(data)) {
      tableRows = data;
    }
    if (!Array.isArray(tableRows)) tableRows = [];
  }

  // Render the interactive HTML canvas
  const renderInteractiveCanvas = () => (
    <div
      className="p-4 bg-white shadow mx-auto border"
      style={{
        maxWidth: page.pageOrientation === 'landscape' ? '820px' : '650px',
        minHeight: '750px',
        fontSize: `${page.baseFontSize || 8.5}pt`,
        color: '#1e293b',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 1. Header Section */}
      {sections.header && sections.header.enabled ? (
        <div
          className={`p-3 mb-3 rounded ${selectedSectionId === 'header' ? 'bg-light' : 'bg-white'}`}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: selectedSectionId === 'header' ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
          }}
          onClick={() => selectSection('header')}
          title="Click to edit Header"
        >
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h4 className="mb-0 font-weight-bold" style={{ color: accentColor }}>
                {sections.header.title || 'REPORT'}
              </h4>
              <p className="text-muted small mb-0">{sections.header.subtitle}</p>
            </div>

            {sections.header.fields && (
              <div className="text-right">
                <table className="small ml-auto" style={{ fontSize: '11px' }}>
                  <tbody>
                    {sections.header.fields.map((f, i) => {
                      const val = f.key ? getNestedValue(data, f.key, f.value) : f.value;
                      return (
                        <tr key={i}>
                          <td className="text-muted font-weight-bold pr-2">{f.label}:</td>
                          <td className="font-weight-bold text-dark">{String(val || '-')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-2 mb-2 text-muted border border-dashed rounded small">
          Header disabled
        </div>
      )}

      {/* 2. Metadata Grid Section */}
      {sections.metadata && sections.metadata.enabled ? (
        <div
          className={`p-3 mb-3 rounded ${selectedSectionId === 'metadata' ? 'bg-light' : 'bg-white'}`}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: selectedSectionId === 'metadata' ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
          }}
          onClick={() => selectSection('metadata')}
          title="Click to edit Metadata Grid"
        >
          <Row>
            {(sections.metadata.blocks || []).map((block, bIdx) => (
              <Col key={bIdx} md={12 / (sections.metadata.columnsCount || 2)}>
                <div className="border-bottom pb-1 mb-1 font-weight-bold small" style={{ color: accentColor }}>
                  {block.title ? block.title.toUpperCase() : 'INFO'}
                </div>
                {(block.fields || []).map((f, fIdx) => {
                  const val = f.key ? getNestedValue(data, f.key, f.value) : f.value;
                  return (
                    <div key={fIdx} className="d-flex small text-truncate mb-1" style={{ fontSize: '11px' }}>
                      <span className="text-muted font-weight-bold mr-1">{f.label}:</span>
                      <span className="text-dark">{String(val || '-')}</span>
                    </div>
                  );
                })}
              </Col>
            ))}
          </Row>
        </div>
      ) : null}

      {/* 3. Table Section */}
      {sections.table && sections.table.enabled ? (
        <div
          className={`p-3 mb-3 rounded ${selectedSectionId === 'table' ? 'bg-light' : 'bg-white'}`}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: selectedSectionId === 'table' ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
          }}
          onClick={() => selectSection('table')}
          title="Click to edit Table Section"
        >
          {sections.table.title && (
            <h6 className="font-weight-bold mb-2 text-dark">{sections.table.title}</h6>
          )}

          <div className="table-responsive">
            <table
              className={`table table-sm mb-0 ${
                sections.table.style?.striped ? 'table-striped' : ''
              }`}
              style={{ fontSize: `${sections.table.style?.fontSize || 8.5}pt` }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: sections.table.style?.headerBg || accentColor,
                    color: sections.table.style?.headerColor || '#ffffff',
                  }}
                >
                  {(sections.table.columns || []).map((col) => {
                    const isColSelected = selectedColumnId === col.id;
                    return (
                      <th
                        key={col.id}
                        className={`p-2 text-${col.align || 'left'} ${
                          isColSelected ? 'border border-warning' : ''
                        }`}
                        style={{
                          width: col.width === '*' ? 'auto' : col.width,
                          cursor: 'pointer',
                          boxShadow: isColSelected ? 'inset 0 0 0 2px #f59e0b' : 'none',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectColumn(col.id);
                        }}
                        title={`Click to edit column: ${col.header}`}
                      >
                        {col.header}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(0, 8).map((rowItem, rIdx) => (
                  <tr key={rIdx}>
                    {(sections.table.columns || []).map((col) => {
                      const raw = getNestedValue(rowItem, col.fieldKey, '');
                      return (
                        <td key={col.id} className={`p-2 text-${col.align || 'left'}`}>
                          {formatValue(raw, col.format)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tableRows.length > 8 && (
            <div className="text-center text-muted small p-1 font-italic" style={{ fontSize: '10px' }}>
              + {tableRows.length - 8} more rows (rendering preview subset)
            </div>
          )}
        </div>
      ) : null}

      {/* 4. Summary & Totals Section */}
      {sections.summary && sections.summary.enabled ? (
        <div
          className={`p-3 mb-3 rounded ${selectedSectionId === 'summary' ? 'bg-light' : 'bg-white'}`}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: selectedSectionId === 'summary' ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
          }}
          onClick={() => selectSection('summary')}
          title="Click to edit Summary / Totals"
        >
          <div
            className={`d-flex flex-column ${
              sections.summary.alignment === 'right' ? 'align-items-end' : 'align-items-start'
            }`}
          >
            <table
              className="table table-sm mb-0"
              style={{ width: sections.summary.width || '45%', fontSize: '11px' }}
            >
              <tbody>
                {(sections.summary.rows || []).map((row) => {
                  let val = 0;
                  if (row.type === 'aggregate') {
                    val = computeAggregate(tableRows, row.targetColumn, row.aggregate);
                  } else if (row.type === 'binding' && row.dataKey) {
                    val = getNestedValue(data, row.dataKey, row.value || 0);
                  } else {
                    val = row.value || 0;
                  }

                  return (
                    <tr key={row.id}>
                      <td className={`border-top text-left ${row.isBold ? 'font-weight-bold' : ''}`}>
                        {row.label}
                      </td>
                      <td className={`border-top text-right ${row.isBold ? 'font-weight-bold' : ''}`}>
                        {formatValue(val, row.format || 'currency')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* 5. Footer Section */}
      {sections.footer && sections.footer.enabled ? (
        <div
          className={`p-3 rounded ${selectedSectionId === 'footer' ? 'bg-light' : 'bg-white'}`}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: selectedSectionId === 'footer' ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
            fontSize: '10px',
            color: '#64748b',
          }}
          onClick={() => selectSection('footer')}
          title="Click to edit Footer"
        >
          {sections.footer.notes && (
            <p className="mb-1">
              <strong>Notes:</strong> {sections.footer.notes}
            </p>
          )}
          {sections.footer.terms && (
            <p className="mb-1 font-italic">{sections.footer.terms}</p>
          )}
          <div className="d-flex justify-content-between text-muted pt-2 border-top">
            <span>{sections.footer.customText || ''}</span>
            {sections.footer.showPageNumbers && <span>Page 1 of 1</span>}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <Card className="shadow-sm h-100 border-0">
      {/* Top Controls Toolbar */}
      <Card.Header className="bg-light p-2 border-bottom d-flex flex-wrap justify-content-between align-items-center">
        {/* View Mode Switcher */}
        <ButtonGroup size="sm">
          <Button
            variant={viewMode === 'design' ? 'primary' : 'outline-secondary'}
            onClick={() => setViewMode('design')}
          >
            <i className="fas fa-pencil-ruler mr-1"></i> Interactive Canvas
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'primary' : 'outline-secondary'}
            onClick={() => setViewMode('preview')}
          >
            <i className="fas fa-file-pdf mr-1"></i> Live PDF
          </Button>
          <Button
            variant={viewMode === 'split' ? 'primary' : 'outline-secondary'}
            onClick={() => setViewMode('split')}
          >
            <i className="fas fa-columns mr-1"></i> Split View
          </Button>
        </ButtonGroup>

        {/* Action Controls */}
        <div className="d-flex align-items-center mt-1 mt-md-0">
          <ButtonGroup size="sm" className="mr-2">
            <Button
              variant="outline-secondary"
              disabled={!canUndo}
              onClick={undo}
              title="Undo template edit (Ctrl+Z)"
            >
              <i className="fas fa-undo"></i>
            </Button>
            <Button
              variant="outline-secondary"
              disabled={!canRedo}
              onClick={redo}
              title="Redo template edit (Ctrl+Y)"
            >
              <i className="fas fa-redo"></i>
            </Button>
            <Button
              variant="outline-danger"
              onClick={resetToDefault}
              title="Reset template to default"
            >
              <i className="fas fa-history"></i>
            </Button>
          </ButtonGroup>

          <Button
            variant="success"
            size="sm"
            className="btn-fill"
            onClick={handleDownload}
          >
            <i className="fas fa-download mr-1"></i> Download PDF
          </Button>
        </div>
      </Card.Header>

      {/* Main Canvas / PDF Area */}
      <Card.Body className="p-3" style={{ backgroundColor: '#f1f5f9', maxHeight: '78vh', overflowY: 'auto' }}>
        {previewError && (
          <Alert variant="danger" className="mb-3">
            <i className="fas fa-exclamation-triangle mr-2"></i> {previewError}
          </Alert>
        )}

        {viewMode === 'design' && renderInteractiveCanvas()}

        {viewMode === 'preview' && (
          <div style={{ height: '70vh', minHeight: '580px' }}>
            {previewUrl ? (
              <iframe
                title="Live PDF Preview"
                src={previewUrl}
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: '4px' }}
              />
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                <Spinner animation="border" className="mb-2" />
                <p className="small">Rendering live PDF preview...</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'split' && (
          <Row>
            <Col lg="6" className="mb-3">
              {renderInteractiveCanvas()}
            </Col>
            <Col lg="6" className="mb-3" style={{ height: '70vh', minHeight: '580px' }}>
              {previewUrl ? (
                <iframe
                  title="Live PDF Preview Split"
                  src={previewUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', borderRadius: '4px' }}
                />
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                  <Spinner animation="border" className="mb-2" />
                  <p className="small">Rendering live PDF preview...</p>
                </div>
              )}
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}

export default DesignerCanvas;

