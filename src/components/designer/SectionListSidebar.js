import React from 'react';
import { Card, Button, Badge, Form } from 'react-bootstrap';
import { useDesigner } from 'context/DesignerContext';
import { PRESETS } from 'presets';

function SectionListSidebar() {
  const {
    template,
    selectedPresetId,
    loadPreset,
    selectedSectionId,
    selectSection,
    toggleSection,
    isValidTemplate,
    templateErrors,
  } = useDesigner();

  const sections = template.sections || {};

  const sectionItems = [
    {
      id: 'header',
      name: 'Document Header',
      icon: 'heading',
      enabled: sections.header?.enabled,
      badge: null,
    },
    {
      id: 'metadata',
      name: 'Metadata / Info Grid',
      icon: 'th-large',
      enabled: sections.metadata?.enabled,
      badge: `${sections.metadata?.blocks?.length || 0} blocks`,
    },
    {
      id: 'table',
      name: 'Data Table',
      icon: 'table',
      enabled: sections.table?.enabled,
      badge: `${sections.table?.columns?.length || 0} cols`,
    },
    {
      id: 'summary',
      name: 'Summary & Totals',
      icon: 'calculator',
      enabled: sections.summary?.enabled,
      badge: `${sections.summary?.rows?.length || 0} rows`,
    },
    {
      id: 'footer',
      name: 'Footer & Terms',
      icon: 'shoe-prints',
      enabled: sections.footer?.enabled,
      badge: null,
    },
  ];

  return (
    <div className="h-100">
      {/* Preset Selector Card */}
      <Card className="shadow-sm mb-3 border-0">
        <Card.Header className="bg-light p-2 border-bottom">
          <span className="small font-weight-bold text-muted text-uppercase">
            <i className="fas fa-folder-open mr-1"></i> Template Preset
          </span>
        </Card.Header>
        <Card.Body className="p-2">
          <Form.Control
            as="select"
            size="sm"
            value={selectedPresetId}
            onChange={(e) => loadPreset(e.target.value)}
            className="font-weight-bold mb-2"
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Form.Control>
          <div className="small text-muted" style={{ fontSize: '11px' }}>
            {PRESETS.find((p) => p.id === selectedPresetId)?.description}
          </div>
        </Card.Body>
      </Card>

      {/* Report Sections Stack Card */}
      <Card className="shadow-sm mb-3 border-0">
        <Card.Header className="bg-light p-2 border-bottom d-flex justify-content-between align-items-center">
          <span className="small font-weight-bold text-muted text-uppercase">
            <i className="fas fa-layer-group mr-1"></i> Report Sections
          </span>
          <Badge variant={isValidTemplate ? 'success' : 'warning'}>
            {isValidTemplate ? 'Valid' : `${templateErrors.length} issues`}
          </Badge>
        </Card.Header>
        <Card.Body className="p-2">
          {sectionItems.map((item) => {
            const isSelected = selectedSectionId === item.id;
            return (
              <div
                key={item.id}
                className={`d-flex align-items-center justify-content-between p-2 mb-1 rounded border ${
                  isSelected ? 'border-primary bg-primary text-white' : 'bg-white text-dark'
                }`}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onClick={() => selectSection(item.id)}
              >
                <div className="d-flex align-items-center text-truncate">
                  <i className={`fas fa-${item.icon} mr-2 ${isSelected ? 'text-white' : 'text-primary'}`} style={{ width: '16px' }}></i>
                  <span className="small font-weight-bold text-truncate">{item.name}</span>
                </div>

                <div className="d-flex align-items-center">
                  {item.badge && (
                    <Badge
                      variant={isSelected ? 'light' : 'secondary'}
                      className="mr-2 font-weight-normal"
                      style={{ fontSize: '10px' }}
                    >
                      {item.badge}
                    </Badge>
                  )}

                  <button
                    type="button"
                    className={`btn btn-link p-0 ${isSelected ? 'text-white' : item.enabled ? 'text-success' : 'text-muted'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection(item.id);
                    }}
                    title={item.enabled ? 'Disable section' : 'Enable section'}
                  >
                    <i className={`fas fa-${item.enabled ? 'eye' : 'eye-slash'}`}></i>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Page Setup Quick Item */}
          <div
            className={`d-flex align-items-center justify-content-between p-2 mt-2 rounded border ${
              selectedSectionId === 'page' ? 'border-primary bg-primary text-white' : 'bg-light text-muted'
            }`}
            style={{ cursor: 'pointer' }}
            onClick={() => selectSection('page')}
          >
            <div className="d-flex align-items-center">
              <i className={`fas fa-sliders-h mr-2 ${selectedSectionId === 'page' ? 'text-white' : 'text-dark'}`}></i>
              <span className="small font-weight-bold">Page & Theme Setup</span>
            </div>
            <span className="small" style={{ fontSize: '10px' }}>
              {template.page?.pageSize} ({template.page?.pageOrientation})
            </span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default SectionListSidebar;

