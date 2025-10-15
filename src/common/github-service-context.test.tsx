import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RequestError } from '@octokit/types';
import {
  GitHubServiceContextProvider,
  useGitHubServiceContext,
  GitHubErrorHandler,
} from './github-service-context';
import { GitHubService } from './github-service';
import { getOctokit } from './github';
import { useActiveConfig } from '../config';
import { Config, OutputTemplate } from '../config/templates/types';

const TEST_IDS = {
  CONTEXT_CONSUMER: 'context-consumer',
  SERVICE_REPO: 'service-repo',
  LOADING: 'loading',
  TEST_CHILD: 'test-child',
  WRAPPER: 'wrapper',
  TEST_REPO: 'test-repo',
} as const;

jest.mock('./github-service');
jest.mock('./github');
jest.mock('../config');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockOctokit = {
  rest: {},
  graphql: jest.fn(),
  request: jest.fn(),
  log: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  hook: { before: jest.fn(), after: jest.fn(), error: jest.fn(), wrap: jest.fn() },
  auth: jest.fn(),
  paginate: jest.fn(),
} as unknown as ReturnType<typeof getOctokit>;

const mockOutputTemplate: OutputTemplate = {
  pages: {
    releaseNotes: 'mock-release-notes-template',
    patchReleaseNotes: 'mock-patch-release-notes-template',
  },
  prs: {
    _other_: 'mock-pr-template',
  },
  prGroup: 'mock-pr-group-template',
};

const mockConfig: Config = {
  repoName: TEST_IDS.TEST_REPO,
  excludedLabels: [],
  areas: [],
  templates: {
    markdown: mockOutputTemplate,
    asciidoc: mockOutputTemplate,
  },
};

const mockGitHubService = GitHubService as jest.MockedClass<typeof GitHubService>;
const mockGetOctokit = getOctokit as jest.MockedFunction<typeof getOctokit>;
const mockUseActiveConfig = useActiveConfig as jest.MockedFunction<typeof useActiveConfig>;

mockGitHubService.mockImplementation(function (config: { repoName: string }) {
  return {
    repoName: config.repoName,
  } as GitHubService;
});

mockGetOctokit.mockReturnValue(mockOctokit);
mockUseActiveConfig.mockReturnValue(mockConfig);

const TestChild = () => <div data-testid={TEST_IDS.TEST_CHILD}>Child rendered</div>;

const TestConsumer = () => {
  const context = useGitHubServiceContext();
  return (
    <div data-testid={TEST_IDS.CONTEXT_CONSUMER}>
      <div data-testid={TEST_IDS.SERVICE_REPO}>{context.service.repoName}</div>
      <div data-testid={TEST_IDS.LOADING}>{context.loading.toString()}</div>
    </div>
  );
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

const getErrorHandler = async (): Promise<GitHubErrorHandler> => {
  let errorHandler: GitHubErrorHandler | undefined;

  const TestWrapper = () => {
    const context = useGitHubServiceContext();
    errorHandler = context.errorHandler;
    return <div data-testid={TEST_IDS.WRAPPER}>Wrapper</div>;
  };

  renderWithRouter(
    <GitHubServiceContextProvider>
      <TestWrapper />
    </GitHubServiceContextProvider>
  );

  expect(screen.getByTestId(TEST_IDS.WRAPPER)).toBeInTheDocument();
  expect(errorHandler).toBeDefined();

  return errorHandler as GitHubErrorHandler;
};

describe('GitHubServiceContextProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGitHubService.mockImplementation(function (config: { repoName: string }) {
      return {
        repoName: config.repoName,
      } as GitHubService;
    });
    mockGetOctokit.mockReturnValue(mockOctokit);
    mockUseActiveConfig.mockReturnValue(mockConfig);
  });

  it('creates service on mount with correct repoName', async () => {
    renderWithRouter(
      <GitHubServiceContextProvider>
        <TestConsumer />
      </GitHubServiceContextProvider>
    );

    expect(screen.getByTestId(TEST_IDS.CONTEXT_CONSUMER)).toBeInTheDocument();
    expect(GitHubService).toHaveBeenCalledWith({
      octokit: mockOctokit,
      repoName: TEST_IDS.TEST_REPO,
      setLoading: expect.any(Function),
    });
    expect(screen.getByTestId(TEST_IDS.SERVICE_REPO)).toHaveTextContent(TEST_IDS.TEST_REPO);
  });

  it('updates service when repoName changes', async () => {
    const { rerender } = renderWithRouter(
      <GitHubServiceContextProvider>
        <TestConsumer />
      </GitHubServiceContextProvider>
    );

    expect(screen.getByTestId(TEST_IDS.CONTEXT_CONSUMER)).toBeInTheDocument();
    expect(GitHubService).toHaveBeenCalledTimes(1);

    mockUseActiveConfig.mockReturnValue({
      repoName: 'new-repo',
      excludedLabels: [],
      areas: [],
      templates: {
        markdown: mockOutputTemplate,
        asciidoc: mockOutputTemplate,
      },
    });

    rerender(
      <MemoryRouter>
        <GitHubServiceContextProvider>
          <TestConsumer />
        </GitHubServiceContextProvider>
      </MemoryRouter>
    );

    expect(GitHubService).toHaveBeenCalledTimes(2);
    expect(GitHubService).toHaveBeenLastCalledWith({
      octokit: mockOctokit,
      repoName: 'new-repo',
      setLoading: expect.any(Function),
    });
  });

  it('does not recreate service when repoName unchanged', async () => {
    const { rerender } = renderWithRouter(
      <GitHubServiceContextProvider>
        <TestConsumer />
      </GitHubServiceContextProvider>
    );

    expect(screen.getByTestId(TEST_IDS.CONTEXT_CONSUMER)).toBeInTheDocument();
    expect(GitHubService).toHaveBeenCalledTimes(1);
    rerender(
      <MemoryRouter>
        <GitHubServiceContextProvider>
          <TestConsumer />
        </GitHubServiceContextProvider>
      </MemoryRouter>
    );

    expect(GitHubService).toHaveBeenCalledTimes(1);
  });

  it('provides service state through context', () => {
    const result = renderWithRouter(
      <GitHubServiceContextProvider>
        <TestConsumer />
      </GitHubServiceContextProvider>
    );

    expect(screen.getByTestId(TEST_IDS.CONTEXT_CONSUMER)).toBeInTheDocument();
    expect(result.getByTestId(TEST_IDS.SERVICE_REPO)).toHaveTextContent(TEST_IDS.TEST_REPO);
    expect(result.getByTestId(TEST_IDS.LOADING)).toHaveTextContent('false');
  });

  it('renders children when service exists', async () => {
    renderWithRouter(
      <GitHubServiceContextProvider>
        <TestChild />
      </GitHubServiceContextProvider>
    );

    expect(screen.getByTestId(TEST_IDS.TEST_CHILD)).toBeInTheDocument();
  });

  it('navigates to /github for status 401 with statusCode', async () => {
    const errorHandler = await getErrorHandler();
    const error401 = { status: 401 } as RequestError;

    errorHandler(error401);

    expect(mockNavigate).toHaveBeenCalledWith('/github', {
      state: { statusCode: 401 },
    });
  });

  it('navigates to /github for status 403 with statusCode', async () => {
    const errorHandler = await getErrorHandler();
    const error403 = { status: 403 } as RequestError;

    errorHandler(error403);

    expect(mockNavigate).toHaveBeenCalledWith('/github', {
      state: { statusCode: 403 },
    });
  });

  it('navigates to /github for status 422 with statusCode', async () => {
    const errorHandler = await getErrorHandler();
    const error422 = { status: 422 } as RequestError;

    errorHandler(error422);

    expect(mockNavigate).toHaveBeenCalledWith('/github', {
      state: { statusCode: 422 },
    });
  });

  it('re-throws errors with other status codes', async () => {
    const errorHandler = await getErrorHandler();
    const error500 = { status: 500 } as RequestError;

    expect(() => errorHandler(error500)).toThrow();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('re-throws generic errors', async () => {
    const errorHandler = await getErrorHandler();
    const genericError = new Error('Generic error');

    expect(() => errorHandler(genericError)).toThrow('Generic error');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
