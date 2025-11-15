// components/ui/badge.js
export function Badge({ children, color = "green" }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  const bg = colors[color] || colors.green;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${bg}`}>
      {children}
    </span>
  );
}
