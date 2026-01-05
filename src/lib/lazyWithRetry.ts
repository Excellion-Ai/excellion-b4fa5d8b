import { lazy, ComponentType } from 'react';

type ComponentImport<T> = () => Promise<{ default: T }>;

const hasRefreshed = (key: string): boolean => {
  return sessionStorage.getItem(key) === 'true';
};

const setRefreshed = (key: string): void => {
  sessionStorage.setItem(key, 'true');
};

export function lazyWithRetry<T extends ComponentType<unknown>>(
  componentImport: ComponentImport<T>,
  name: string
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const storageKey = `retry-lazy-refreshed-${name}`;

    try {
      const component = await componentImport();
      sessionStorage.removeItem(storageKey);
      return component;
    } catch (error) {
      if (!hasRefreshed(storageKey)) {
        setRefreshed(storageKey);
        window.location.reload();
        return { default: (() => null) as unknown as T };
      }
      throw error;
    }
  });
}
