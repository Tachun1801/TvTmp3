export default function HorizontalRow({ children, className = "" }) {
  return (
    <div
      className={`scrollbar-hide flex gap-4 overflow-x-auto pb-2 pt-1 ${className}`}
    >
      {children}
    </div>
  );
}
