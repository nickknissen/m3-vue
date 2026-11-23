import { onBeforeUnmount, ref, type Ref } from 'vue';

type MediaHost = { matchMedia?: (query: string) => Pick<MediaQueryList, 'matches' | 'addEventListener' | 'removeEventListener'> };

export function watchMedia(host: MediaHost, query: string, onChange: (matches: boolean) => void): () => void {
  if (typeof host.matchMedia !== 'function') {
    onChange(false);
    return () => {};
  }
  const list = host.matchMedia(query);
  const listener = (event: { matches: boolean }) => onChange(event.matches);
  onChange(list.matches);
  list.addEventListener('change', listener);
  return () => list.removeEventListener('change', listener);
}

export function useMediaQuery(query: string): Readonly<Ref<boolean>> {
  const matches = ref(false);
  const stop = watchMedia(globalThis as MediaHost, query, (value) => (matches.value = value));
  onBeforeUnmount(stop);
  return matches;
}
