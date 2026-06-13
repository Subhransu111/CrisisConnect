export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  ...props
}) {
  const variants = {
    primary: "bg-red-500 hover:bg-red-600 text-white",
    secondary: "border border-zinc-700 hover:border-red-500 text-white bg-transparent",
    ghost: "text-gray-400 hover:text-white bg-transparent",
    danger: "bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-500/30",
    success: "bg-green-900/40 hover:bg-green-900/60 text-green-400 border border-green-500/30",
  }
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base font-bold",
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}