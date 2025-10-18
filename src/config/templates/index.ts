import { kibanaTemplate } from './kibana';
import { securityTemplate } from './security';
import { endpointTemplate } from './endpoint';
import { serverlessTemplate } from './serverless';
import { observabilityTemplate } from './observability';
import { Config } from './types';
import type { EuiIconProps } from '@elastic/eui';

export * from './types';

export type TemplateId = 'kibana' | 'security' | 'endpoint' | 'serverless' | 'observability';

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
  {
    id: 'observability',
    name: 'Observability',
    icon: 'logoObservability',
    config: observabilityTemplate,
  },
  { id: 'serverless', name: 'Serverless', icon: 'logoKibana', config: serverlessTemplate },
];
