interface StatePanelProps {
  title: string;
  message: string;
  isError?: boolean;
}

export function StatePanel({ title, message, isError = false }: StatePanelProps) {
  return (
    <section className={`state-panel${isError ? " error" : ""}`}>
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  );
}
