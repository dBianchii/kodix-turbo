import Link from "next/link";
import { Button } from "@kodix/ui/button";
import { Card, CardContent } from "@kodix/ui/card";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        {/* Hero */}
        <section className="mb-20 text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
            Novo • Programa de Cashback para Pessoas e Empresas
          </span>
          <h1 className="mx-auto mt-4 max-w-4xl font-bold text-4xl text-foreground leading-tight md:text-5xl">
            Ganhe em cada compra. Fidelize a cada venda.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Kodix Cash conecta consumidores e empresas em um ecossistema de
            cashback simples, transparente e escalável.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link className="inline-flex items-center" href="#consumer">
                Para Pessoas
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link className="inline-flex items-center" href="#business">
                Para Empresas
                <Building2 className="ms-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 rounded-lg border bg-card p-4 text-card-foreground md:grid-cols-4">
            <div className="text-center">
              <p className="font-bold text-2xl">R$ 12Mi+</p>
              <p className="text-muted-foreground text-xs">Cashback gerado</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-2xl">500k+</p>
              <p className="text-muted-foreground text-xs">Transações</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-2xl">2k+</p>
              <p className="text-muted-foreground text-xs">
                Empresas parceiras
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold text-2xl">98%</p>
              <p className="text-muted-foreground text-xs">Satisfação</p>
            </div>
          </div>
        </section>

        {/* Consumer Section */}
        <section className="mb-20" id="consumer">
          <div className="mb-8 text-center">
            <h2 className="font-semibold text-3xl text-foreground">
              Para Pessoas: cashback sem fricção
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Compre normalmente, receba uma parte de volta e resgate quando
              quiser. Simples assim.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">1) Compre</h3>
                <p className="text-muted-foreground text-sm">
                  Use seus meios de pagamento favoritos em lojas parceiras.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">2) Receba automático</h3>
                <p className="text-muted-foreground text-sm">
                  O cashback cai direto no seu saldo. Sem cupons, sem dor de
                  cabeça.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">3) Resgate como preferir</h3>
                <p className="text-muted-foreground text-sm">
                  Use em novas compras, pague serviços ou transfira.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="default">
              <Link className="inline-flex items-center" href="#cta-consumer">
                Criar minha conta
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#faq">Como funciona?</Link>
            </Button>
          </div>
        </section>

        {/* Business Section */}
        <section className="mb-20" id="business">
          <div className="mb-8 text-center">
            <h2 className="font-semibold text-3xl text-foreground">
              Para Empresas: aumente receita e fidelização
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Implante um programa de cashback com regras flexíveis e
              acompanhamento em tempo real. Integração simples via API ou POS.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">Mais recorrência</h3>
                <p className="text-muted-foreground text-sm">
                  Clientes voltam mais, ticket médio sobe e CAC efetivo cai.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">Fluxo de caixa melhor</h3>
                <p className="text-muted-foreground text-sm">
                  Estímulo de retorno sem descontos à vista. Pague o cashback
                  depois do consumo.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">Regras flexíveis</h3>
                <p className="text-muted-foreground text-sm">
                  Defina percentuais, categorias, limites e campanhas por
                  período.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="default">
              <Link className="inline-flex items-center" href="#cta-business">
                Falar com vendas
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#faq">Ver integrações</Link>
            </Button>
          </div>
        </section>

        {/* Highlights */}
        <section className="mb-20">
          <div className="mb-8 text-center">
            <h2 className="font-semibold text-3xl text-foreground">
              Destaques da plataforma
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Tudo que você precisa para operar cashback com segurança e
              performance.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Segmentação</h3>
                <p className="text-muted-foreground text-sm">
                  Campanhas por perfil, região e comportamento.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Experiência simples</h3>
                <p className="text-muted-foreground text-sm">
                  Elegante para o usuário, limpa para o time.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Segurança</h3>
                <p className="text-muted-foreground text-sm">
                  Compliance, auditoria e antifraude embutidos.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <LineChart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  Painéis e métricas para decisões mais rápidas.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dual CTA */}
        <section className="mb-20" id="cta-consumer">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="mb-2 text-muted-foreground text-sm">
                  Pessoas
                </div>
                <h3 className="mb-2 font-semibold text-2xl">
                  Comece a ganhar hoje
                </h3>
                <ul className="mb-4 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Cadastro rápido
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Cashback automático em compras elegíveis
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Resgate flexível
                  </li>
                </ul>
                <Button asChild size="lg">
                  <Link className="inline-flex items-center" href="#consumer">
                    Criar conta grátis
                    <ArrowRight className="ms-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="p-6" id="cta-business">
              <CardContent className="p-0">
                <div className="mb-2 text-muted-foreground text-sm">
                  Empresas
                </div>
                <h3 className="mb-2 font-semibold text-2xl">
                  Implemente seu cashback
                </h3>
                <ul className="mb-4 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Integração via API ou POS
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Regras flexíveis e relatórios em tempo real
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Suporte dedicado
                  </li>
                </ul>
                <Button asChild size="lg" variant="outline">
                  <Link className="inline-flex items-center" href="#business">
                    Falar com vendas
                    <ArrowRight className="ms-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20" id="faq">
          <div className="mb-6 text-center">
            <h2 className="font-semibold text-3xl text-foreground">FAQ</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Respostas rápidas para as dúvidas mais comuns.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <CardContent className="p-0">
                <h3 className="mb-1 font-semibold">
                  Como recebo meu cashback?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Após uma compra elegível, o valor aparece no seu saldo. Você
                  pode usar em novas compras, pagar serviços ou transferir.
                </p>
              </CardContent>
            </Card>
            <Card className="p-5">
              <CardContent className="p-0">
                <h3 className="mb-1 font-semibold">
                  Quanto custa para empresas?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Planos sob demanda conforme volume de transações e recursos.
                  Fale com o time para uma proposta.
                </p>
              </CardContent>
            </Card>
            <Card className="p-5">
              <CardContent className="p-0">
                <h3 className="mb-1 font-semibold">Preciso de app?</h3>
                <p className="text-muted-foreground text-sm">
                  Você pode operar direto pelo navegador. Experiência mobile
                  otimizada.
                </p>
              </CardContent>
            </Card>
            <Card className="p-5">
              <CardContent className="p-0">
                <h3 className="mb-1 font-semibold">
                  Quais integrações existem?
                </h3>
                <p className="text-muted-foreground text-sm">
                  API REST, webhooks e integrações com parceiros de pagamento e
                  POS. Detalhes sob solicitação.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <h2 className="mx-auto mb-3 max-w-2xl font-semibold text-3xl text-foreground">
            Pronto para começar?
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Leva minutos para criar sua conta ou habilitar seu programa de
            cashback.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link className="inline-flex items-center" href="#consumer">
                Começar agora
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#business">Quero no meu negócio</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
