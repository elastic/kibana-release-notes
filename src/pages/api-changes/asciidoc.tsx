import React, { useMemo } from 'react';
import asciidoc from 'asciidoctor';

const asciidoctor = asciidoc();

export const AsiidocRenderer: React.FC<{ source: string }> = ({ source }) => {
  const html = useMemo(() => {
    return asciidoctor.convert(source) as string;
  }, [source]);

  if (!source) {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
