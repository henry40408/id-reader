import { useTitle as baseUseTitle } from '@vueuse/core';

export function useTitle(title: string, options?: { titleTemplate?: string }) {
  const titleTemplate = options?.titleTemplate || '%s | id-reader';
  return baseUseTitle(title, { titleTemplate });
}
