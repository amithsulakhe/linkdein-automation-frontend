function humanizeDates(text) {
  return text.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g, (iso) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
  });
}

function renderInline(text) {
  const clean = humanizeDates(text).replace(/^\*\s+/, '').replace(/^-\s+/, '');
  const parts = clean.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function PostBody({ content }) {
  if (!content) return null;
  const lines = content.split('\n');
  const blocks = [];
  let list = [];

  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: 'list', items: list });
    list = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    if (/^(-|\*)\s+/.test(trimmed)) {
      list.push(trimmed.replace(/^(-|\*)\s+/, ''));
      return;
    }
    flushList();
    blocks.push({ type: 'p', text: trimmed });
  });
  flushList();

  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      {blocks.map((block, i) =>
        block.type === 'list' ? (
          <ul key={i} className="list-disc space-y-1.5 pl-5">
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{renderInline(block.text)}</p>
        )
      )}
    </div>
  );
}
