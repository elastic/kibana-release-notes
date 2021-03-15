import { useEffect, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { config as defaultConfig } from './release-notes';

interface AreaDefinition {
  title: string;
  labels?: readonly string[];
  options?: {
    bracketHandling?: 'strip' | 'keep';
    textOverwriteTemplate?: string;
  };
}

export interface Config {
  excludedLabels: readonly string[];
  areas: readonly AreaDefinition[];
  templates: {
    pages: {
      allChanges: string;
      releaseNotes: string;
    };
    prs: {
      breaking?: string;
      deprecation?: string;
      _other_: string;
    };
    prGroup: string;
  };
}

const CONFIG_KEY = 'releaseNotes.config';

const configSubject$ = new BehaviorSubject<Config>(
  localStorage.getItem(CONFIG_KEY)
    ? JSON.parse(localStorage.getItem(CONFIG_KEY) ?? '')
    : defaultConfig
);

configSubject$.subscribe((newConfig) => {
  debugger;
  if (JSON.stringify(newConfig) === JSON.stringify(defaultConfig)) {
    localStorage.removeItem(CONFIG_KEY);
  } else {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
  }
});

export function getDefaultConfig(): Config {
  return defaultConfig;
}

export function getConfig(): Config {
  return configSubject$.getValue();
}

export function useConfig(): Config {
  const [config, setConfig] = useState<Config>(configSubject$.getValue());
  useEffect(() => {
    const subscription = configSubject$.subscribe((newConfig) => {
      setConfig(newConfig);
    });
    return () => subscription.unsubscribe();
  }, []);
  return config;
}

export function setConfig(newConfig: Config): Config {
  configSubject$.next(newConfig);
  return newConfig;
}

export function hasConfigOverwrite(): boolean {
  return localStorage.getItem(CONFIG_KEY) !== null;
}

export function resetConfigOverwrite(): void {
  localStorage.removeItem(CONFIG_KEY);
  configSubject$.next(defaultConfig);
}
