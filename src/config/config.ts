import { useEffect, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { TemplateId, templates, Config } from './templates';

const ACTIVE_TEMPLATE = 'template.active';
const TEMPLATE_CONFIG_PREFIX = 'template.config';

const localStorageConfigKey = (id: TemplateId) => `${TEMPLATE_CONFIG_PREFIX}.${id}`;

const activeConfig$ = new BehaviorSubject<Config>(getConfig());

export function getTemplateInfos() {
  const activeTemplate = getActiveTemplateId();
  return templates.map((template) => ({
    ...template,
    active: activeTemplate === template.id,
    modified: hasConfigChanges(template.id),
  }));
}

/**
 * Returns the id of the currently used config template.
 */
export function getActiveTemplateId(): TemplateId {
  return (localStorage.getItem(ACTIVE_TEMPLATE) as TemplateId | null) ?? 'kibana';
}

export function setActiveTemplate(templateId: TemplateId) {
  localStorage.setItem(ACTIVE_TEMPLATE, templateId);
  activeConfig$.next(getConfig(templateId));
  return getTemplateInfos();
}

export function hasConfigChanges(id: TemplateId): boolean {
  return localStorage.getItem(localStorageConfigKey(id)) !== null;
}

/**
 * Returns the default (unmodified) config for a specific template.
 */
export function getDefaultConfig(id: TemplateId): Config {
  // We know that there is one template for each id, so we can assume this is not null here.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return templates.find((template) => template.id === id)!.config;
}

/**
 * Returns the specified config including potential customizations the user made.
 * If no id will be specified the currently active config will be used.
 */
export function getConfig(id: TemplateId = getActiveTemplateId()): Config {
  const customizedConfig = localStorage.getItem(localStorageConfigKey(id));
  if (customizedConfig) {
    return JSON.parse(customizedConfig);
  } else {
    return getDefaultConfig(id);
  }
}

export function setConfig(newConfig: Config, templateId: TemplateId = getActiveTemplateId()): void {
  if (JSON.stringify(newConfig) === JSON.stringify(getDefaultConfig(templateId))) {
    localStorage.removeItem(localStorageConfigKey(templateId));
  } else {
    localStorage.setItem(localStorageConfigKey(templateId), JSON.stringify(newConfig));
  }
  if (getActiveTemplateId() === templateId) {
    activeConfig$.next(getConfig());
  }
}

export function discardConfigChanges(templateId: TemplateId): void {
  localStorage.removeItem(localStorageConfigKey(templateId));
  if (getActiveTemplateId() === templateId) {
    activeConfig$.next(getConfig());
  }
}

export function useActiveConfig(): Config {
  const [config, setConfig] = useState<Config>(activeConfig$.getValue());
  useEffect(() => {
    const subscription = activeConfig$.subscribe((newConfig) => {
      setConfig(newConfig);
    });
    return () => subscription.unsubscribe();
  }, []);
  return config;
}

declare const _BASENAME_: string;
export function getBasename() {
  return typeof _BASENAME_ == 'undefined' ? undefined : _BASENAME_;
}
