import { createFileRoute, Link } from '@tanstack/react-router'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/termos')({
  component: TermosPage,
})

function TermosPage() {
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
          Termos de Uso
        </h1>
        <p className="text-xs text-black/40 mb-10">Última atualização: abril de 2026</p>

        <div className="prose prose-sm max-w-none text-black/70 space-y-8 leading-relaxed">

          <section>
            <h2 className="font-bold text-base text-black mb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma Evolua ("Serviço"), você ("Usuário") concorda
              integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição aqui
              prevista, não utilize o Serviço.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">2. Descrição do Serviço</h2>
            <p>
              O Evolua é uma plataforma de gestão clínica desenvolvida exclusivamente para
              fonoaudiólogos registrados no Conselho Federal de Fonoaudiologia (CFFa). O Serviço
              oferece ferramentas para agenda, prontuários, planos terapêuticos, geração de laudos,
              comunicação com pacientes e gestão financeira.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">3. Elegibilidade</h2>
            <p>
              O Serviço destina-se exclusivamente a profissionais de fonoaudiologia habilitados.
              Ao criar uma conta, você declara possuir registro ativo no CFFa e capacidade jurídica
              plena para celebrar contratos. É vedado o uso por menores de 18 anos.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">4. Cadastro e Segurança da Conta</h2>
            <p>
              Você é responsável por manter a confidencialidade de suas credenciais de acesso.
              Qualquer atividade realizada em sua conta é de sua responsabilidade. Notifique-nos
              imediatamente em caso de uso não autorizado pelo e-mail{' '}
              <a href="mailto:suporte@evolua.app" className="underline hover:text-black">
                suporte@evolua.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">5. Dados de Pacientes e Sigilo Profissional</h2>
            <p>
              O Usuário é o controlador dos dados de seus pacientes inseridos na plataforma, nos
              termos da Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018) e do Código de
              Ética da Fonoaudiologia. O Evolua atua como operador e processa esses dados
              exclusivamente conforme instruções do Usuário e para a prestação do Serviço.
            </p>
            <p className="mt-2">
              O Usuário assume integral responsabilidade pelo cumprimento das obrigações legais e
              éticas relativas ao sigilo profissional e ao consentimento dos pacientes.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">6. Uso Permitido</h2>
            <p>É vedado ao Usuário:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Utilizar o Serviço para fins ilícitos ou contrários à ética profissional;</li>
              <li>Tentar acessar dados de outros usuários;</li>
              <li>Reproduzir, distribuir ou sublicenciar qualquer parte do Serviço;</li>
              <li>Realizar engenharia reversa ou extrair o código-fonte da plataforma;</li>
              <li>Inserir vírus, malware ou qualquer código malicioso.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">7. Planos e Pagamentos</h2>
            <p>
              O Serviço pode oferecer planos gratuitos e pagos. Os valores, periodicidade de
              cobrança e condições de cancelamento são descritos na página de planos. Não há
              reembolso proporcional por cancelamento antes do término do período contratado, salvo
              disposição legal em contrário.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">8. Disponibilidade e SLA</h2>
            <p>
              O Evolua empenha-se em manter o Serviço disponível 99,5% do tempo mensal, excluídas
              janelas de manutenção programada. Não garantimos disponibilidade ininterrupta e não
              nos responsabilizamos por indisponibilidades decorrentes de falhas em serviços de
              terceiros, força maior ou caso fortuito.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">9. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma — incluindo código, design, marcas, textos e
              funcionalidades — é de propriedade exclusiva do Evolua ou de seus licenciadores.
              Nenhuma disposição destes Termos transfere ao Usuário qualquer direito de propriedade
              intelectual sobre o Serviço.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">10. Limitação de Responsabilidade</h2>
            <p>
              Na máxima extensão permitida pela lei, o Evolua não se responsabiliza por danos
              indiretos, incidentais, especiais ou consequentes decorrentes do uso ou da
              impossibilidade de uso do Serviço. Nossa responsabilidade total não excederá o valor
              pago pelo Usuário nos últimos 3 (três) meses anteriores ao evento gerador do dano.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">11. Rescisão</h2>
            <p>
              Podemos suspender ou encerrar sua conta, a qualquer momento e sem aviso prévio, em
              caso de violação destes Termos. Você pode encerrar sua conta a qualquer momento pelas
              configurações da plataforma. Após o encerramento, seus dados clínicos estarão
              disponíveis para exportação por até 90 dias.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">12. Alterações nos Termos</h2>
            <p>
              Podemos revisar estes Termos periodicamente. Notificaremos o Usuário por e-mail ou
              por aviso na plataforma com antecedência mínima de 15 dias. O uso continuado após a
              vigência das alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">13. Lei Aplicável e Foro</h2>
            <p>
              Estes Termos regem-se pela legislação brasileira. Fica eleito o foro da Comarca de
              São Paulo/SP para dirimir quaisquer controvérsias, com renúncia expressa a qualquer
              outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base text-black mb-2">14. Contato</h2>
            <p>
              Dúvidas sobre estes Termos podem ser enviadas para{' '}
              <a href="mailto:juridico@evolua.app" className="underline hover:text-black">
                juridico@evolua.app
              </a>
              .
            </p>
          </section>
        </div>

        {/* Back links */}
        <div className="mt-12 pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center gap-4 text-xs text-black/40">
          <Link to="/privacidade" className="underline hover:text-black transition-colors">
            Política de Privacidade
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
