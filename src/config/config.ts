import { useEffect, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { kibanaTemplate } from './templates/kibana';
import { securityTemplate } from './templates/security';

interface AreaDefinition {
  title: string;
  labels?: readonly string[];
  /**
   * If a PR can fall into multiple areas it will fall into the area with the highest priority.
   * If all areas it would be under have the same priority the result is random.
   */
  priority?: number;
  options?: {
    bracketHandling?: 'strip' | 'keep' | 'visualizations';
    textOverwriteTemplate?: string;
  };
}

export interface Config {
  template: string;
  excludedLabels: readonly string[];
  areas: readonly AreaDefinition[];
  templates: {
    pages: {
      releaseNotes: string;
      patchReleaseNotes?: string;
    };
    prs: {
      breaking?: string;
      deprecation?: string;
      _other_: string;
    };
    prGroup: string;
  };
}

const TEMPLATE_KEY = 'releaseNotes.template';
const CONFIG_KEY = 'releaseNotes.config';

const configSubject$ = new BehaviorSubject<Config>(
  localStorage.getItem(CONFIG_KEY)
    ? JSON.parse(localStorage.getItem(CONFIG_KEY) ?? '')
    : getTemplate(localStorage.getItem(TEMPLATE_KEY) ?? 'kibana')
);

configSubject$.subscribe((newConfig) => {
  if (JSON.stringify(newConfig) === JSON.stringify(getTemplate(newConfig.template))) {
    localStorage.removeItem(CONFIG_KEY);
  } else {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
  }
});

export function getTemplate(key?: string): Config {
  switch (key) {
    case 'security':
      return securityTemplate;
    case 'kibana':
    default:
      return kibanaTemplate;
  }
}

export function hasConfigChanges(): boolean {
  return localStorage.getItem(CONFIG_KEY) !== null;
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

export function resetConfigOverwrite(template: 'kibana' | 'security'): void {
  localStorage.removeItem(CONFIG_KEY);
  localStorage.setItem(TEMPLATE_KEY, template);
  configSubject$.next(getTemplate(template));
}
