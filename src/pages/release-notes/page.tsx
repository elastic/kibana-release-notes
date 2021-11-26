import { FC, useCallback, useState } from 'react';
import { ReleaseNotes } from './release-notes';
import { ReleaseNotesWizard } from './wizard';

export const ReleaseNotesPage: FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<string>();

  const onVersionChange = useCallback((version: string) => {
    setSelectedVersion(version);
  }, []);

  return (
    <>
      {!selectedVersion && <ReleaseNotesWizard onVersionSelected={onVersionChange} />}
      {selectedVersion && (
        <ReleaseNotes
          version={selectedVersion}
          onVersionChange={() => setSelectedVersion(undefined)}
        />
      )}
    </>
  );
};
