import { FC, useCallback, useState } from 'react';
import { ServerlessRelease } from '../../common';
import { ReleaseNotes } from './release-notes';
import { ReleaseNotesWizard } from './wizard';

export const ReleaseNotesPage: FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<string>();
  const [ignoredVersions, setIgnoredVersions] = useState<string[]>([]);
  const [selectedServerlessReleases, setSelectedServerlessReleases] = useState<ServerlessRelease[]>(
    []
  );

  const onVersionChange = useCallback((version: string, ignoreVersions: string[] = []) => {
    setSelectedVersion(version);
    setIgnoredVersions(ignoreVersions);
  }, []);

  return (
    <>
      {!selectedVersion && (
        <ReleaseNotesWizard
          onVersionSelected={onVersionChange}
          selectedServerlessReleases={selectedServerlessReleases}
          setSelectedServerlessReleases={setSelectedServerlessReleases}
        />
      )}
      {selectedVersion && (
        <ReleaseNotes
          version={selectedVersion}
          ignoredPriorReleases={ignoredVersions}
          selectedServerlessReleases={selectedServerlessReleases}
          onVersionChange={() => setSelectedVersion(undefined)}
        />
      )}
    </>
  );
};
