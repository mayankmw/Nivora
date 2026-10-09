import { useMatches } from 'react-router';
import type { RouteHandle } from '@/app/router';

function isRouteHandle(handle: unknown): handle is RouteHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    typeof (handle as RouteHandle).title === 'string'
  );
}

/** Title of the deepest matched route that declares one. */
export function useRouteTitle(): string | undefined {
  const matches = useMatches();

  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const { handle } = matches[index];
    if (isRouteHandle(handle)) return handle.title;
  }
  return undefined;
}
