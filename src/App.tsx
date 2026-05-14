import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Settings, 
  Maximize2, 
  Minimize2, 
  Layout,
  Plus,
  Users,
  Calendar,
  Save,
  ArrowLeft,
  Trash2,
  ChevronRight
} from 'lucide-react';
import Cabinet3D from './components/Cabinet3D';
import { CabinetConfig, Project } from './types';

interface MainDimensionProps {
  label: string;
  value: number | string;
  keyName: keyof CabinetConfig;
  step?: number;
  onUpdate: (key: keyof CabinetConfig, value: number) => void;
}

const MainDimension = ({ label, value, keyName, step = 0.125, onUpdate }: MainDimensionProps) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());

  // Sync local state when external value changes (e.g. from buttons)
  React.useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    if (val !== '') {
      onUpdate(keyName, Number(val));
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-2 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label} (IN)</label>
      <input 
        type="number" 
        value={localValue}
        step={step}
        min={0}
        onChange={handleChange}
        className="bg-transparent text-xl font-bold text-blue-400 focus:outline-none focus:text-white transition-colors w-full"
      />
    </div>
  );
};

const GenericNumberInput = ({ value, onChange, className, step, min }: { value: number, onChange: (val: number) => void, className?: string, step?: number, min?: number }) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());
  React.useEffect(() => { setLocalValue(value.toString()); }, [value]);
  
  return (
    <input 
      type="number"
      step={step}
      min={min}
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        if (e.target.value !== '') onChange(Number(e.target.value));
      }}
      className={className}
    />
  );
};

import { calculateCutList, toFraction } from './lib/cabinetLogic';

const DEFAULT_CONFIG: CabinetConfig = {
  width: 36.5,
  height: 35,
  depth: 24,
  thickness: 1.75,
  gap: 0.125,
  numDoors: 2,
  showDoors: true
};

export default function App() {
  const [view, setView] = useState<'home' | 'list' | 'create' | 'edit'>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  // Initial setup: Initial state for the editor
  const [config, setConfig] = useState<CabinetConfig>(DEFAULT_CONFIG);

  // Load projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('harmony_glass_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem('harmony_glass_projects', JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = () => {
    if (!newClientName) return;
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      clientName: newClientName,
      date: newDate,
      config: DEFAULT_CONFIG
    };
    
    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    setConfig(DEFAULT_CONFIG);
    setView('edit');
    setNewClientName('');
  };

  const handleEditProject = (project: Project) => {
    setActiveProject(project);
    setConfig(project.config);
    setView('edit');
  };

  const handleSaveActiveProject = () => {
    if (!activeProject) return;
    
    setProjects(prev => prev.map(p => 
      p.id === activeProject.id 
      ? { ...p, config: config } 
      : p
    ));
    
    // Guardar y redirigir automáticamente al listado
    setView('list');
    setActiveProject(null);
  };

  const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null);
  const [deletePassInput, setDeletePassInput] = useState('');
  const [passError, setPassError] = useState(false);

  const handleDeleteAttempt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPasswordModal(id);
    setDeletePassInput('');
    setPassError(false);
  };

  const confirmDelete = () => {
    if (deletePassInput === '1989') {
      setProjects(prev => prev.filter(p => p.id === showPasswordModal ? false : true));
      setShowPasswordModal(null);
    } else {
      setPassError(true);
    }
  };

  const updateConfig = (key: keyof CabinetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const cutList = useMemo(() => calculateCutList(config), [config]);

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans flex flex-col">
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-[#1a2333] rounded-xl flex items-center justify-center border border-slate-700/50 shadow-lg p-1">
              <div className="flex items-end gap-1 h-full w-full relative">
                <div className="w-1.5 bg-[#2d4694] h-[60%] rounded-t-sm" />
                <div className="w-1.5 bg-[#b91c1c] h-[90%] rounded-t-sm" />
                <div className="ml-0.5 relative flex-1 h-full flex items-center justify-center">
                  <div className="w-full h-1/2 bg-[#2d4694] rounded-sm relative -bottom-1">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#b91c1c] -translate-y-2 rotate-[-30deg] origin-left" />
                    <div className="absolute top-0 right-0 w-full h-[2px] bg-[#b91c1c] -translate-y-2 rotate-[30deg] origin-right" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-3 bg-white rounded-t-[1px]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-[900] italic tracking-tighter uppercase leading-none">
                <span className="text-[#b91c1c]">HARMONY</span>
                <span className="text-[#60a5fa] ml-2">GLASS</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] font-bold mt-1 text-center">Sistemas de Aluminio y Vidrio</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]">
          <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
            <button 
              onClick={() => setView('create')}
              className="group bg-slate-900 border-2 border-slate-800 hover:border-blue-500 p-10 rounded-[2.5rem] flex flex-col items-center gap-6 transition-all hover:-translate-y-2 shadow-2xl active:scale-95"
            >
              <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
                <Plus size={48} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">NUEVO CLIENTE</h3>
                <p className="text-slate-500 text-sm font-medium">Inicia un nuevo diseño y desglose</p>
              </div>
            </button>

            <button 
              onClick={() => setView('list')}
              className="group bg-slate-900 border-2 border-slate-800 hover:border-emerald-500 p-10 rounded-[2.5rem] flex flex-col items-center gap-6 transition-all hover:-translate-y-2 shadow-2xl active:scale-95"
            >
              <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
                <Save size={48} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">GUARDADO</h3>
                <p className="text-slate-500 text-sm font-medium pr-1">Ver tus proyectos y clientes previos</p>
              </div>
            </button>
          </div>
        </main>

        <footer className="p-8 text-center text-slate-600 text-[10px] font-mono tracking-widest uppercase">
          © 2026 Harmony Glass • Herramienta de Ingeniería
        </footer>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-blue-500/30">
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('home')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 mr-2"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-12 h-12 bg-[#1a2333] rounded-xl flex items-center justify-center border border-slate-700/50 shadow-lg p-1">
                <div className="flex items-end gap-1 h-full w-full relative">
                  <div className="w-1.5 bg-[#2d4694] h-[60%] rounded-t-sm" />
                  <div className="w-1.5 bg-[#b91c1c] h-[90%] rounded-t-sm" />
                  <div className="ml-0.5 relative flex-1 h-full flex items-center justify-center">
                    <div className="w-full h-1/2 bg-[#2d4694] rounded-sm relative -bottom-1">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-[#b91c1c] -translate-y-2 rotate-[-30deg] origin-left" />
                      <div className="absolute top-0 right-0 w-full h-[2px] bg-[#b91c1c] -translate-y-2 rotate-[30deg] origin-right" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-3 bg-white rounded-t-[1px]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-[900] italic tracking-tighter uppercase leading-none">
                  <span className="text-[#b91c1c]">HARMONY</span>
                  <span className="text-[#60a5fa] ml-2">GLASS</span>
                </h1>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] font-bold mt-1">Sistemas de Aluminio y Vidrio</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Listado de Proyectos</h2>
              <p className="text-slate-500 text-sm mt-1">Gestiona tus clientes y diseños de muebles</p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                <Users size={32} />
              </div>
              <p className="text-slate-400 font-medium">No tienes proyectos guardados aún.</p>
              <button 
                onClick={() => setView('create')}
                className="mt-6 text-blue-500 hover:text-blue-400 font-bold uppercase tracking-widest text-xs underline underline-offset-4"
              >
                Crea tu primer proyecto ahora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => handleEditProject(project)}
                  className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col group hover:border-blue-500/50 transition-all cursor-pointer shadow-2xl relative overflow-hidden active:scale-95"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-[40px] -mr-8 -mt-8 group-hover:bg-blue-600/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                      <Box size={24} />
                    </div>
                    <button 
                      onClick={(e) => handleDeleteAttempt(project.id, e)}
                      className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight mb-2">
                    {project.clientName}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-slate-800/50">
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      <Calendar size={12} className="text-blue-500" />
                      {project.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono font-bold">
                      <Maximize2 size={12} className="text-emerald-500" />
                      {toFraction(project.config.width)}" x {toFraction(project.config.height)}"
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[#60a5fa] font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Abrir Proyecto</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Custom Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">Seguridad</h3>
              <p className="text-slate-400 text-sm mb-6 font-medium">Ingresa la contraseña para eliminar este proyecto.</p>
              
              <div className="space-y-4">
                <input 
                  type="password"
                  autoFocus
                  placeholder="Contraseña"
                  value={deletePassInput}
                  onChange={(e) => {
                    setDeletePassInput(e.target.value);
                    setPassError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
                  className={`w-full bg-slate-800 border ${passError ? 'border-red-500' : 'border-slate-700'} rounded-xl p-4 text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:border-blue-500`}
                />
                
                {passError && <p className="text-red-500 text-[10px] font-bold uppercase text-center">Contraseña incorrecta</p>}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button 
                    onClick={() => setShowPasswordModal(null)}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="py-3 px-4 bg-red-600 hover:bg-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-red-900/20"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Nuevo Cliente</h2>
            <button onClick={() => setView('list')} className="p-2 text-slate-500 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre del Cliente</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Ej: Alberto Samboy"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha del Trabajo</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button 
              onClick={handleCreateProject}
              disabled={!newClientName}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:grayscale py-4 rounded-xl font-black text-sm tracking-widest uppercase shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              EMPEZAR DISEÑO
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-bottom border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (confirm('¿Deseas volver al listado? Asegúrate de haber guardado tus cambios.')) {
                  setView('list');
                  setActiveProject(null);
                }
              }}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 mr-2"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-12 h-12 bg-[#1a2333] rounded-xl flex items-center justify-center border border-slate-700/50 shadow-lg p-1">
              <div className="flex items-end gap-1 h-full w-full relative">
                <div className="w-1.5 bg-[#2d4694] h-[60%] rounded-t-sm" />
                <div className="w-1.5 bg-[#b91c1c] h-[90%] rounded-t-sm" />
                <div className="ml-0.5 relative flex-1 h-full flex items-center justify-center">
                  <div className="w-full h-1/2 bg-[#2d4694] rounded-sm relative -bottom-1">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#b91c1c] -translate-y-2 rotate-[-30deg] origin-left" />
                    <div className="absolute top-0 right-0 w-full h-[2px] bg-[#b91c1c] -translate-y-2 rotate-[30deg] origin-right" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-3 bg-white rounded-t-[1px]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-[900] italic tracking-tighter uppercase leading-none">
                  <span className="text-[#b91c1c]">Harmony</span>
                  <span className="text-[#60a5fa] ml-2">Glass</span>
                </h1>
                <span className="text-slate-700">|</span>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{activeProject?.clientName}</span>
              </div>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] font-bold mt-1">Sistemas de Aluminio y Vidrio</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSaveActiveProject}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-[10px] font-black tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 uppercase"
            >
              <Save size={14} />
              Guardar
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6 text-slate-400 font-mono text-xs uppercase tracking-widest">
                <Layout size={14} />
                Configuración
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-500">NÚMERO DE PUERTAS</label>
                  <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl">
                    <button 
                      onClick={() => updateConfig('numDoors', Math.max(0, config.numDoors - 1))}
                      className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
                    >
                      -
                    </button>
                    <GenericNumberInput 
                      min={0}
                      value={config.numDoors}
                      onChange={(val) => updateConfig('numDoors', val)}
                      className="bg-transparent text-center text-xl font-bold text-blue-400 focus:outline-none w-full"
                    />
                    <button 
                      onClick={() => updateConfig('numDoors', config.numDoors + 1)}
                      className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                   <button 
                    onClick={() => updateConfig('showDoors', !config.showDoors)}
                    disabled={config.numDoors === 0}
                    className={`w-full py-4 rounded-xl text-sm font-bold tracking-tight transition-all flex items-center justify-center gap-3 border shadow-lg active:scale-[0.98] ${
                      config.showDoors 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-blue-900/20' 
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {config.showDoors ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    {config.showDoors ? 'OCULTAR PUERTAS' : 'COLOCAR PUERTAS'}
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Box size={80} />
              </div>
              
              <div className="flex items-center gap-2 mb-6 text-[#b91c1c] font-mono text-xs uppercase tracking-widest font-bold">
                <Layout size={14} />
                Deglose Automático
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  <div className="col-span-1">Q</div>
                  <div className="col-span-7">PIEZA / MATERIAL</div>
                  <div className="col-span-4 text-right">LONGITUD</div>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cutList.map((piece, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 py-2 items-center border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 rounded px-1 transition-colors">
                      <div className="col-span-1 text-xs font-mono font-bold text-blue-500">{piece.quantity}x</div>
                      <div className="col-span-7">
                        <div className="text-xs font-bold text-slate-300">{piece.name}</div>
                        {piece.material && <div className="text-[9px] text-slate-500 font-mono leading-none">{piece.material}</div>}
                      </div>
                      <div className="col-span-4 text-right text-xs font-mono font-bold text-emerald-400">
                        {toFraction(piece.length)}"
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono italic">
                  <span>* Medidas finales aproximadas</span>
                  <button className="text-blue-500 hover:text-blue-400 font-bold uppercase tracking-widest">
                    Generar PDF
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Panel: Viewport */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Dimensions Bar */}
            <div className="flex gap-4">
              <MainDimension label="ANCHO" value={config.width} keyName="width" onUpdate={updateConfig} />
              <MainDimension label="ALTO" value={config.height} keyName="height" onUpdate={updateConfig} />
              <MainDimension label="SALIDA" value={config.depth} keyName="depth" onUpdate={updateConfig} />
            </div>

            <Cabinet3D config={config} />
          </div>
        </div>
      </main>

      <footer className="mt-12 py-12 border-t border-slate-800 bg-slate-900/30 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p className="font-bold tracking-tight uppercase">
            © 2026 <span className="text-[#b91c1c] italic">HARMONY</span> <span className="text-[#60a5fa] italic">GLASS</span> • Sistemas de Aluminio y Vidrio
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Documentación</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Términos</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Soporte Tecnico</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

