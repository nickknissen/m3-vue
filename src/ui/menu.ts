export function nextOptionIndex(index: number, key: string, count: number): number | null {
  if (count === 0) return null;
  switch (key) {
    case 'ArrowDown':
      return (index + 1) % count;
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

export interface MenuPlacement {
  left: number;
  top: number;
  above: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export function contextMenuPoint(pointer: Point, target: { left: number; right: number; top: number; bottom: number }): Point {
  const inside = pointer.x >= target.left && pointer.x <= target.right && pointer.y >= target.top && pointer.y <= target.bottom;
  return inside ? pointer : { x: target.left + 16, y: target.bottom };
}

export function placeMenuAt(point: Point, menu: { width: number; height: number }, viewport: { width: number; height: number }, margin = 8): MenuPlacement {
  const fitsRight = point.x + menu.width <= viewport.width - margin;
  const left = Math.max(margin, Math.min(fitsRight ? point.x : point.x - menu.width, viewport.width - menu.width - margin));
  const above = point.y + menu.height > viewport.height - margin && point.y - menu.height >= margin;
  const top = above ? point.y - menu.height : Math.max(margin, Math.min(point.y, viewport.height - menu.height - margin));
  return { left, top, above };
}

export function placeMenu(
  anchor: { left: number; right: number; top: number; bottom: number },
  menu: { width: number; height: number },
  viewport: { width: number; height: number },
  margin = 8,
  offset = 4,
): MenuPlacement {
  const left = Math.max(margin, Math.min(anchor.right - menu.width, viewport.width - menu.width - margin));
  const spaceBelow = viewport.height - anchor.bottom - offset - margin;
  const spaceAbove = anchor.top - offset - margin;
  const above = menu.height > spaceBelow && spaceAbove > spaceBelow;
  const top = above ? anchor.top - offset - menu.height : anchor.bottom + offset;
  return { left, top, above };
}
