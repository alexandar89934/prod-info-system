import { useTranslation } from 'react-i18next';

export const useDataGridLocaleText = () => {
  const { t } = useTranslation();

  return {
    toolbarColumns: t('dataGrid.toolbarColumns'),
    toolbarDensity: t('dataGrid.toolbarDensity'),
    toolbarDensityCompact: t('dataGrid.toolbarDensityCompact'),
    toolbarDensityStandard: t('dataGrid.toolbarDensityStandard'),
    toolbarDensityComfortable: t('dataGrid.toolbarDensityComfortable'),
    toolbarExport: t('dataGrid.toolbarExport'),
    toolbarExportCSV: t('dataGrid.toolbarExportCSV'),
    toolbarExportPrint: t('dataGrid.toolbarExportPrint'),
    columnsPanelTextFieldLabel: t('dataGrid.columnsPanelTextFieldLabel'),
    columnsPanelTextFieldPlaceholder: t('dataGrid.columnsPanelTextFieldPlaceholder'),
    columnsPanelShowAllButton: t('dataGrid.columnsPanelShowAllButton'),
    columnsPanelHideAllButton: t('dataGrid.columnsPanelHideAllButton'),
  };
};