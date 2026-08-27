import Sidebar from "@/components/Sidebar";
import WovenRibbon from "@/components/WovenRibbon";
import DashboardHeader from "@/components/DashboardHeader";
import SearchBar from "@/components/SearchBar";
import HeroArticle from "@/components/HeroArticle";
import RelevanceTabs from "@/components/RelevanceTabs";
import NewsSection from "@/components/NewsSection";
import FloatingAIButton from "@/components/FloatingAIButton";
import Footer from "@/components/Footer";
import type { NewsItem } from "@/components/NewsCard";

const EDUCACAO: NewsItem[] = [
  { eyebrow: "Ensino superior", title: "Universidades federais ampliam vagas para o próximo semestre", gradient: "bg-linear-to-br from-amber-200 to-brasil-gold" },
  { eyebrow: "Educação básica", title: "Prefeituras discutem reforma na grade curricular do ensino médio", gradient: "bg-linear-to-br from-brasil-blue to-blue-400" },
  { eyebrow: "Trabalho", title: "Debate sobre jornada 6x1 avança em comissão especial", gradient: "bg-linear-to-br from-rose-300 to-brick" },
  { eyebrow: "Direitos trabalhistas", title: "Sindicatos se reúnem para discutir escala de trabalho", gradient: "bg-linear-to-br from-brasil-green to-emerald-400" },
];

const SAUDE: NewsItem[] = [
  { eyebrow: "Rede pública", title: "Novas UPAs devem entrar em funcionamento até o fim do ano", gradient: "bg-linear-to-br from-emerald-300 to-brasil-green" },
  { eyebrow: "Saúde mental", title: "Casos de síndrome de burnout crescem entre profissionais da linha de frente", gradient: "bg-linear-to-br from-stone-300 to-stone-500" },
  { eyebrow: "Política econômica", title: "Governo discute reajuste de investimentos no setor de saúde", gradient: "bg-linear-to-br from-brasil-gold to-amber-400" },
  { eyebrow: "Saúde pública", title: "Campanha de vacinação é ampliada em unidades básicas", gradient: "bg-linear-to-br from-blue-300 to-brasil-blue" },
];

const DIREITOS_TRABALHISTAS: NewsItem[] = [
  { eyebrow: "Reforma", title: "Comissão especial discute mudanças na escala 6x1", gradient: "bg-linear-to-br from-rose-300 to-brick" },
  { eyebrow: "Sindicatos", title: "Categorias se mobilizam por reajuste salarial em 2026", gradient: "bg-linear-to-br from-brasil-green to-emerald-400" },
  { eyebrow: "Trabalho remoto", title: "Projeto de lei regulamenta home office no setor privado", gradient: "bg-linear-to-br from-brasil-blue to-blue-400" },
  { eyebrow: "Previdência", title: "Novo cálculo de aposentadoria gera debate no Congresso", gradient: "bg-linear-to-br from-amber-200 to-brasil-gold" },
];

const ECONOMIA: NewsItem[] = [
  { eyebrow: "Mercado", title: "Banco Central mantém taxa de juros em nova reunião", gradient: "bg-linear-to-br from-brasil-blue to-blue-400" },
  { eyebrow: "Emprego", title: "Taxa de desemprego recua pelo terceiro trimestre seguido", gradient: "bg-linear-to-br from-brasil-green to-emerald-400" },
  { eyebrow: "Inflação", title: "Preços de alimentos pressionam índice em agosto", gradient: "bg-linear-to-br from-rose-300 to-brick" },
  { eyebrow: "Câmbio", title: "Dólar recua com fluxo positivo de investimentos estrangeiros", gradient: "bg-linear-to-br from-amber-200 to-brasil-gold" },
];

const SEGURANCA_PUBLICA: NewsItem[] = [
  { eyebrow: "Estatísticas", title: "Índices de violência caem em capitais nordestinas", gradient: "bg-linear-to-br from-stone-300 to-stone-500" },
  { eyebrow: "Policiamento", title: "Governo anuncia novo plano de segurança nas fronteiras", gradient: "bg-linear-to-br from-brasil-blue to-blue-400" },
  { eyebrow: "Legislação", title: "Câmara vota projeto que endurece penas para facções", gradient: "bg-linear-to-br from-brick to-rose-300" },
  { eyebrow: "Tecnologia", title: "Cidades expandem uso de câmeras com reconhecimento facial", gradient: "bg-linear-to-br from-brasil-green-deep to-brasil-green" },
];

const MEIO_AMBIENTE: NewsItem[] = [
  { eyebrow: "Amazônia", title: "Desmatamento tem queda no último trimestre, aponta relatório", gradient: "bg-linear-to-br from-emerald-300 to-brasil-green" },
  { eyebrow: "Energia limpa", title: "Investimentos em energia solar batem recorde no país", gradient: "bg-linear-to-br from-amber-200 to-brasil-gold" },
  { eyebrow: "Clima", title: "Brasil apresenta novas metas climáticas em conferência internacional", gradient: "bg-linear-to-br from-brasil-blue to-blue-400" },
  { eyebrow: "Recursos hídricos", title: "Seca afeta reservatórios em regiões do Centro-Oeste", gradient: "bg-linear-to-br from-stone-300 to-stone-500" },
];

const INFRAESTRUTURA_TRANSPORTE: NewsItem[] = [
  { eyebrow: "Mobilidade urbana", title: "Nova linha de metrô deve iniciar operação ainda este ano", gradient: "bg-linear-to-br from-brasil-blue to-blue-400" },
  { eyebrow: "Rodovias", title: "Governo libera recursos para duplicação de trecho federal", gradient: "bg-linear-to-br from-brasil-gold to-amber-400" },
  { eyebrow: "Aviação", title: "Aeroportos regionais recebem investimento para expansão", gradient: "bg-linear-to-br from-brasil-green to-emerald-400" },
  { eyebrow: "Saneamento", title: "Obras de saneamento básico avançam em municípios do interior", gradient: "bg-linear-to-br from-blue-300 to-brasil-blue" },
];

const POLITICAS_URBANAS: NewsItem[] = [
  { eyebrow: "Habitação", title: "Programa habitacional amplia faixa de renda para financiamento", gradient: "bg-linear-to-br from-rose-300 to-brick" },
  { eyebrow: "Planejamento", title: "Prefeitura revisa plano diretor após consulta pública", gradient: "bg-linear-to-br from-brasil-green to-emerald-400" },
  { eyebrow: "Mobilidade", title: "Cidades ampliam malha cicloviária em bairros centrais", gradient: "bg-linear-to-br from-brasil-blue to-blue-400" },
  { eyebrow: "Regularização", title: "Regularização fundiária beneficia famílias em áreas periféricas", gradient: "bg-linear-to-br from-amber-200 to-brasil-gold" },
];

const CULTURA: NewsItem[] = [
  { eyebrow: "Patrimônio", title: "Centro histórico recebe restauração com verba federal", gradient: "bg-linear-to-br from-brick to-rose-300" },
  { eyebrow: "Audiovisual", title: "Produções nacionais ganham destaque em festival internacional", gradient: "bg-linear-to-br from-brasil-gold to-amber-400" },
  { eyebrow: "Incentivo", title: "Lei de incentivo cultural libera novo edital para artistas", gradient: "bg-linear-to-br from-brasil-green to-emerald-400" },
  { eyebrow: "Música", title: "Festival gratuito leva shows a praças públicas neste mês", gradient: "bg-linear-to-br from-brasil-blue to-blue-400" },
];

const CIENCIA_TECNOLOGIA: NewsItem[] = [
  { eyebrow: "Pesquisa", title: "Universidade brasileira lidera estudo sobre inteligência artificial", gradient: "bg-linear-to-br from-brasil-blue to-blue-400" },
  { eyebrow: "Inovação", title: "Startups nacionais recebem aporte recorde em 2026", gradient: "bg-linear-to-br from-brasil-green to-emerald-400" },
  { eyebrow: "Espaço", title: "Agência espacial brasileira anuncia novo lançamento de satélite", gradient: "bg-linear-to-br from-stone-300 to-stone-500" },
  { eyebrow: "Educação digital", title: "Programa leva formação em tecnologia a escolas públicas", gradient: "bg-linear-to-br from-amber-200 to-brasil-gold" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />

      <main className="overflow-x-hidden md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <DashboardHeader />
          <SearchBar />
          <HeroArticle />
          <RelevanceTabs />

          <NewsSection title="Educação" items={EDUCACAO} />
          <NewsSection title="Saúde" items={SAUDE} />
          <NewsSection title="Direitos Trabalhistas" items={DIREITOS_TRABALHISTAS} />
          <NewsSection title="Economia" items={ECONOMIA} />
          <NewsSection title="Segurança Pública" items={SEGURANCA_PUBLICA} />
          <NewsSection title="Meio Ambiente" items={MEIO_AMBIENTE} />
          <NewsSection title="Infraestrutura e Transporte" items={INFRAESTRUTURA_TRANSPORTE} />
          <NewsSection title="Políticas Urbanas" items={POLITICAS_URBANAS} />
          <NewsSection title="Cultura" items={CULTURA} />
          <NewsSection title="Ciência, Tecnologia e Inovação" items={CIENCIA_TECNOLOGIA} />
        </div>

        <Footer />
      </main>

      <FloatingAIButton />
    </div>
  );
}