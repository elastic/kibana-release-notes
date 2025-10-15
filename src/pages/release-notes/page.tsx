import { FC, useCallback, useState } from 'react';
import { ReleaseNotes } from './release-notes';
import { ReleaseNotesWizard } from './wizard';

export const ReleaseNotesPage: FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<string>();
  const [ignoredVersions, setIgnoredVersions] = useState<string[]>([]);
  const [selectedServerlessSHAs, setSelectedServerlessSHAs] = useState<Set<string>>(new Set());

  const onVersionChange = useCallback((version: string, ignoreVersions: string[] = []) => {
    setSelectedVersion(version);
    setIgnoredVersions(ignoreVersions);
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
          ignoredPriorReleases={ignoredVersions}
          selectedServerlessSHAs={selectedServerlessSHAs}
          onVersionChange={() => setSelectedVersion(undefined)}
        />
      )}
    </>
  );
};
