import { useMemo } from 'react';
import type { FC } from 'react';
import asciidoc from 'asciidoctor';

interface Props {
  source?: string;
}

const asciidoctor = asciidoc();

const ASCIIDOC_ATTRIBUTES = {
  kib: 'Kibana',
  'kibana-pull': 'https://github.com/elastic/kibana/pull/',
};

export const AsiidocRenderer: FC<Props> = ({ source }) => {
  const html = useMemo(() => {
    return source
      ? String(
          asciidoctor.convert(source, {
            attributes: ASCIIDOC_ATTRIBUTES,
          })
        )
      : '';
  }, [source]);

  if (!source) {
    return null;
  }

  console.log(source);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
