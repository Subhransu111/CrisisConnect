export default function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-gray-400 text-sm">{label}</label>}
      <select
        className={`
          w-full bg-zinc-900 border text-white px-4 py-3
          focus:outline-none transition-colors
          ${error ? "border-red-500" : "border-zinc-800 focus:border-red-500"}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}