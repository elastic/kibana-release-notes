import { FC, useCallback, useState } from 'react';
import { ReleaseNotes } from './release-notes';
import { ReleaseNotesWizard } from './wizard';

export const ReleaseNotesPage: FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<string>();
  const [ignoredVersions, setIgnoredVersions] = useState<string[]>([]);

  const onVersionChange = useCallback((version: string, ignoreVersions: string[] = []) => {
    setSelectedVersion(version);
    setIgnoredVersions(ignoreVersions);
  }, []);

  return (
    <>
      {!selectedVersion && <ReleaseNotesWizard onVersionSelected={onVersionChange} />}
      {selectedVersion && (
        <ReleaseNotes
          version={selectedVersion}
          ignoredPriorReleases={ignoredVersions}
          onVersionChange={() => setSelectedVersion(undefined)}
        />
      )}
    </>
  );
};
