export function nextRadioIndex(index: number, key: string, count: number): number | null {
  if (count === 0) return null;
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (index + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (index - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

export function handleRadioKeydown<T>(event: KeyboardEvent, options: readonly T[], current: T, select: (value: T) => void) {
  const next = nextRadioIndex(Math.max(0, options.indexOf(current)), event.key, options.length);
  if (next === null) return;
  event.preventDefault();
  select(options[next]!);
  (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
}

export function verticalTarget(index: number, key: string, count: number): number | null {
  const next = key === 'ArrowDown' ? index + 1 : key === 'ArrowUp' ? index - 1 : null;
  return next === null || next < 0 || next >= count ? null : next;
}

export function handleCellKeydown(event: KeyboardEvent, cellSelector: string) {
  const input = event.target as HTMLElement;
  if (!input.matches(cellSelector)) return;
  const rows = [...(event.currentTarget as HTMLElement).querySelectorAll('tr')].filter((tr) => tr.querySelector(cellSelector));
  const row = input.closest('tr');
  if (!row) return;
  const target = verticalTarget(rows.indexOf(row), event.key, rows.length);
  if (target === null) return;
  const column = [...row.querySelectorAll(cellSelector)].indexOf(input);
  const next = rows[target]!.querySelectorAll<HTMLInputElement>(cellSelector)[column];
  if (!next) return;
  event.preventDefault();
  next.focus();
  next.select();
}
