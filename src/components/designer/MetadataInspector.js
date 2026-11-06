import React from 'react';
import { Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { useDesigner } from 'context/DesignerContext';

function MetadataInspector() {
  const {
    template,
    updateSection,
    selectedBlockIndex,
    selectMetadataBlock,
    addMetadataBlock,
    updateMetadataBlock,
    deleteMetadataBlock,
    scalarPaths,
  } = useDesigner();

  const metadata = template.sections.metadata || {};
  const blocks = metadata.blocks || [];

  const handleColumnsCountChange = (count) => {
    updateSection('metadata', { columnsCount: parseInt(count, 10) });
  };

  const handleAddFieldToBlock = (blockIndex) => {
    const block = blocks[blockIndex];
    if (!block) return;
    const newFields = [...(block.fields || []), { label: 'New Field', key: '', value: 'Value' }];
    updateMetadataBlock(blockIndex, { fields: newFields });
  };

  const handleUpdateBlockField = (blockIndex, fieldIndex, prop, value) => {
    const block = blocks[blockIndex];
    if (!block) return;
    const newFields = (block.fields || []).map((f, i) =>
      i === fieldIndex ? { ...f, [prop]: value } : f
    );
    updateMetadataBlock(blockIndex, { fields: newFields });
  };

  const handleDeleteBlockField = (blockIndex, fieldIndex) => {
    const block = blocks[blockIndex];
    if (!block) return;
    const newFields = (block.fields || []).filter((_, i) => i !== fieldIndex);
    updateMetadataBlock(blockIndex, { fields: newFields });
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
        <h6 className="font-weight-bold mb-0 text-primary">
          <i className="fas fa-th-large mr-2"></i> Metadata Grid (Info Blocks)
        </h6>
      </div>

      <Form.Group className="mb-3">
        <Form.Label className="small font-weight-bold">Grid Columns</Form.Label>
        <Form.Control
          as="select"
          size="sm"
          value={metadata.columnsCount || 2}
          onChange={(e) => handleColumnsCountChange(e.target.value)}
        >
          <option value="1">1 Column (Full Width)</option>
          <option value="2">2 Columns (Half Width)</option>
          <option value="3">3 Columns (Third Width)</option>
        </Form.Control>
      </Form.Group>

      <div className="d-flex align-items-center justify-content-between mb-2">
        <Form.Label className="small font-weight-bold mb-0">Blocks ({blocks.length})</Form.Label>
        <Button
          variant="outline-primary"
          size="sm"
          className="py-0 px-2"
          style={{ fontSize: '11px' }}
          onClick={() => addMetadataBlock()}
        >
          <i className="fas fa-plus mr-1"></i> Add Block
        </Button>
      </div>

      {blocks.map((block, bIdx) => (
        <div key={bIdx} className="p-2 mb-3 bg-light border rounded">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small font-weight-bold text-dark">
              Block #{bIdx + 1}: {block.title || 'Untitled'}
            </span>
            <Button
              variant="link"
              size="sm"
              className="text-danger p-0"
              onClick={() => deleteMetadataBlock(bIdx)}
              title="Delete block"
            >
              <i className="fas fa-trash-alt"></i>
            </Button>
          </div>

          <Form.Group className="mb-2">
            <Form.Label className="text-muted mb-0" style={{ fontSize: '10px' }}>
              Block Title (e.g. Bill To)
            </Form.Label>
            <Form.Control
              type="text"
              size="sm"
              value={block.title}
              onChange={(e) => updateMetadataBlock(bIdx, { title: e.target.value })}
            />
          </Form.Group>

          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-muted" style={{ fontSize: '11px', fontWeight: 'bold' }}>
              Block Fields
            </span>
            <Button
              variant="link"
              size="sm"
              className="p-0 text-primary"
              style={{ fontSize: '11px' }}
              onClick={() => handleAddFieldToBlock(bIdx)}
            >
              + Add Field
            </Button>
          </div>

          {(block.fields || []).map((field, fIdx) => (
            <div key={fIdx} className="border-top pt-2 mt-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Control
                  type="text"
                  size="sm"
                  className="mr-1"
                  placeholder="Label"
                  value={field.label}
                  onChange={(e) => handleUpdateBlockField(bIdx, fIdx, 'label', e.target.value)}
                  style={{ width: '45%' }}
                />
                <Form.Control
                  as="select"
                  size="sm"
                  value={field.key || ''}
                  onChange={(e) => handleUpdateBlockField(bIdx, fIdx, 'key', e.target.value)}
                  style={{ width: '45%' }}
                >
                  <option value="">Static</option>
                  {scalarPaths.map((p) => (
                    <option key={p.path} value={p.path}>
                      {p.path}
                    </option>
                  ))}
                </Form.Control>
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger p-0 ml-1"
                  onClick={() => handleDeleteBlockField(bIdx, fIdx)}
                  title="Remove"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>

              {(!field.key || field.key === '') && (
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Static text"
                  value={field.value}
                  onChange={(e) => handleUpdateBlockField(bIdx, fIdx, 'value', e.target.value)}
                  className="mb-1"
                  style={{ fontSize: '11px' }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default MetadataInspector;

