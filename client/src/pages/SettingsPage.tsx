import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings, Save, Check, QrCode, Phone, Building2, ShieldCheck } from 'lucide-react';

interface SettingsPageProps {
  onSettingsSaved?: () => void;
}

export const SettingsPage = ({ onSettingsSaved }: SettingsPageProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    provider_name: '',
    provider_specialty: '',
    provider_phone: '',
    provider_email: '',
    provider_address: '',
    pix_key: '',
    pix_name: '',
    pix_city: '',
    default_deposit_percent: '50',
    default_validity_days: '7',
    default_warranty: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await api.getSettings();
        setFormData((prev) => ({
          ...prev,
          ...data
        }));
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateSettings(formData);
      setSuccessMsg('Configurações salvas com sucesso!');
      if (onSettingsSaved) onSettingsSaved();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16 text-slate-500 text-xs">
        Carregando dados do prestador...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-400" />
          <span>Configurações do Prestador & Chave PIX</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Personalize a identidade da sua empresa, chave PIX para recebimento de sinais e garantias padrão.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identificação da Empresa */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>Dados da Sua Empresa ou Nome Profissional</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Nome Profissional / Empresa
              </label>
              <input
                type="text"
                name="provider_name"
                value={formData.provider_name}
                onChange={handleChange}
                placeholder="Ex: Roviro Marcenaria & Design"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Especialidade / Ramo de Atuação
              </label>
              <input
                type="text"
                name="provider_specialty"
                value={formData.provider_specialty}
                onChange={handleChange}
                placeholder="Ex: Móveis Planejados & Reformas"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                WhatsApp de Contato (DDI + DDD + Número)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="provider_phone"
                  value={formData.provider_phone}
                  onChange={handleChange}
                  placeholder="5511986531134"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Email de Atendimento
              </label>
              <input
                type="email"
                name="provider_email"
                value={formData.provider_email}
                onChange={handleChange}
                placeholder="contato@roviro.com.br"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Cidade e Estado de Atendimento
              </label>
              <input
                type="text"
                name="provider_address"
                value={formData.provider_address}
                onChange={handleChange}
                placeholder="São Paulo - SP (Atendimento Grande SP e Interior)"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* PIX do Sinal */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Configurações do PIX para Recebimento do Sinal</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Chave PIX (CPF, CNPJ, Email ou Celular)
              </label>
              <input
                type="text"
                name="pix_key"
                value={formData.pix_key}
                onChange={handleChange}
                placeholder="roviro221@gmail.com"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Nome do Titular da Conta
              </label>
              <input
                type="text"
                name="pix_name"
                value={formData.pix_name}
                onChange={handleChange}
                placeholder="Roviro Solucoes"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Cidade da Conta Bancária
              </label>
              <input
                type="text"
                name="pix_city"
                value={formData.pix_city}
                onChange={handleChange}
                placeholder="SAO PAULO"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Padrões & Garantia */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Padrões de Proposta & Termos de Garantia</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Percentual de Sinal Padrão (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                name="default_deposit_percent"
                value={formData.default_deposit_percent}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Validade Padrão das Propostas (Dias)
              </label>
              <input
                type="number"
                min="1"
                name="default_validity_days"
                value={formData.default_validity_days}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Texto do Termo de Garantia Padrão
              </label>
              <textarea
                name="default_warranty"
                value={formData.default_warranty}
                onChange={handleChange}
                rows={3}
                placeholder="Descreva as condições de garantia oferecidas..."
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Feedback & Submit */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
