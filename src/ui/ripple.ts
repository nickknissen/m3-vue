const TARGET = 'button:not(:disabled), .tappable';

export function rippleRadius(width: number, height: number, x: number, y: number): number {
  const dx = Math.max(x, width - x);
  const dy = Math.max(y, height - y);
  return Math.ceil(Math.hypot(dx, dy));
}

export function installRipple(doc: Document): void {
  doc.addEventListener(
    'pointerdown',
    (event) => {
      const el = (event.target as Element | null)?.closest<HTMLElement>(TARGET);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      el.style.setProperty('--rx', `${x}px`);
      el.style.setProperty('--ry', `${y}px`);
      el.style.setProperty('--ripple-max', `${rippleRadius(rect.width, rect.height, x, y)}px`);
      el.classList.remove('rippling');
      void el.offsetWidth;
      el.classList.add('rippling');
      el.addEventListener('animationend', function done(end) {
        if (end.animationName !== 'ripple') return;
        el.classList.remove('rippling');
        el.removeEventListener('animationend', done);
      });
    },
    { passive: true },
  );
}
