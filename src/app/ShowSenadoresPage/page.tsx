'use client';

import { useState } from 'react';
import Image from 'next/image';

const timeline = [
	{ year: '2026', title: 'Projeto de Lei', text: 'Emenda Institui o Programa Estadual de Incentivo à Qualificação Profissional de Jovens.' },
	{ year: '2025', title: 'Projeto de Lei', text: 'Emenda Institui o Programa Estadual de Incentivo à Qualificação Profissional de Jovens.' },
];

const tabs = ['Visão geral', 'Comissões', 'Proposições', 'Linha do tempo'];

const tabColors = {
	'Visão geral': 'text-[#8d0801]',
	'Comissões': 'text-[#fbc000]',
	'Proposições': 'text-[#1c623a]',
	'Linha do tempo': 'text-[#ff7700]',
};

export default function ShowSenadoresPage() {
	const [activeTab, setActiveTab] = useState('Visão geral');

	const tabContent = {
		'Visão geral': {
			title: 'Visão geral',
			content: (
				<>
					<p>Nome: Rusimãe de Mileto</p>
					<p>Cargo: Senadora</p>
					<p>Partido: Partido do Desenvolvimento Cearense (PDC)</p>
					<p>Mandato: 2023-2026</p>
					<p>Estado: Ceará</p>
					<p className="mt-2">Rusimãe de Mileto é senadora pelo Ceará, com atuação voltada principalmente às áreas de educação, desenvolvimento social e qualificação profissional. Durante seu mandato, participa de debates e iniciativas relacionadas à melhoria dos serviços públicos.</p>
					<p className="mt-3 font-bold">Áreas de atuação:</p>
					<ul className="list-disc pl-5"><li>Educação</li><li>Desenvolvimento social</li><li>Juventude</li><li>Qualificação profissional</li></ul>
				</>
			),
		},
		'Comissões': {
			title: 'Comissões',
			content: <p>Participação nas comissões de Educação, Desenvolvimento Social e Juventude.</p>,
		},
		'Proposições': {
			title: 'Proposições',
			content: <p>Projetos e propostas apresentadas durante o mandato estadual.</p>,
		},
		'Linha do tempo': {
			title: 'Linha do tempo',
			content: <p>Acompanhe os principais acontecimentos e projetos do mandato entre 2023 e 2026.</p>,
		},
	};

	const selectedTab = tabContent[activeTab as keyof typeof tabContent];

	return (
		<main className="min-h-screen bg-[#FDFDFD] text-[#1b623a]">
			<header className="relative h-[84px] w-full border-b border-[#d7d0c3] bg-[#f7f5f1]">
                      <Image
								src="/sidebar.svg"
                        alt="Menu superior"
                        fill
                        priority
						className="object-cover"
                      />
                    </header>

			<div className="p-4 md:p-6">
				<div className="mx-auto max-w-[1200px]">
				<section id="perfil" className="grid gap-3 md:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
					<div className="flex min-h-[145px] items-center gap-3 rounded-[10px] p-3">
						<div className="relative h-[195px] w-[170px] shrink-0 overflow-hidden border-2 border-white shadow-sm">
							<Image src="/senadores.png" alt="Rusimãe de Mileto" fill className="object-cover" />
						</div>
						<div>
							<h1 className="text-xl font-black uppercase text-[#8d0801]">Rusimãe de Mileto</h1>
							<p className="mt-1 font-bold uppercase text-[#8d0801]">PDC - CE</p>
							<p className="mt-3 text-xs font-semibold text-[#8d0801]">Representante estadual do Ceará</p>
						</div>
					</div>
					<div className="flex min-h-[145px] items-center justify-center rounded-[10px] bg-[#1c623a] p-3 text-center text-white">
						<div>
							<p className="text-lg font-black uppercase">Efetividade Legislativa</p>
						</div>
					</div>
					<div className="flex min-h-[145px] items-center justify-center rounded-[10px] bg-[#8d0801] p-3 text-center text-white">
						<p className="text-lg font-black uppercase">Produtividade por Mandato</p>
					</div>
					<div className="flex min-h-[145px] items-center justify-center rounded-[10px] bg-[#fbc000] p-3 text-center text-white">
						<p className="text-lg font-black uppercase">Consistência temática via comissões</p>
					</div>
				</section>

				<section id="linha-do-tempo" className="mt-4 rounded-[10px] bg-[#fff3df] p-5">
					<div className="flex flex-col gap-10 md:flex-row md:items-center">
						<h2 className="shrink-0 text-3xl font-black uppercase text-[#fbc000]">Linha do tempo</h2>
						<div className="flex flex-1 flex-wrap items-stretch justify-center gap-9 md:justify-start">
							{timeline.map((item) => (
								<article key={item.year} className="w-full rounded-[10px] bg-[#ff7700] p-4 text-white md:w-[330px]">
									<div className="flex gap-4">
										<strong className="text-3xl font-black">{item.year}</strong>
										<p className="text-xs leading-tight"><b>{item.title}</b><br />{item.text}</p>
									</div>
								</article>
							))}
						</div>
						<button
							type="button"
							aria-label="Avançar na linha do tempo"
							className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full bg-[#fbc000] text-2xl font-bold text-white shadow-sm transition-transform hover:scale-105"
						>
							&rarr;
						</button>
					</div>
				</section>

				<section id="visao-geral" className="mt-4 grid gap-3 md:grid-cols-[160px_1fr]">
					<div className="h-[338px] w-[160px] overflow-hidden rounded-[10px] border-4 border-[#1b623a] bg-white">
						{tabs.map((tab) => (
							<button
								key={tab}
								type="button"
								onClick={() => setActiveTab(tab)}
								className={`block h-[60px] w-full border-b border-[#1b623a] px-3 text-left text-sm font-semibold last:border-0 ${activeTab === tab ? tabColors[tab as keyof typeof tabColors] : 'text-[#1b623a]'}`}
							>
								{tab}
							</button>
						))}
					</div>
					<article className={`min-h-[280px] rounded-[10px] p-6 text-white ${activeTab === 'Visão geral' ? 'bg-[#a70700]' : activeTab === 'Proposições' ? 'bg-[#1c623a]' : activeTab === 'Linha do tempo' ? 'bg-[#ff7700]' : 'bg-[#fbc000]'}`}>
						<h2 className="text-3xl font-black uppercase">{selectedTab.title}</h2>
						<div className="mt-3 max-w-4xl text-sm leading-relaxed">
							{selectedTab.content}
						</div>
					</article>
				</section>
				</div>
			</div>

			
		</main>
	);
}
