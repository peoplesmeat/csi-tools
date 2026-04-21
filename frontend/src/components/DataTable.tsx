import { useState, useEffect } from 'react'
import { fetchTableData, type TableData } from '../api'

const PAGE_SIZE = 100

interface Props {
  table: string
}

export default function DataTable({ table }: Props) {
  const [data, setData] = useState<TableData | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPage(0)
    setData(null)
  }, [table])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchTableData(table, page * PAGE_SIZE, PAGE_SIZE)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [table, page])

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
        <h2 className="text-base font-semibold text-gray-800">{table}</h2>
        {data && (
          <span className="text-sm text-gray-400">
            {data.total.toLocaleString()} rows
          </span>
        )}
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          Loading…
        </div>
      )}

      {data && (
        <>
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  {data.columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-medium text-gray-500 border-b border-gray-200 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    {data.columns.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-1.5 border-b border-gray-100 text-gray-700 whitespace-nowrap max-w-xs truncate"
                        title={String(row[col] ?? '')}
                      >
                        {row[col] === null || row[col] === undefined ? (
                          <span className="text-gray-300 italic">null</span>
                        ) : (
                          String(row[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="shrink-0 px-6 py-3 border-t border-gray-200 flex items-center gap-3">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-sm rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-sm rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
