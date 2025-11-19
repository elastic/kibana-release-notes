import { FC, useCallback, useState } from 'react';
import { ReleaseNotes } from './release-notes';
import { ReleaseNotesWizard } from './wizard';

export const ReleaseNotesPage: FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<string>();
  const [selectedServerlessSHAs, setSelectedServerlessSHAs] = useState<Set<string>>(new Set());

  const onVersionChange = useCallback((version: string) => {
    setSelectedVersion(version);
  }, []);

  return (
    <>
      {!selectedVersion && (
        <ReleaseNotesWizard
          onVersionSelected={onVersionChange}
          selectedServerlessSHAs={selectedServerlessSHAs}
          setSelectedServerlessSHAs={setSelectedServerlessSHAs}
        />
      )}
      {selectedVersion && (
        <ReleaseNotes
          version={selectedVersion}
          selectedServerlessSHAs={selectedServerlessSHAs}
          onVersionChange={() => setSelectedVersion(undefined)}
        />
      )}
    </>
  );
};
