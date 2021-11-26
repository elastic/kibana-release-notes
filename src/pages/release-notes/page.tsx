import { FC, useCallback, useState } from 'react';
import { ReleaseNotes } from './release-notes';
import { VersionSelection } from './version-select';

export const ReleaseNotesPage: FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<string>();

  const onVersionChange = useCallback((version: string) => {
    setSelectedVersion(version);
  }, []);

  return (
    <>
      {!selectedVersion && <VersionSelection onVersionSelected={onVersionChange} />}
      {selectedVersion && (
        <ReleaseNotes
          version={selectedVersion}
          onVersionChange={() => setSelectedVersion(undefined)}
        />
      )}
    </>
  );
};
