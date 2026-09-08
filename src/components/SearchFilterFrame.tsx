export default function SearchFilterFrame() {
  return (
    <div className="relative mt-6 min-h-[170px] overflow-hidden rounded-[10px] border border-[#d6d1c8] bg-[#f3e6d3] p-4 shadow-sm">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90"
        style={{ backgroundImage: "url('/estampa_secao.png')" }}
      />

      <div className="relative z-10 flex min-h-[138px] items-center rounded-[14px] p-4 text-[#1C5D45]">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-start md:gap-x-6">
          <div className="flex-1">
            <span className="invisible block text-sm font-semibold">Pesquisar</span>
            <div className="mt-6 flex h-[52px] items-center rounded-[10px] border border-[#d6d1c8] bg-[#FDFDFD] px-4 py-3 shadow-sm">
              <input
                type="text"
                placeholder="Pesquisar por nome, partido ou palavra-chave..."
                className="w-full border-0 bg-transparent text-sm text-[#1C5D45] outline-none placeholder:text-[#1C5D45]"
              />
              <span className="ml-3 text-xl text-[#1C5D45]">⌕</span>
            </div>
          </div>

          <div className="hidden self-stretch pt-6 md:block">
            <div className="h-full w-px rounded-full bg-[#1C5D45]" />
          </div>

          <label className="block w-full text-sm font-semibold text-[#1C5D45] md:w-[220px]">
            SITUAÇÃO DO MANDATO
            <select className="mt-6 h-[52px] w-full rounded-[8px] border border-[#d6d1c8] bg-[#FDFDFD] px-4 py-3 text-base font-semibold text-[#1C5D45] outline-none">
              <option className="bg-[#FDFDFD]">Todas</option>
              <option className="bg-[#FDFDFD]">Ativo</option>
              <option className="bg-[#FDFDFD]">Encerrado</option>
            </select>
          </label>

          <label className="block w-full text-sm font-semibold text-[#1C5D45] md:w-[220px]">
            PARTIDO
            <select className="mt-6 h-[52px] w-full rounded-[8px] border border-[#d6d1c8] bg-[#FDFDFD] px-4 py-3 text-base font-semibold text-[#1C5D45] outline-none">
              <option className="bg-[#FDFDFD]">Todos</option>
              <option className="bg-[#FDFDFD]">PDT</option>
              <option className="bg-[#FDFDFD]">PT</option>
              <option className="bg-[#FDFDFD]">MDB</option>
            </select>
          </label>
        </div>
      </div>

      <div className="relative z-10 flex justify-end gap-3 px-4 pb-2">
        <button type="button" className="rounded-[10px] border border-[#d6d1c8] px-5 py-3 text-sm font-semibold text-[#1C5D45]">
          Limpar filtros
        </button>
        <button type="button" className="rounded-[10px] bg-[#8D0801] px-5 py-3 text-sm font-semibold text-white">
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}