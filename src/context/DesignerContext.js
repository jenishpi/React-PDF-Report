import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { getDefaultTemplate, validateTemplate } from 'schemas/reportTemplateSchema';
import { invoicePreset, getPresetById } from 'presets';
import { getPdfDataUrl } from 'utils/pdfGenerator';
import { extractScalarPaths, discoverArraySources } from 'utils/dataIntrospector';

const DesignerContext = createContext(null);

const INITIAL_PRESET = invoicePreset;

const initialState = {
  template: JSON.parse(JSON.stringify(INITIAL_PRESET.template)),
  data: JSON.parse(JSON.stringify(INITIAL_PRESET.sampleData)),
  selectedPresetId: INITIAL_PRESET.id,
  selectedSectionId: 'table', // default selected section in inspector
  selectedColumnId: null,
  selectedBlockIndex: 0,
  selectedRowId: null,
  viewMode: 'design', // 'design' | 'preview' | 'json'
  previewUrl: null,
  isGeneratingPreview: false,
  previewError: null,
  scalarPaths: extractScalarPaths(INITIAL_PRESET.sampleData),
  arraySources: discoverArraySources(INITIAL_PRESET.sampleData),
  // History for Undo / Redo
  history: [JSON.parse(JSON.stringify(INITIAL_PRESET.template))],
  historyIndex: 0,
};

function pushHistory(state, newTemplate) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(newTemplate)));
  // Limit history to 30 snapshots
  if (newHistory.length > 30) newHistory.shift();
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

function designerReducer(state, action) {
  switch (action.type) {
    case 'LOAD_PRESET': {
      const preset = getPresetById(action.presetId);
      const newTemplate = JSON.parse(JSON.stringify(preset.template));
      const newData = JSON.parse(JSON.stringify(preset.sampleData));
      return {
        ...state,
        template: newTemplate,
        data: newData,
        selectedPresetId: preset.id,
        selectedSectionId: 'table',
        selectedColumnId: null,
        selectedBlockIndex: 0,
        selectedRowId: null,
        scalarPaths: extractScalarPaths(newData),
        arraySources: discoverArraySources(newData),
        ...pushHistory(state, newTemplate),
      };
    }

    case 'SET_TEMPLATE': {
      return {
        ...state,
        template: action.template,
        ...pushHistory(state, action.template),
      };
    }

    case 'SET_DATA': {
      return {
        ...state,
        data: action.data,
        scalarPaths: extractScalarPaths(action.data),
        arraySources: discoverArraySources(action.data),
      };
    }

    case 'UPDATE_PAGE_CONFIG': {
      const newTemplate = {
        ...state.template,
        page: {
          ...state.template.page,
          ...action.payload,
        },
      };
      return {
        ...state,
        template: newTemplate,
        ...pushHistory(state, newTemplate),
      };
    }

    case 'TOGGLE_SECTION': {
      const { sectionId, enabled } = action;
      if (!state.template.sections[sectionId]) return state;

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          [sectionId]: {
            ...state.template.sections[sectionId],
            enabled: enabled !== undefined ? enabled : !state.template.sections[sectionId].enabled,
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        ...pushHistory(state, newTemplate),
      };
    }

    case 'UPDATE_SECTION': {
      const { sectionId, payload } = action;
      if (!state.template.sections[sectionId]) return state;

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          [sectionId]: {
            ...state.template.sections[sectionId],
            ...payload,
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        ...pushHistory(state, newTemplate),
      };
    }

    // --- Table Column Operations ---
    case 'SELECT_COLUMN': {
      return {
        ...state,
        selectedSectionId: 'table',
        selectedColumnId: action.columnId,
      };
    }

    case 'ADD_COLUMN': {
      const table = state.template.sections.table;
      const newCol = {
        id: `col_${Date.now()}`,
        header: action.column?.header || 'New Column',
        fieldKey: action.column?.fieldKey || '',
        width: action.column?.width !== undefined ? action.column.width : '*',
        align: action.column?.align || 'left',
        format: action.column?.format || 'text',
      };

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          table: {
            ...table,
            columns: [...(table.columns || []), newCol],
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        selectedSectionId: 'table',
        selectedColumnId: newCol.id,
        ...pushHistory(state, newTemplate),
      };
    }

    case 'UPDATE_COLUMN': {
      const { columnId, payload } = action;
      const table = state.template.sections.table;
      const newColumns = (table.columns || []).map((c) =>
        c.id === columnId ? { ...c, ...payload } : c
      );

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          table: {
            ...table,
            columns: newColumns,
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        ...pushHistory(state, newTemplate),
      };
    }

    case 'DELETE_COLUMN': {
      const { columnId } = action;
      const table = state.template.sections.table;
      const newColumns = (table.columns || []).filter((c) => c.id !== columnId);

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          table: {
            ...table,
            columns: newColumns,
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        selectedColumnId: newColumns.length > 0 ? newColumns[0].id : null,
        ...pushHistory(state, newTemplate),
      };
    }

    case 'REORDER_COLUMNS': {
      const { fromIndex, toIndex } = action;
      const table = state.template.sections.table;
      const columns = [...(table.columns || [])];
      if (fromIndex < 0 || fromIndex >= columns.length || toIndex < 0 || toIndex >= columns.length) {
        return state;
      }
      const [movedCol] = columns.splice(fromIndex, 1);
      columns.splice(toIndex, 0, movedCol);

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          table: {
            ...table,
            columns,
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        ...pushHistory(state, newTemplate),
      };
    }

    // --- Metadata Block Operations ---
    case 'SELECT_METADATA_BLOCK': {
      return {
        ...state,
        selectedSectionId: 'metadata',
        selectedBlockIndex: action.blockIndex,
      };
    }

    case 'ADD_METADATA_BLOCK': {
      const metadata = state.template.sections.metadata;
      const newBlock = {
        title: action.block?.title || 'New Information Block',
        fields: action.block?.fields || [
          { label: 'Field Name', key: '', value: 'Sample Value' },
        ],
      };

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          metadata: {
            ...metadata,
            blocks: [...(metadata.blocks || []), newBlock],
            columnsCount: Math.min(3, (metadata.blocks?.length || 0) + 1),
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        selectedSectionId: 'metadata',
        selectedBlockIndex: (metadata.blocks || []).length,
        ...pushHistory(state, newTemplate),
      };
    }

    case 'UPDATE_METADATA_BLOCK': {
      const { blockIndex, payload } = action;
      const metadata = state.template.sections.metadata;
      const newBlocks = (metadata.blocks || []).map((b, idx) =>
        idx === blockIndex ? { ...b, ...payload } : b
      );

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          metadata: {
            ...metadata,
            blocks: newBlocks,
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        ...pushHistory(state, newTemplate),
      };
    }

    case 'DELETE_METADATA_BLOCK': {
      const { blockIndex } = action;
      const metadata = state.template.sections.metadata;
      const newBlocks = (metadata.blocks || []).filter((_, idx) => idx !== blockIndex);

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          metadata: {
            ...metadata,
            blocks: newBlocks,
            columnsCount: Math.max(1, newBlocks.length),
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        selectedBlockIndex: Math.max(0, blockIndex - 1),
        ...pushHistory(state, newTemplate),
      };
    }

    // --- Summary Row Operations ---
    case 'SELECT_SUMMARY_ROW': {
      return {
        ...state,
        selectedSectionId: 'summary',
        selectedRowId: action.rowId,
      };
    }

    case 'ADD_SUMMARY_ROW': {
      const summary = state.template.sections.summary;
      const newRow = {
        id: `sum_${Date.now()}`,
        label: action.row?.label || 'New Total',
        type: action.row?.type || 'aggregate',
        aggregate: action.row?.aggregate || 'SUM',
        targetColumn: action.row?.targetColumn || '',
        dataKey: action.row?.dataKey || '',
        value: action.row?.value || 0,
        format: action.row?.format || 'currency',
        isBold: !!action.row?.isBold,
      };

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          summary: {
            ...summary,
            rows: [...(summary.rows || []), newRow],
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        selectedSectionId: 'summary',
        selectedRowId: newRow.id,
        ...pushHistory(state, newTemplate),
      };
    }

    case 'UPDATE_SUMMARY_ROW': {
      const { rowId, payload } = action;
      const summary = state.template.sections.summary;
      const newRows = (summary.rows || []).map((r) =>
        r.id === rowId ? { ...r, ...payload } : r
      );

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          summary: {
            ...summary,
            rows: newRows,
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        ...pushHistory(state, newTemplate),
      };
    }

    case 'DELETE_SUMMARY_ROW': {
      const { rowId } = action;
      const summary = state.template.sections.summary;
      const newRows = (summary.rows || []).filter((r) => r.id !== rowId);

      const newTemplate = {
        ...state.template,
        sections: {
          ...state.template.sections,
          summary: {
            ...summary,
            rows: newRows,
          },
        },
      };

      return {
        ...state,
        template: newTemplate,
        selectedRowId: newRows.length > 0 ? newRows[0].id : null,
        ...pushHistory(state, newTemplate),
      };
    }

    // --- Selection & View Mode ---
    case 'SELECT_SECTION': {
      return {
        ...state,
        selectedSectionId: action.sectionId,
        selectedColumnId: null,
      };
    }

    case 'SET_VIEW_MODE': {
      return {
        ...state,
        viewMode: action.mode,
      };
    }

    // --- Undo / Redo ---
    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const prevIndex = state.historyIndex - 1;
      return {
        ...state,
        template: JSON.parse(JSON.stringify(state.history[prevIndex])),
        historyIndex: prevIndex,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIndex = state.historyIndex + 1;
      return {
        ...state,
        template: JSON.parse(JSON.stringify(state.history[nextIndex])),
        historyIndex: nextIndex,
      };
    }

    case 'RESET_TO_DEFAULT': {
      const defaultTpl = getDefaultTemplate();
      return {
        ...state,
        template: defaultTpl,
        selectedSectionId: 'table',
        selectedColumnId: null,
        ...pushHistory(state, defaultTpl),
      };
    }

    // --- Preview Generation Status ---
    case 'SET_PREVIEW_GENERATING': {
      return {
        ...state,
        isGeneratingPreview: true,
        previewError: null,
      };
    }

    case 'SET_PREVIEW_SUCCESS': {
      return {
        ...state,
        isGeneratingPreview: false,
        previewUrl: action.url,
        previewError: null,
      };
    }

    case 'SET_PREVIEW_ERROR': {
      return {
        ...state,
        isGeneratingPreview: false,
        previewError: action.error,
      };
    }

    default:
      return state;
  }
}

export function DesignerProvider({ children }) {
  const [state, dispatch] = useReducer(designerReducer, initialState);
  const debounceTimerRef = useRef(null);

  // Debounced live PDF preview generation (300ms)
  useEffect(() => {
    dispatch({ type: 'SET_PREVIEW_GENERATING' });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      getPdfDataUrl(state.template, state.data)
        .then((url) => {
          dispatch({ type: 'SET_PREVIEW_SUCCESS', url });
        })
        .catch((err) => {
          console.error('PDF preview generation error:', err);
          dispatch({ type: 'SET_PREVIEW_ERROR', error: err.message || 'Error generating PDF preview' });
        });
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state.template, state.data]);

  // Convenience Action Dispatchers
  const loadPreset = useCallback((presetId) => dispatch({ type: 'LOAD_PRESET', presetId }), []);
  const setTemplate = useCallback((template) => dispatch({ type: 'SET_TEMPLATE', template }), []);
  const setData = useCallback((data) => dispatch({ type: 'SET_DATA', data }), []);
  const updatePageConfig = useCallback((payload) => dispatch({ type: 'UPDATE_PAGE_CONFIG', payload }), []);
  const toggleSection = useCallback((sectionId, enabled) => dispatch({ type: 'TOGGLE_SECTION', sectionId, enabled }), []);
  const updateSection = useCallback((sectionId, payload) => dispatch({ type: 'UPDATE_SECTION', sectionId, payload }), []);
  const selectSection = useCallback((sectionId) => dispatch({ type: 'SELECT_SECTION', sectionId }), []);
  const selectColumn = useCallback((columnId) => dispatch({ type: 'SELECT_COLUMN', columnId }), []);
  const addColumn = useCallback((column) => dispatch({ type: 'ADD_COLUMN', column }), []);
  const updateColumn = useCallback((columnId, payload) => dispatch({ type: 'UPDATE_COLUMN', columnId, payload }), []);
  const deleteColumn = useCallback((columnId) => dispatch({ type: 'DELETE_COLUMN', columnId }), []);
  const reorderColumns = useCallback((fromIndex, toIndex) => dispatch({ type: 'REORDER_COLUMNS', fromIndex, toIndex }), []);
  const selectMetadataBlock = useCallback((blockIndex) => dispatch({ type: 'SELECT_METADATA_BLOCK', blockIndex }), []);
  const addMetadataBlock = useCallback((block) => dispatch({ type: 'ADD_METADATA_BLOCK', block }), []);
  const updateMetadataBlock = useCallback((blockIndex, payload) => dispatch({ type: 'UPDATE_METADATA_BLOCK', blockIndex, payload }), []);
  const deleteMetadataBlock = useCallback((blockIndex) => dispatch({ type: 'DELETE_METADATA_BLOCK', blockIndex }), []);
  const selectSummaryRow = useCallback((rowId) => dispatch({ type: 'SELECT_SUMMARY_ROW', rowId }), []);
  const addSummaryRow = useCallback((row) => dispatch({ type: 'ADD_SUMMARY_ROW', row }), []);
  const updateSummaryRow = useCallback((rowId, payload) => dispatch({ type: 'UPDATE_SUMMARY_ROW', rowId, payload }), []);
  const deleteSummaryRow = useCallback((rowId) => dispatch({ type: 'DELETE_SUMMARY_ROW', rowId }), []);
  const setViewMode = useCallback((mode) => dispatch({ type: 'SET_VIEW_MODE', mode }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const resetToDefault = useCallback(() => dispatch({ type: 'RESET_TO_DEFAULT' }), []);

  const templateValidation = validateTemplate(state.template);

  const value = {
    ...state,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    isValidTemplate: templateValidation.valid,
    templateErrors: templateValidation.errors,
    // Dispatchers
    loadPreset,
    setTemplate,
    setData,
    updatePageConfig,
    toggleSection,
    updateSection,
    selectSection,
    selectColumn,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    selectMetadataBlock,
    addMetadataBlock,
    updateMetadataBlock,
    deleteMetadataBlock,
    selectSummaryRow,
    addSummaryRow,
    updateSummaryRow,
    deleteSummaryRow,
    setViewMode,
    undo,
    redo,
    resetToDefault,
  };

  return <DesignerContext.Provider value={value}>{children}</DesignerContext.Provider>;
}

export function useDesigner() {
  const context = useContext(DesignerContext);
  if (!context) {
    throw new Error('useDesigner must be used within a <DesignerProvider>');
  }
  return context;
}

