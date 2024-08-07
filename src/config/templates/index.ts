import { kibanaTemplate } from './kibana';
import { securityTemplate } from './security';
import { endpointTemplate } from './endpoint';
import { Config } from './types';
import type { EuiIconProps } from '@elastic/eui';

export * from './types';

export type TemplateId = 'kibana' | 'security' | 'endpoint';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  icon: EuiIconProps['type'];
  config: Config;
}

export const templates: TemplateInfo[] = [
  { id: 'kibana', name: 'Kibana', icon: 'logoKibana', config: kibanaTemplate },
  { id: 'security', name: 'Security', icon: 'logoSecurity', config: securityTemplate },
  { id: 'endpoint', name: 'Endpoint', icon: 'logoElastic', config: endpointTemplate },
];
