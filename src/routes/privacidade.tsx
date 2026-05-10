import { createFileRoute, Link } from '@tanstack/react-router'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/privacidade')({
  component: PrivacidadePage,
})

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col">
      {/* Minimal header */}
      <header className="px-5 md:px-12 py-5 flex items-center justify-between border-b border-black/5">
        <Link to="/" className="hover:opacity-70 transition-opacity">
          <Logo variant="primary" size="sm" />
        </Link>
        <Link
          to="/entrar"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Voltar ao login
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-8 py-12">
        <h1 className="font-headline font-black text-3xl md:text-4xl tracking-tight text-black mb-2">
          Política de Privacidade
        </h1>
        <p className="text-xs text-black/40 mb-10">Última atualização: abril de 2026</p>

        <div className="prose prose-sm max-w-none text-black/70 space-y-8 leading-relaxed">

          <section>
            <h2 className="font-bold text-base text-black mb-2">1. Introdução</h2>
            <p>
              Esta Política de Privacidade descreve como o Evolua ("nós", "nosso") coleta, usa,
              armazena e protege as informações pessoais dos Usuários e dos pacientes cujos dados
              são inseridos na plataforma, em conformidade com a Lei Geral de Proteção de Dados
              (LGPD – Lei nº 13.709/2018) e demais normas aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">2. Papéis no Tratamento de Dados</h2>
            <p>
              O <strong className="text-black">Usuário</strong> (fonoaudiólogo) é o{' '}
              <strong className="text-black">controlador</strong> dos dados de seus pacientes —
              determina as finalidades e os meios do tratamento. O{' '}
              <strong className="text-black">Evolua</strong> atua como{' '}
              <strong className="text-black">operador</strong> em relação a esses dados, processando-os
              apenas para prestar o Serviço conforme instrução do Usuário.
            </p>
            <p className="mt-2">
              Para os dados cadastrais do próprio Usuário (nome, e-mail, dados de pagamento), o
              Evolua atua como controlador.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">3. Dados que Coletamos</h2>
            <h3 className="font-semibold text-sm text-black mt-3 mb-1">3.1 Dados do Usuário (fonoaudiólogo)</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Nome completo, e-mail, senha (armazenada com hash bcrypt);</li>
              <li>Número de registro no CFFa;</li>
              <li>Dados de cobrança (processados pelo gateway de pagamento — não armazenamos o número completo do cartão);</li>
              <li>Dados de uso: logs de acesso, funcionalidades utilizadas, diagnósticos de erro.</li>
            </ul>
            <h3 className="font-semibold text-sm text-black mt-3 mb-1">3.2 Dados de Pacientes (inseridos pelo Usuário)</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Dados identificadores: nome, CPF, data de nascimento, contato;</li>
              <li>Dados de saúde: histórico clínico, prontuários, laudos, planos terapêuticos, evoluções de sessão;</li>
              <li>Dados sensíveis tratados sob base legal de saúde (art. 11, II, "f" da LGPD).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">4. Finalidades do Tratamento</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Prestação do Serviço de gestão clínica;</li>
              <li>Autenticação e segurança das contas;</li>
              <li>Cobrança e gestão de assinaturas;</li>
              <li>Suporte técnico ao Usuário;</li>
              <li>Melhoria e desenvolvimento do Serviço (dados anonimizados);</li>
              <li>Cumprimento de obrigações legais e regulatórias.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">5. Bases Legais</h2>
            <p>O tratamento de dados ocorre com base em:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong className="text-black">Execução de contrato</strong> — para prestação do Serviço (art. 7º, V);</li>
              <li><strong className="text-black">Legítimo interesse</strong> — para segurança, prevenção de fraudes e melhorias (art. 7º, IX);</li>
              <li><strong className="text-black">Cumprimento de obrigação legal</strong> — quando exigido por lei (art. 7º, II);</li>
              <li><strong className="text-black">Tutela da saúde</strong> — para dados sensíveis de pacientes (art. 11, II, "f").</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">6. Compartilhamento de Dados</h2>
            <p>Não vendemos nem alugamos dados pessoais. Podemos compartilhá-los com:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong className="text-black">Supabase</strong> — infraestrutura de banco de dados e autenticação (servidores na região sa-east-1, Brasil);</li>
              <li><strong className="text-black">Gateway de pagamento</strong> — apenas dados necessários à cobrança;</li>
              <li><strong className="text-black">Autoridades competentes</strong> — quando exigido por ordem judicial ou legal.</li>
            </ul>
            <p className="mt-2">
              Todos os suboperadores são contratados mediante cláusulas de proteção de dados
              equivalentes às desta Política.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">7. Retenção e Exclusão</h2>
            <p>
              Os dados são mantidos enquanto a conta estiver ativa. Após o encerramento, dados
              clínicos ficam disponíveis para exportação por 90 dias e são excluídos definitivamente
              em seguida, salvo obrigação legal de retenção. Dados de faturamento são mantidos
              por 5 anos conforme legislação fiscal.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">8. Segurança</h2>
            <p>Adotamos medidas técnicas e organizacionais para proteger os dados, incluindo:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Transmissão via TLS 1.2+ (HTTPS obrigatório);</li>
              <li>Banco de dados criptografado em repouso (AES-256);</li>
              <li>Row-Level Security (RLS) no banco — cada Usuário acessa apenas seus próprios dados;</li>
              <li>Autenticação multifator disponível;</li>
              <li>Auditorias de segurança periódicas.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">9. Seus Direitos (LGPD)</h2>
            <p>Como titular, você tem direito a:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Confirmar a existência de tratamento;</li>
              <li>Acessar seus dados;</li>
              <li>Corrigir dados incompletos ou desatualizados;</li>
              <li>Solicitar anonimização, bloqueio ou eliminação;</li>
              <li>Portabilidade dos dados;</li>
              <li>Revogar consentimento, quando aplicável;</li>
              <li>Peticionar à ANPD.</li>
            </ul>
            <p className="mt-2">
              Para exercer esses direitos, entre em contato pelo e-mail{' '}
              <a href="mailto:privacidade@evolua.app" className="underline hover:text-black">
                privacidade@evolua.app
              </a>
              . Responderemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">10. Cookies e Rastreamento</h2>
            <p>
              A plataforma utiliza apenas cookies estritamente necessários para autenticação e
              manutenção de sessão. Não utilizamos cookies de rastreamento publicitário nem
              compartilhamos dados com redes de anúncios.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">11. Encarregado de Dados (DPO)</h2>
            <p>
              Nosso encarregado de proteção de dados pode ser contatado em{' '}
              <a href="mailto:dpo@evolua.app" className="underline hover:text-black">
                dpo@evolua.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">12. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política periodicamente. Notificaremos por e-mail com
              antecedência mínima de 15 dias antes de alterações relevantes. O uso continuado
              após a vigência das alterações implica aceitação da nova Política.
            </p>
          </section>
        </div>

        {/* Back links */}
        <div className="mt-12 pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center gap-4 text-xs text-black/40">
          <Link to="/termos" className="underline hover:text-black transition-colors">
            Termos de Uso
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link to="/entrar" className="underline hover:text-black transition-colors">
            Voltar ao login
          </Link>
        </div>
      </main>
    </div>
  )
}
