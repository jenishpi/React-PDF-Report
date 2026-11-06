import React from 'react';
import { DesignerProvider } from 'context/DesignerContext';
import DesignerWorkspace from 'components/designer/DesignerWorkspace';

function PdfMake() {
  return (
    <DesignerProvider>
      <DesignerWorkspace />
    </DesignerProvider>
  );
}

export default PdfMake;
