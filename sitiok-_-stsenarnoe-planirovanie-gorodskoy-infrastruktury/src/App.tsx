import React, { useState, useMemo, useEffect } from 'react';
import {
  Scenario,
  ModelInputs,
  ModelOutputs,
  QualityStatus,
  QualityProvenance,
} from './types/model';
import {
  DEFAULT_EXCEL_INPUTS,
  PRESET_SCENARIOS,
  MODEL_METADATA,
} from './constants/modelConfig';
import { calculateModel } from './calculationEngine/engine';
import { generateRecommendations } from './recommendations/generator';
import {
  loadScenariosFromStorage,
  saveScenariosToStorage,
  loadActiveScenarioId,
  saveActiveScenarioId,
  createNewScenario,
  duplicateScenario,
} from './scenarioStorage/storage';
import { exportScenarioToExcel } from './importExport/excelExport';

// Layout & Components
import { Header } from './components/layout/Header';
import { Sidebar, NavSection } from './components/layout/Sidebar';
import { ExplanationDrawer } from './components/layout/ExplanationDrawer';
import { WhyModal } from './components/shared/WhyModal';
import { ImportModal } from './components/shared/ImportModal';
import { PrintReportModal } from './components/shared/PrintReportModal';

// Section Views
import { OverviewSection } from './components/sections/OverviewSection';
import { SiteParamsSection } from './components/sections/SiteParamsSection';
import { TepTableSection } from './components/sections/TepTableSection';
import { InfrastructureSection } from './components/sections/InfrastructureSection';
import { ScenarioCompareSection } from './components/sections/ScenarioCompareSection';
import { SourcesModelSection } from './components/sections/SourcesModelSection';
import { ApiExplorerSection } from './components/sections/ApiExplorerSection';

export default function App() {
  // Scenarios state loaded from localStorage
  const [scenarios, setScenarios] = useState<Scenario[]>(() => loadScenariosFromStorage());
  const [activeScenarioId, setActiveScenarioId] = useState<string>(() => loadActiveScenarioId());
  const [activeSection, setActiveSection] = useState<NavSection>('overview');

  // Modals & Drawers state
  const [whyCellKey, setWhyCellKey] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [isExplanationDrawerOpen, setIsExplanationDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync scenarios to storage
  useEffect(() => {
    saveScenariosToStorage(scenarios);
  }, [scenarios]);

  // Sync active scenario ID
  useEffect(() => {
    saveActiveScenarioId(activeScenarioId);
  }, [activeScenarioId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Current active scenario
  const currentScenario = useMemo(() => {
    const found = scenarios.find((s) => s.id === activeScenarioId);
    return found || scenarios[0] || PRESET_SCENARIOS[0];
  }, [scenarios, activeScenarioId]);

  const baselineScenario = useMemo(() => {
    return scenarios.find((s) => s.isBaseline) || scenarios[0] || PRESET_SCENARIOS[0];
  }, [scenarios]);

  // Main Calculation Execution (Pure Engine)
  const outputs: ModelOutputs = useMemo(() => {
    return calculateModel(currentScenario.inputs);
  }, [currentScenario.inputs]);

  // Deterministic Recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(currentScenario.inputs, outputs);
  }, [currentScenario.inputs, outputs]);

  // Handler: Update inputs of active scenario
  const handleUpdateInput = <K extends keyof ModelInputs>(key: K, value: ModelInputs[K]) => {
    setScenarios((prev) =>
      prev.map((scen) => {
        if (scen.id !== currentScenario.id) return scen;
        return {
          ...scen,
          updatedAt: new Date().toISOString(),
          inputs: {
            ...scen.inputs,
            [key]: value,
          },
        };
      })
    );
  };

  // Handler: Adopt polygon area from map
  const handleAdoptPolygonArea = (areaHa: number) => {
    handleUpdateInput('siteAreaHa', areaHa);
    showToast(`Площадь C2 обновлена до ${areaHa} га на основе геометрии полигона`);
  };

  // Handler: Scenario Management
  const handleSelectScenario = (id: string) => {
    setActiveScenarioId(id);
    const scen = scenarios.find((s) => s.id === id);
    if (scen) {
      showToast(`Переключено на сценарий: «${scen.name}»`);
    }
  };

  const handleDuplicateScenario = (source: Scenario) => {
    const clone = duplicateScenario(source);
    setScenarios((prev) => [...prev, clone]);
    setActiveScenarioId(clone.id);
    showToast(`Создан сценарий: «${clone.name}»`);
  };

  const handleRenameScenario = (id: string, newName: string) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s))
    );
    showToast(`Сценарий переименован в: «${newName}»`);
  };

  const handleDeleteScenario = (id: string) => {
    if (scenarios.length <= 1) {
      showToast('Нельзя удалить единственный сценарий');
      return;
    }
    const remaining = scenarios.filter((s) => s.id !== id);
    setScenarios(remaining);
    if (activeScenarioId === id) {
      setActiveScenarioId(remaining[0].id);
    }
    showToast('Сценарий удалён');
  };

  const handleMakeBaseline = (id: string) => {
    setScenarios((prev) =>
      prev.map((s) => ({
        ...s,
        isBaseline: s.id === id,
      }))
    );
    showToast('Назначен новый базовый сценарий');
  };

  const handleResetScenarios = () => {
    setScenarios(PRESET_SCENARIOS);
    setActiveScenarioId(PRESET_SCENARIOS[0].id);
    showToast('Сценарии сброшены к стандартным A, B, C');
  };

  const handleResetToExcel = () => {
    handleUpdateInput('siteAreaHa', DEFAULT_EXCEL_INPUTS.siteAreaHa);
    handleUpdateInput('floors', DEFAULT_EXCEL_INPUTS.floors);
    handleUpdateInput('buildingRatio', DEFAULT_EXCEL_INPUTS.buildingRatio);
    handleUpdateInput('avgApartmentArea', DEFAULT_EXCEL_INPUTS.avgApartmentArea);
    handleUpdateInput('householdSize', DEFAULT_EXCEL_INPUTS.householdSize);
    handleUpdateInput('greeningNorm', DEFAULT_EXCEL_INPUTS.greeningNorm);
    handleUpdateInput('housingProvision', DEFAULT_EXCEL_INPUTS.housingProvision);
    handleUpdateInput('shareKids0to7', DEFAULT_EXCEL_INPUTS.shareKids0to7);
    handleUpdateInput('shareKids7to18', DEFAULT_EXCEL_INPUTS.shareKids7to18);
    handleUpdateInput('existingKindergarten', { ...DEFAULT_EXCEL_INPUTS.existingKindergarten });
    handleUpdateInput('existingSchool', { ...DEFAULT_EXCEL_INPUTS.existingSchool });
    handleUpdateInput('existingParkingPermanent', { ...DEFAULT_EXCEL_INPUTS.existingParkingPermanent });
    handleUpdateInput('calculationMode', 'excel');
    showToast('Параметры сброшены к значениям книги Excel prostaia_model');
  };

  const handleExportExcel = () => {
    exportScenarioToExcel(currentScenario, outputs);
    showToast('Файл .xlsx сформирован и скачивается');
  };

  const handleApplyImportedInputs = (newInputs: ModelInputs, scenarioName?: string) => {
    const newScen = createNewScenario(
      scenarioName || `Импортированный (${new Date().toLocaleDateString('ru-RU')})`,
      'Создано на основе импорта книги Excel',
      newInputs
    );
    setScenarios((prev) => [...prev, newScen]);
    setActiveScenarioId(newScen.id);
    showToast('Данные успешно импортированы в новый сценарий!');
  };

  const handleImportFullScenario = (importedScenario: Scenario) => {
    setScenarios((prev) => [...prev, importedScenario]);
    setActiveScenarioId(importedScenario.id);
    showToast(`Импортирован сценарий «${importedScenario.name}»`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-amber-400 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenPrintReport={() => setIsPrintReportOpen(true)}
      />

      {/* Workspace Area: Left Sidebar Navigation + Central Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          onOpenExplanationsDrawer={() => setIsExplanationDrawerOpen(true)}
        />

        {/* Central Workspace Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          
          {activeSection === 'overview' && (
            <OverviewSection
              scenario={currentScenario}
              inputs={currentScenario.inputs}
              outputs={outputs}
              recommendations={recommendations}
              onNavigateTo={setActiveSection}
              onResetToExcel={handleResetToExcel}
              onExportExcel={handleExportExcel}
              onOpenWhyModal={(key) => setWhyCellKey(key)}
              onAdoptPolygonArea={handleAdoptPolygonArea}
            />
          )}

          {activeSection === 'site_params' && (
            <SiteParamsSection
              inputs={currentScenario.inputs}
              baselineInputs={baselineScenario.inputs}
              onUpdateInput={handleUpdateInput}
              onResetToBaseline={() => handleUpdateInput('siteAreaHa', baselineScenario.inputs.siteAreaHa)}
            />
          )}

          {activeSection === 'tep_table' && (
            <TepTableSection
              inputs={currentScenario.inputs}
              outputs={outputs}
              onOpenWhyModal={(key) => setWhyCellKey(key)}
            />
          )}

          {activeSection === 'infrastructure' && (
            <InfrastructureSection
              inputs={currentScenario.inputs}
              outputs={outputs}
              onUpdateInput={handleUpdateInput}
            />
          )}

          {activeSection === 'scenarios_compare' && (
            <ScenarioCompareSection
              scenarios={scenarios}
              activeScenarioId={activeScenarioId}
              onSelectScenario={handleSelectScenario}
              onDuplicateScenario={handleDuplicateScenario}
              onRenameScenario={handleRenameScenario}
              onDeleteScenario={handleDeleteScenario}
              onMakeBaseline={handleMakeBaseline}
              onResetScenarios={handleResetScenarios}
            />
          )}

          {activeSection === 'sources_model' && (
            <SourcesModelSection recommendations={recommendations} />
          )}

          {activeSection === 'api_explorer' && (
            <ApiExplorerSection currentInputs={currentScenario.inputs} />
          )}

        </main>
      </div>

      {/* Modals and Drawers */}
      <WhyModal
        explanation={whyCellKey ? outputs.explanations[whyCellKey] || null : null}
        onClose={() => setWhyCellKey(null)}
      />

      <ExplanationDrawer
        isOpen={isExplanationDrawerOpen}
        onClose={() => setIsExplanationDrawerOpen(false)}
        inputs={currentScenario.inputs}
        outputs={outputs}
        compareScenario={baselineScenario.id !== currentScenario.id ? baselineScenario : null}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onApplyInputs={handleApplyImportedInputs}
        onImportFullScenario={handleImportFullScenario}
      />

      <PrintReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        scenario={currentScenario}
        inputs={currentScenario.inputs}
        outputs={outputs}
        recommendations={recommendations}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <strong className="text-slate-300">СитиОК</strong> · Сценарное планирование городской инфраструктуры (Калькулятор на базе Excel Лист1)
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            {MODEL_METADATA.constantNotice}
          </div>
        </div>
      </footer>

    </div>
  );
}
