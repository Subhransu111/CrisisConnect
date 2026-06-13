export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-gray-400 text-sm">{label}</label>
      )}
      <input
        className={`
          w-full bg-zinc-900 border text-white px-4 py-3
          focus:outline-none transition-colors placeholder-gray-600
          ${error ? "border-red-500" : "border-zinc-800 focus:border-red-500"}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}