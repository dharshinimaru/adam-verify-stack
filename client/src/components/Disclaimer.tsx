export default function Disclaimer() {
  return (
    <footer className="py-8 mt-12 border-t text-center" style={{ borderColor: "var(--border-hairline)" }}>
      <p className="text-xs tracking-wide" style={{ color: "var(--text-muted)" }}>
        Decision support only — final release decisions require human QA review.
      </p>
    </footer>
  );
}
