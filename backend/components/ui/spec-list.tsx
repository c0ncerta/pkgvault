interface SpecItem {
  label: string;
  value: string;
}

interface SpecListProps {
  items: SpecItem[];
  columns?: 1 | 2;
}

export function SpecList({ items, columns = 1 }: SpecListProps) {
  if (columns === 2) {
    const mid = Math.ceil(items.length / 2);
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
        <dl className="spec-list">
          {items.slice(0, mid).map((item) => (
            <SpecRow key={item.label} {...item} />
          ))}
        </dl>
        <dl className="spec-list">
          {items.slice(mid).map((item) => (
            <SpecRow key={item.label} {...item} />
          ))}
        </dl>
      </div>
    );
  }

  return (
    <dl className="spec-list">
      {items.map((item) => (
        <SpecRow key={item.label} {...item} />
      ))}
    </dl>
  );
}

function SpecRow({ label, value }: SpecItem) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
