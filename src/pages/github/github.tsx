import {
  EuiCallOut,
  EuiCode,
  EuiFieldPassword,
  EuiLink,
  EuiPageTemplate,
  EuiSteps,
  EuiText,
  EuiTextColor,
  EuiSpacer,
} from '@elastic/eui';
import { FC, useCallback, useEffect, useState } from 'react';
import type { EuiStepsProps } from '@elastic/eui';
import { GITHUB_TOKEN, TokenValidated, validateToken } from '../../common';
import { Machine, assign, DoneInvokeEvent, State } from 'xstate';
import { useMachine } from '@xstate/react';
import { useLocation } from 'react-router-dom';

interface Context {
  name?: string;
  error?: string;
  token: string;
}

interface StateSchema {
  states: {
    idle: {};
    fetching: {};
    success: {};
    error: {
      states: {
        invalidScope: {};
        validationError: {};
      };
    };
  };
}

type Events = { type: 'FETCH'; token: string };

const stateMachine = Machine<Context, StateSchema, Events>(
  {
    initial: 'idle',
    context: {
      token: '',
      name: undefined,
      error: undefined,
    },
    states: {
      idle: {
        on: {
          FETCH: [
            { target: 'fetching', cond: (context, event) => !!event.token },
            { target: 'idle' },
          ],
        },
      },
      fetching: {
        entry: assign({
          token: (context, event) => event.token,
        }),
        invoke: {
          src: (context, event) => validateToken(event.token),
          onDone: [
            {
              target: 'error.invalidScope',
              cond: (context, event: DoneInvokeEvent<TokenValidated>) =>
                !event.data.scopes.includes('repo'),
            },
            {
              target: 'success',
              actions: [
                'storeToken',
                assign({
                  name: (context, event: DoneInvokeEvent<TokenValidated>) => event.data.name,
                }),
              ],
            },
          ],
          onError: [
            {
              target: 'error.validationError',
              actions: assign({
                error: (context, event) => event.data.message,
              }),
            },
          ],
        },
      },
      error: {
        entry: ['clearToken'],
        on: {
          FETCH: [
            { target: 'fetching', cond: (context, event) => !!event.token },
            { target: 'idle', actions: ['clearToken'] },
          ],
        },
        states: {
          invalidScope: {},
          validationError: {},
        },
      },
      success: {
        entry: ['storeToken'],
        on: {
          FETCH: [
            { target: 'fetching', cond: (context, event) => !!event.token },
            { target: 'idle', actions: ['clearToken'] },
          ],
        },
      },
    },
  },
  {
    actions: {
      storeToken: (context) => {
        localStorage.setItem(GITHUB_TOKEN, context.token);
      },
      clearToken: () => {
        localStorage.removeItem(GITHUB_TOKEN);
      },
    },
  }
);

function mapStateToIcon(
  state: State<Context, Events>
): 'incomplete' | 'complete' | 'danger' | 'loading' {
  if (state.matches('success')) {
    return 'complete';
  }
  if (state.matches('fetching')) {
    return 'loading';
  }
  if (state.matches('error')) {
    return 'danger';
  }
  return 'incomplete';
}

function mapStateToTitle(state: State<Context, Events>): string {
  if (state.matches('fetching')) {
    return 'Checking your token';
  }
  if (state.matches('success')) {
    return 'Setup complete';
  }
  if (state.matches('error')) {
    return 'Failure validating your token';
  }
  return 'Waiting for your token';
}

export const GitHubSettings: FC = () => {
  const [token, setToken] = useState(localStorage.getItem(GITHUB_TOKEN) ?? '');
  const [current, send] = useMachine(stateMachine);
  const location = useLocation();

  const onChangeToken = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const token = ev.target.value;
      setToken(token);
      send({ type: 'FETCH', token });
    },
    [send]
  );

  useEffect(() => {
    if (token) {
      send({ type: 'FETCH', token });
    }
  }, [send, token]);

  const steps: EuiStepsProps['steps'] = [
    {
      title: 'Create a GitHub token',
      children: (
        <EuiText>
          <p>
            Go to{' '}
            <EuiLink href="https://github.com/settings/tokens" target="_blank">
              GitHub
            </EuiLink>{' '}
            and click <em>Generate new token</em>. The token must have the{' '}
            <EuiCode>public_repo</EuiCode> permission for public repos and the full{' '}
            <EuiCode>repo</EuiCode> scope for private repos.
          </p>
          <p>
            Enable SSO for this token after creating it by clicking <em>Configure SSO</em> in the
            token list behind the generated token and then <em>Authorize</em>.
          </p>
        </EuiText>
      ),
    },
    {
      title: 'Enter your token',
      children: (
        <EuiFieldPassword
          disabled={current.matches('fetching')}
          value={token}
          onChange={onChangeToken}
        />
      ),
    },
    {
      title: mapStateToTitle(current),
      status: mapStateToIcon(current),
      children: (
        <EuiText>
          {current.matches('success') && <p>Hi {current.context.name} 👋 You are all setup.</p>}
          {current.matches('error.validationError') && (
            <EuiTextColor color="danger">{current.context.error}</EuiTextColor>
          )}
          {current.matches('error.invalidScope') && (
            <EuiTextColor color="danger">
              Your token is missing the <EuiCode>repo</EuiCode> permission.
            </EuiTextColor>
          )}
        </EuiText>
      ),
    },
  ];

  return (
    <EuiPageTemplate pageHeader={{ pageTitle: 'GitHub Settings' }}>
      {location.state && (
        <>
          <EuiCallOut color="danger">
            {location.state.statusCode === 403 && (
              <>
                Your token is not authorized to access the Elastic organization. Please make sure
                you follow the steps outlined under (1) below to authorize it for Single sign on.
              </>
            )}
            {location.state.statusCode !== 403 && (
              <>
                Your token got rejected from GitHub. Most often this means it expired, in which case
                you should regenerate it on{' '}
                <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                .
              </>
            )}
          </EuiCallOut>
          <EuiSpacer />
        </>
      )}
      <EuiSteps steps={steps} />
    </EuiPageTemplate>
  );
};
