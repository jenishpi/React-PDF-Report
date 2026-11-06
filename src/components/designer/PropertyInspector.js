import React from 'react';
import { Card, Nav } from 'react-bootstrap';
import { useDesigner } from 'context/DesignerContext';
import PageInspector from './PageInspector';
import HeaderInspector from './HeaderInspector';
import MetadataInspector from './MetadataInspector';
import TableColumnBuilder from './TableColumnBuilder';
import SummaryInspector from './SummaryInspector';
import FooterInspector from './FooterInspector';

const SECTIONS_NAV = [
  { id: 'page', label: 'Page', icon: 'sliders-h' },
  { id: 'header', label: 'Header', icon: 'heading' },
  { id: 'metadata', label: 'Info', icon: 'th-large' },
  { id: 'table', label: 'Table', icon: 'table' },
  { id: 'summary', label: 'Totals', icon: 'calculator' },
  { id: 'footer', label: 'Footer', icon: 'shoe-prints' },
];

function PropertyInspector() {
  const { selectedSectionId, selectSection } = useDesigner();

  const renderActiveInspector = () => {
    switch (selectedSectionId) {
      case 'page':
        return <PageInspector />;
      case 'header':
        return <HeaderInspector />;
      case 'metadata':
        return <MetadataInspector />;
      case 'table':
        return <TableColumnBuilder />;
      case 'summary':
        return <SummaryInspector />;
      case 'footer':
        return <FooterInspector />;
      default:
        return <TableColumnBuilder />;
    }
  };

  return (
    <Card className="shadow-sm h-100 border-0">
      <Card.Header className="bg-light p-2 border-bottom">
        <Nav variant="pills" className="nav-justified" style={{ fontSize: '11px' }}>
          {SECTIONS_NAV.map((sec) => (
            <Nav.Item key={sec.id}>
              <Nav.Link
                active={selectedSectionId === sec.id}
                onClick={() => selectSection(sec.id)}
                className="py-1 px-1 font-weight-bold"
                style={{ cursor: 'pointer' }}
              >
                <i className={`fas fa-${sec.icon} d-block mb-1`}></i>
                {sec.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </Card.Header>

      <Card.Body className="p-3" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
        {renderActiveInspector()}
      </Card.Body>
    </Card>
  );
}

export default PropertyInspector;

