import { kibanaTemplate } from './kibana';
import { securityTemplate } from './security';
import { Config } from './types';

export * from './types';

export type TemplateId = 'kibana' | 'security';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  icon: string;
  config: Config;
}

export const templates: TemplateInfo[] = [
  { id: 'kibana', name: 'Kibana', icon: 'logoKibana', config: kibanaTemplate },
  { id: 'security', name: 'Security', icon: 'logoSecurity', config: securityTemplate },
];
