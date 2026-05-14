import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Settings, 
  Maximize2,
  Minimize2,
  Layout
} from 'lucide-react';
import Cabinet3D from './components/Cabinet3D';
import { CabinetConfig } from './types';

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

export default function App() {
  const [config, setConfig] = useState<CabinetConfig>({
    width: 24,
    height: 30,
    depth: 24,
    thickness: 0.75,
    gap: 0.125,
    numDoors: 2,
    showDoors: false
  });

  const updateConfig = (key: keyof CabinetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-bottom border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Box className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase">Harmony <span className="text-blue-500">Glass</span></h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Sistemas de Aluminio y Vidrio</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
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
              <div className="flex items-center gap-2 mb-6 text-slate-400 font-mono text-xs uppercase tracking-widest text-blue-500">
                <Settings size={14} />
                Estructura
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-500 uppercase">GROSOR PERFIL</label>
                    <GenericNumberInput 
                      step={0.125}
                      min={0.125}
                      value={config.thickness}
                      onChange={(val) => updateConfig('thickness', val)}
                      className="bg-transparent text-right text-blue-400 font-mono text-xs focus:outline-none w-20"
                    />
                  </div>
                  <input 
                    type="range" min="0.125" max="20" step="0.125"
                    value={config.thickness}
                    onChange={(e) => updateConfig('thickness', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </section>

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
          <p>© 2026 HARMONY GLASS • Sistemas de Aluminio y Vidrio</p>
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

