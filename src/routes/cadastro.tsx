import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/cadastro')({
  component: CadastroPage,
})

// ─── tipos ────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 — Conta
  email: string
  senha: string
  confirmarSenha: string
  // Step 2 — Você
  nome: string
  crfa: string
  estado: string
  especialidades: string[]
  telefone: string
  // Step 3 — Clínica
  nomeClinica: string
  tipoClinica: string
  cidade: string
  uf: string
  pacientesMes: string
  comoConheceu: string
  lgpd: boolean
}

const initialData: FormData = {
  email: '',
  senha: '',
  confirmarSenha: '',
  nome: '',
  crfa: '',
  estado: '',
  especialidades: [],
  telefone: '',
  nomeClinica: '',
  tipoClinica: '',
  cidade: '',
  uf: '',
  pacientesMes: '',
  comoConheceu: '',
  lgpd: false,
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const ESPECIALIDADES = [
  'Voz',
  'Disfagia',
  'Linguagem Infantil',
  'Linguagem Adulto',
  'Motricidade Orofacial',
  'Fluência',
  'Audição / Audiologia',
  'Neurologia',
  'Gerontologia',
]

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
]

function senhaForte(senha: string) {
  return {
    comprimento: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    numero: /[0-9]/.test(senha),
  }
}

function forcaTotal(senha: string) {
  const r = senhaForte(senha)
  return Object.values(r).filter(Boolean).length
}

// ─── sub-componentes ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant block mb-2">
      {children}
    </label>
  )
}

function InputField({
  id, type = 'text', placeholder, value, onChange, error, autoComplete, suffix,
}: {
  id: string; type?: string; placeholder?: string; value: string
  onChange: (v: string) => void; error?: string; autoComplete?: string
  suffix?: React.ReactNode
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`w-full px-4 py-3.5 border-2 bg-surface text-text-primary font-body text-sm focus:outline-none transition-colors ${
          error ? 'border-error focus:border-error' : 'border-border focus:border-primary'
        } ${suffix ? 'pr-12' : ''}`}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
      {error && <p role="alert" className="mt-1 text-xs text-error font-medium">{error}</p>}
    </div>
  )
}

// ─── steps ────────────────────────────────────────────────────────────────────

function Step1({
  data, setData, onNext, onGoogle,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void
  onNext: () => void; onGoogle: () => void
}) {
  const [senhaVis, setSenhaVis] = useState(false)
  const [confirmVis, setConfirmVis] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  const forca = senhaForte(data.senha)
  const nivel = forcaTotal(data.senha)

  function validate() {
    const e: typeof errors = {}
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Email inválido.'
    // Validação de senha — primeiro erro identificado prevalece (não sobrescreve cascata)
    if (data.senha.length < 8) e.senha = 'Mínimo 8 caracteres.'
    else if (!/[A-Z]/.test(data.senha)) e.senha = 'A senha deve conter ao menos uma letra maiúscula.'
    else if (!/[0-9]/.test(data.senha)) e.senha = 'A senha deve conter ao menos um número.'
    if (data.senha !== data.confirmarSenha) e.confirmarSenha = 'As senhas não coincidem.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onGoogle}
        className="w-full flex items-center justify-center gap-3 border-2 border-border hover:border-border-bright bg-surface hover:bg-surface-low py-3.5 transition-all duration-200 group"
      >
        <GoogleIcon />
        <span className="font-headline font-bold text-xs uppercase tracking-wide text-text-primary">
          Cadastrar com Google
        </span>
      </button>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-outline-variant" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">ou com email</span>
        <div className="flex-1 h-px bg-outline-variant" />
      </div>

      <div>
        <Label htmlFor="email">Email profissional *</Label>
        <InputField
          id="email"
          type="email"
          autoComplete="email"
          placeholder="dra.maria@email.com.br"
          value={data.email}
          onChange={(v) => setData({ email: v })}
          error={errors.email}
        />
      </div>

      <div>
        <Label htmlFor="senha">Senha *</Label>
        <InputField
          id="senha"
          type={senhaVis ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          value={data.senha}
          onChange={(v) => setData({ senha: v })}
          error={errors.senha}
          suffix={
            <button type="button" onClick={() => setSenhaVis(!senhaVis)} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-lg">{senhaVis ? 'visibility_off' : 'visibility'}</span>
            </button>
          }
        />
        {data.senha.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 transition-colors duration-300 ${
                    nivel >= i
                      ? i === 1 ? 'bg-error' : i === 2 ? 'bg-yellow-400' : 'bg-primary'
                      : 'bg-outline-variant'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { ok: forca.comprimento, label: '8+ caracteres' },
                { ok: forca.maiuscula, label: 'Maiúscula' },
                { ok: forca.numero, label: 'Número' },
              ].map(({ ok, label }) => (
                <span key={label} className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${ok ? 'text-primary' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[12px]">{ok ? 'check_circle' : 'radio_button_unchecked'}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
        <InputField
          id="confirmarSenha"
          type={confirmVis ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          value={data.confirmarSenha}
          onChange={(v) => setData({ confirmarSenha: v })}
          error={errors.confirmarSenha}
          suffix={
            <button type="button" onClick={() => setConfirmVis(!confirmVis)} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-lg">{confirmVis ? 'visibility_off' : 'visibility'}</span>
            </button>
          }
        />
      </div>

      <button
        type="button"
        onClick={() => { if (validate()) onNext() }}
        className="w-full bg-dark text-neon py-4 btn-text text-sm hover:bg-ink transition-all duration-300 mt-2"
      >
        Continuar
      </button>
    </div>
  )
}

function Step2({
  data, setData, onNext, onBack,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void
  onNext: () => void; onBack: () => void
}) {
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  function toggleEspec(e: string) {
    const atual = data.especialidades
    setData({
      especialidades: atual.includes(e) ? atual.filter((x) => x !== e) : [...atual, e],
    })
  }

  function validate() {
    const e: typeof errors = {}
    if (data.nome.trim().length < 2) e.nome = 'Nome obrigatório.'
    if (!data.telefone || data.telefone.replace(/\D/g, '').length < 10) e.telefone = 'WhatsApp inválido.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="nome">Nome completo *</Label>
        <InputField
          id="nome"
          autoComplete="name"
          placeholder="Dra. Maria Silva"
          value={data.nome}
          onChange={(v) => setData({ nome: v })}
          error={errors.nome}
        />
      </div>

      <div>
        <Label htmlFor="telefone">WhatsApp *</Label>
        <InputField
          id="telefone"
          type="tel"
          autoComplete="tel"
          placeholder="(11) 99999-9999"
          value={data.telefone}
          onChange={(v) => setData({ telefone: v })}
          error={errors.telefone}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="crfa">Nº CRFa</Label>
          <InputField
            id="crfa"
            placeholder="CRFa 2-12345"
            value={data.crfa}
            onChange={(v) => setData({ crfa: v })}
          />
        </div>
        <div>
          <Label htmlFor="estadoCrfa">Estado do CRFa</Label>
          <select
            id="estadoCrfa"
            value={data.estado}
            onChange={(e) => setData({ estado: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-border bg-surface text-text-primary font-body text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
          >
            <option value="">UF</option>
            {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label>Especialidades (selecione todas que se aplicam)</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {ESPECIALIDADES.map((esp) => {
            const ativo = data.especialidades.includes(esp)
            return (
              <button
                key={esp}
                type="button"
                onClick={() => toggleEspec(esp)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide border-2 transition-all duration-150 ${
                  ativo
                    ? 'border-primary bg-primary-container text-on-primary-fixed'
                    : 'border-border bg-surface text-text-secondary hover:border-primary/50'
                }`}
              >
                {esp}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border-2 border-text-primary text-text-primary py-4 btn-text text-sm hover:bg-surface-low transition-all duration-200"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={() => { if (validate()) onNext() }}
          className="flex-[2] bg-dark text-neon py-4 btn-text text-sm hover:bg-ink transition-all duration-300"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

function Step3({
  data, setData, onNext, onBack, loading, erroGlobal,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void
  onNext: () => void; onBack: () => void; loading: boolean; erroGlobal: string
}) {
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  function validate() {
    const e: typeof errors = {}
    if (!data.lgpd) e.lgpd = 'Você precisa aceitar a política de privacidade.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="nomeClinica">Nome da clínica / consultório</Label>
        <InputField
          id="nomeClinica"
          placeholder="Clínica Fono Bem Estar"
          value={data.nomeClinica}
          onChange={(v) => setData({ nomeClinica: v })}
        />
      </div>

      <div>
        <Label htmlFor="tipoClinica">Tipo de atendimento</Label>
        <select
          id="tipoClinica"
          value={data.tipoClinica}
          onChange={(e) => setData({ tipoClinica: e.target.value })}
          className="w-full px-4 py-3.5 border-2 border-border bg-surface text-text-primary font-body text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
        >
          <option value="">Selecione...</option>
          <option value="autonoma">Autônoma (clínica solo)</option>
          <option value="clinica-pequena">Clínica pequena (2–5 profissionais)</option>
          <option value="clinica-media">Clínica média (6–15 profissionais)</option>
          <option value="clinica-grande">Clínica grande (16+)</option>
          <option value="hospital">Hospital / Instituição</option>
          <option value="escola">Escola / Educação</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Label htmlFor="cidade">Cidade</Label>
          <InputField
            id="cidade"
            placeholder="São Paulo"
            value={data.cidade}
            onChange={(v) => setData({ cidade: v })}
          />
        </div>
        <div>
          <Label htmlFor="uf">UF</Label>
          <select
            id="uf"
            value={data.uf}
            onChange={(e) => setData({ uf: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-border bg-surface text-text-primary font-body text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
          >
            <option value="">--</option>
            {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="pacientesMes">Pacientes atendidos por mês (aprox.)</Label>
        <select
          id="pacientesMes"
          value={data.pacientesMes}
          onChange={(e) => setData({ pacientesMes: e.target.value })}
          className="w-full px-4 py-3.5 border-2 border-border bg-surface text-text-primary font-body text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
        >
          <option value="">Selecione...</option>
          <option value="1-20">1 a 20 pacientes</option>
          <option value="21-50">21 a 50 pacientes</option>
          <option value="51-100">51 a 100 pacientes</option>
          <option value="100+">Mais de 100 pacientes</option>
        </select>
      </div>

      <div>
        <Label htmlFor="comoConheceu">Como conheceu o Evolua?</Label>
        <select
          id="comoConheceu"
          value={data.comoConheceu}
          onChange={(e) => setData({ comoConheceu: e.target.value })}
          className="w-full px-4 py-3.5 border-2 border-border bg-surface text-text-primary font-body text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
        >
          <option value="">Selecione...</option>
          <option value="instagram">Instagram</option>
          <option value="indicacao">Indicação de colega</option>
          <option value="google">Google</option>
          <option value="youtube">YouTube</option>
          <option value="evento">Evento / Congresso</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      {/* LGPD */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={data.lgpd}
          onChange={(e) => setData({ lgpd: e.target.checked })}
          className="mt-0.5 shrink-0 w-4 h-4 border-2 border-border accent-primary"
        />
        <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors leading-relaxed">
          Concordo com o tratamento dos meus dados pessoais conforme a{' '}
          <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
            Política de Privacidade
          </a>{' '}
          do Evolua, de acordo com a LGPD. *
        </span>
      </label>
      {errors.lgpd && <p role="alert" className="text-xs text-error font-medium -mt-3">{errors.lgpd}</p>}

      {erroGlobal && (
        <div role="alert" className="flex items-center gap-2 p-3 bg-error-container border border-error/20 text-on-error-container text-xs font-medium">
          <span className="material-symbols-outlined text-base text-error shrink-0">error</span>
          {erroGlobal}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border-2 border-text-primary text-text-primary py-4 btn-text text-sm hover:bg-surface-low transition-all duration-200"
          disabled={loading}
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={() => { if (validate()) onNext() }}
          disabled={loading}
          className="flex-[2] bg-dark text-neon py-4 btn-text text-sm hover:bg-ink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-neon/30 border-t-neon rounded-full animate-spin" />
              Criando conta...
            </span>
          ) : (
            'Criar minha conta grátis'
          )}
        </button>
      </div>
    </div>
  )
}

function StepSucesso({ nome }: { nome: string }) {
  const navigate = useNavigate()
  const primeiroNome = nome.split(' ')[0] || 'Doutora'
  return (
    <div className="text-center py-4 space-y-6">
      <div className="w-16 h-16 bg-dark flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-3xl text-neon">check</span>
      </div>
      <div>
        <h2 className="font-headline font-black text-3xl uppercase tracking-tighter leading-[0.9] mb-3">
          Bem-vinda,<br />{primeiroNome}<span className="text-primary">!</span>
        </h2>
        <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs mx-auto">
          Sua conta foi criada. Você tem <strong className="text-on-surface">14 dias grátis</strong> com o sistema inteiro desbloqueado.
        </p>
      </div>
      <div className="bg-surface-low border border-border p-5 text-left space-y-3">
        {[
          { icon: 'mail', text: 'Confirmação enviada para seu email' },
          { icon: 'description', text: 'Prontuário e protocolos prontos para usar' },
          { icon: 'psychology', text: 'IA de sessão ativada — é só gravar' },
          { icon: 'support_agent', text: 'Onboarding guiado no primeiro acesso' },
        ].map(({ icon, text }) => (
          <div key={icon} className="flex items-center gap-3">
            <div className="w-7 h-7 bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
            </div>
            <span className="text-sm text-on-surface-variant">{text}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => navigate({ to: '/dashboard' })}
        className="w-full bg-dark text-neon py-4 btn-text text-sm hover:bg-ink transition-all duration-300 text-center"
      >
        Acessar minha conta agora
      </button>
    </div>
  )
}

// ─── stepper bar ──────────────────────────────────────────────────────────────

const STEPS = [
  { numero: '01', label: 'Conta' },
  { numero: '02', label: 'Você' },
  { numero: '03', label: 'Clínica' },
]

function StepBar({ atual }: { atual: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const feito = i < atual
        const ativo = i === atual
        return (
          <div key={s.numero} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 shrink-0 transition-all duration-300 ${ativo ? 'opacity-100' : feito ? 'opacity-60' : 'opacity-30'}`}>
              <div className={`w-6 h-6 flex items-center justify-center transition-colors duration-300 ${feito ? 'bg-primary' : ativo ? 'bg-dark' : 'bg-border'}`}>
                {feito ? (
                  <span className="material-symbols-outlined text-white text-[13px]">check</span>
                ) : (
                  <span className={`font-headline font-black text-[10px] ${ativo ? 'text-neon' : 'text-text-tertiary'}`}>{s.numero}</span>
                )}
              </div>
              <span className={`font-label text-[10px] font-bold uppercase tracking-widest hidden sm:block ${ativo ? 'text-text-primary' : 'text-text-tertiary'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-colors duration-300 ${feito ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── painel esquerdo (progressivo) ───────────────────────────────────────────

const SIDE_CONTENT = [
  {
    tag: 'Passo 1 de 3',
    titulo: 'Crie sua\nconta segura',
    desc: 'Seus dados são protegidos com criptografia de ponta a ponta. Conformidade total com a LGPD.',
    detalhe: { icon: 'lock', texto: 'Dados criptografados e armazenados no Brasil' },
  },
  {
    tag: 'Passo 2 de 3',
    titulo: 'Conta pra gente\nsobre você',
    desc: 'Personalizamos o sistema com os protocolos certos para a sua especialidade desde o primeiro acesso.',
    detalhe: { icon: 'psychology', texto: 'IA calibrada para sua área de atuação' },
  },
  {
    tag: 'Passo 3 de 3',
    titulo: 'Quase lá.\nSua clínica.',
    desc: 'Último passo. Com essas informações, seu onboarding será personalizado para o porte da sua clínica.',
    detalhe: { icon: 'rocket_launch', texto: '14 dias grátis, sistema inteiro desbloqueado' },
  },
]

function SidePainel({ step }: { step: number }) {
  const c = SIDE_CONTENT[Math.min(step, 2)]
  return (
    <div className="hidden md:flex md:w-[45%] lg:w-[42%] bg-dark text-white flex-col justify-between p-12 lg:p-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-neon/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10">
        <span className="font-label text-[9px] font-bold tracking-[0.4em] uppercase text-neon/60 block mb-10 transition-all duration-300">
          {c.tag}
        </span>
        <h2 className="font-headline font-black text-4xl lg:text-5xl xl:text-6xl uppercase tracking-tighter leading-[0.88] mb-6 whitespace-pre-line">
          {c.titulo}<span className="text-neon">.</span>
        </h2>
        <p className="text-white/70 text-base leading-relaxed max-w-xs">
          {c.desc}
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-4 border border-white/10 p-5 bg-white/5">
        <div className="w-10 h-10 bg-neon/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-neon text-xl">{c.detalhe.icon}</span>
        </div>
        <p className="text-white/85 text-sm leading-snug">{c.detalhe.texto}</p>
      </div>

      <div className="relative z-10 flex flex-wrap gap-3 mt-6">
        {['14 dias grátis', 'Sem cartão', 'Cancela fácil'].map((b) => (
          <span key={b} className="border border-white/10 text-white/65 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5">
            {b}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── página principal ─────────────────────────────────────────────────────────

function CadastroPage() {
  const [step, setStep] = useState(0)
  const [data, setDataState] = useState<FormData>(initialData)
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erroGlobal, setErroGlobal] = useState('')

  function setData(partial: Partial<FormData>) {
    setDataState((prev) => ({ ...prev, ...partial }))
  }

  async function submit() {
    setLoading(true)
    setErroGlobal('')
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          data: {
            nome: data.nome,
            telefone: data.telefone,
            crfa: data.crfa,
            estado_crfa: data.estado,
            especialidades: data.especialidades,
            nome_clinica: data.nomeClinica,
            tipo_clinica: data.tipoClinica,
            cidade: data.cidade,
            uf: data.uf,
            pacientes_mes: data.pacientesMes,
            como_conheceu: data.comoConheceu,
          },
        },
      })
      if (error) throw error
      setSucesso(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.'
      setErroGlobal(msg)
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = [
    'Criar conta',
    'Sobre você',
    'Sua clínica',
  ]

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Minimal header */}
      <header className="px-5 md:px-12 py-5 flex items-center justify-between border-b border-border-soft">
        <Link to="/" className="hover:opacity-70 transition-opacity">
          <Logo variant="primary" size="sm" />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Voltar ao site
        </Link>
      </header>

      <main className="flex-1 flex flex-col md:flex-row">
        <SidePainel step={step} />

        <div className="flex-1 flex items-start md:items-center justify-center p-6 md:p-12 lg:p-16 overflow-y-auto">
          <div className="w-full max-w-sm py-6 md:py-0">

            {sucesso ? (
              <StepSucesso nome={data.nome} />
            ) : (
              <>
                <div className="mb-8">
                  <StepBar atual={step} />
                  <h1 className="font-headline font-black text-3xl uppercase tracking-tighter leading-[0.9] mb-1.5">
                    {stepTitles[step]}
                  </h1>
                  {step === 0 && (
                    <p className="text-on-surface-variant text-sm">
                      Já tem uma conta?{' '}
                      <Link to="/entrar" className="text-primary font-bold hover:underline">
                        Entrar
                      </Link>
                    </p>
                  )}
                </div>

                {step === 0 && (
                  <Step1
                    data={data}
                    setData={setData}
                    onNext={() => setStep(1)}
                    onGoogle={() => { /* TODO: Google OAuth */ }}
                  />
                )}
                {step === 1 && (
                  <Step2
                    data={data}
                    setData={setData}
                    onNext={() => setStep(2)}
                    onBack={() => setStep(0)}
                  />
                )}
                {step === 2 && (
                  <Step3
                    data={data}
                    setData={setData}
                    onNext={submit}
                    onBack={() => setStep(1)}
                    loading={loading}
                    erroGlobal={erroGlobal}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
