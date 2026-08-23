import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Wallet, ArrowRight, ArrowLeft, Check,
  Car, Laptop, Palette, Code, Camera, Dumbbell, Scissors, Sparkles,
  Heart, Scale, Calculator, BookOpen, Stethoscope, Activity,
  ShoppingBag, Truck, ChefHat, Zap, Droplets, Hammer,
  Flower2, Brain, Apple, Ruler, Globe, Target, MessageCircle, Briefcase
} from 'lucide-react';

const iconMap: Record<string, any> = {
  car: Car, laptop: Laptop, palette: Palette, code: Code,
  camera: Camera, dumbbell: Dumbbell, scissors: Scissors, sparkles: Sparkles,
  heart: Heart, scale: Scale, calculator: Calculator, book: BookOpen,
  stethoscope: Stethoscope, activity: Activity, 'shopping-bag': ShoppingBag,
  truck: Truck, 'chef-hat': ChefHat, zap: Zap, droplets: Droplets,
  hammer: Hammer, flower: Flower2, brain: Brain, apple: Apple,
  ruler: Ruler, globe: Globe, target: Target, 'message-circle': MessageCircle,
  briefcase: Briefcase,
};

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [segmentId, setSegmentId] = useState('');
  const [gender, setGender] = useState('');
  const [workDays, setWorkDays] = useState(22);
  const [workHours, setWorkHours] = useState(8);
  const [weekendWork, setWeekendWork] = useState('none');
  const { segments, fetchSegments, completeOnboarding } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleComplete = async () => {
    await completeOnboarding({
      segmentId,
      gender,
      workDaysPerMonth: workDays,
      workHoursPerDay: workHours,
      weekendWork,
    });
    navigate('/');
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        {step > 0 && step < totalSteps - 1 && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Passo {step} de {totalSteps - 2}</span>
              <span>{Math.round((step / (totalSteps - 2)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${(step / (totalSteps - 2)) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Wallet size={40} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Bem-vindo!</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Vamos configurar seu perfil financeiro para oferecer a melhor experiencia.
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="btn-primary flex items-center gap-2 mx-auto px-8 py-3 text-lg"
              >
                Comecar
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* Step 1: Segment selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Qual seu segmento?</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Selecione a area que melhor te representa</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {segments.map((segment) => {
                  const Icon = iconMap[segment.icon] || Briefcase;
                  return (
                    <button
                      key={segment.id}
                      onClick={() => setSegmentId(segment.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        segmentId === segment.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon size={24} className="text-primary mb-2" />
                      <p className="font-medium text-gray-900 dark:text-gray-100">{segment.name}</p>
                    </button>
                  );
                })}
              </div>
              {segments.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400">Carregando segmentos...</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Voltar
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!segmentId}
                  className="btn-primary flex items-center gap-2 flex-1 disabled:opacity-50"
                >
                  Proximo
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Gender */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sobre voce</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Selecione o seu genero para continuar</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    value: 'masculino',
                    label: 'Masculino',
                    symbol: '\u2642',
                    grad: 'from-blue-500/20 to-blue-500/5',
                    accent: 'text-blue-600 dark:text-blue-400',
                  },
                  {
                    value: 'feminino',
                    label: 'Feminino',
                    symbol: '\u2640',
                    grad: 'from-pink-500/20 to-pink-500/5',
                    accent: 'text-pink-600 dark:text-pink-400',
                  },
                ].map((g) => {
                  const selected = gender === g.value;
                  return (
                    <button
                      key={g.value}
                      onClick={() => setGender(g.value)}
                      className={`relative p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                        selected
                          ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                      }`}
                    >
                      {selected && (
                        <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                      <span
                        className={`w-20 h-20 rounded-full bg-gradient-to-br ${g.grad} flex items-center justify-center text-5xl leading-none ${g.accent}`}
                      >
                        {g.symbol}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{g.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!gender}
                  className="btn-primary flex items-center gap-2 flex-1 disabled:opacity-50"
                >
                  Proximo
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Work configuration */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuracao de trabalho</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Nos ajude a entender sua rotina</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label">
                    Dias por mes: <span className="text-primary font-bold">{workDays}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="31"
                    value={workDays}
                    onChange={(e) => setWorkDays(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>1</span>
                    <span>31</span>
                  </div>
                </div>

                <div>
                  <label className="label">
                    Horas por dia: <span className="text-primary font-bold">{workHours}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={workHours}
                    onChange={(e) => setWorkHours(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>1h</span>
                    <span>24h</span>
                  </div>
                </div>

                <div>
                  <label className="label">Trabalha no fim de semana?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'none', label: 'Nao' },
                      { value: 'partial', label: 'As vezes' },
                      { value: 'full', label: 'Sim' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setWeekendWork(opt.value)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          weekendWork === opt.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Voltar
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="btn-primary flex items-center gap-2 flex-1"
                >
                  Proximo
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Completion */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-success/10 rounded-2xl flex items-center justify-center mx-auto">
                <Check size={40} className="text-success" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tudo pronto!</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Seu perfil foi configurado com sucesso. Vamos para o painel!
                </p>
              </div>
              <button
                onClick={handleComplete}
                className="btn-primary flex items-center gap-2 mx-auto px-8 py-3 text-lg"
              >
                Ir para o painel
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
