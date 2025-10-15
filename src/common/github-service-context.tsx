import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { RequestError } from '@octokit/types';
import { GitHubService } from './github-service';
import { getOctokit } from './github';
import { useActiveConfig } from '../config';

export type GitHubErrorHandler = (error: Error | RequestError) => void;

interface GitHubServiceContextValue {
  service: GitHubService;
  errorHandler: GitHubErrorHandler;
  loading: boolean;
}

const GitHubServiceContext = createContext<GitHubServiceContextValue | null>(null);

interface GitHubServiceContextProviderProps {
  children: ReactNode;
}

export const GitHubServiceContextProvider: React.FC<GitHubServiceContextProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const config = useActiveConfig();
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState<GitHubService | null>(null);

  // Create or update service when repoName changes
  useEffect(() => {
    if (!service || service.repoName !== config.repoName) {
      const newService = new GitHubService({
        octokit: getOctokit(),
        repoName: config.repoName,
        setLoading,
      });
      setService(newService);
    }
  }, [service, config.repoName]);

  const errorHandler = useCallback(
    (error: Error | RequestError) => {
      if (
        'status' in error &&
        (error.status === 401 || error.status === 403 || error.status === 422)
      ) {
        navigate('/github', { state: { statusCode: error.status } });
        return;
      }
      throw error;
    },
    [navigate]
  );

  // Don't render children until we have a service
  if (!service) {
    return null;
  }

  const contextValue: GitHubServiceContextValue = {
    service,
    errorHandler,
    loading,
  };

  return (
    <GitHubServiceContext.Provider value={contextValue}>{children}</GitHubServiceContext.Provider>
  );
};

export const useGitHubServiceContext = (): GitHubServiceContextValue => {
  const context = useContext(GitHubServiceContext);
  // Since we wrap the entire app, this should never be null
  return context as GitHubServiceContextValue;
};
