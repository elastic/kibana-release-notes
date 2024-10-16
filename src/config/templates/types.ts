export interface AreaDefinition {
  title: string;
  labels?: readonly string[];
  /**
   * If a PR can fall into multiple areas it will fall into the area with the highest priority.
   * If all areas it would be under have the same priority the result is random.
   */
  priority?: number;
  options?: {
    bracketHandling?: 'strip' | 'keep' | 'visualizations';
    textOverwriteTemplate?: string;
  };
}

export interface Config {
  /**
   * A list of exclude labels. PRs having any of this label won't be rendered into the release note.
   */
  excludedLabels: readonly string[];
  /**
   * If specified only PRs with that label will be loaded to generate the release notes.
   */
  includedLabels?: readonly string[];
  areas: readonly AreaDefinition[];
  templates: {
    pages: {
      releaseNotes: string;
      patchReleaseNotes?: string;
    };
    prs: {
      breaking?: string;
      deprecation?: string;
      _other_: string;
    };
    prGroup: string;
  };
  repoName: string;
}
