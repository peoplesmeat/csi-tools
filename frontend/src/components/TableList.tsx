interface Props {
  tables: string[]
  selected: string | null
  onSelect: (table: string) => void
  loading: boolean
}

export default function TableList({ tables, selected, onSelect, loading }: Props) {
  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tables</h2>
      </div>
      {loading ? (
        <div className="px-4 py-3 text-sm text-gray-400">Loading…</div>
      ) : (
        <ul>
          {tables.map((t) => (
            <li key={t}>
              <button
                onClick={() => onSelect(t)}
                className={`w-full text-left px-4 py-2 text-sm truncate transition-colors ${
                  selected === t
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
