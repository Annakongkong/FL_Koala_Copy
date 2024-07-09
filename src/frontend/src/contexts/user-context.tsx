'use client';

import * as React from 'react';
import { useEffect } from 'react';
import {
  ExecutedScript,
  ExecutionData,
  isFirstResponse,
  parseExecution,
  updateExecutedScriptsStatus,
} from '@/app/dashboard/execution/page';
import { listExecutions } from '@/services/common';

import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  syncing: boolean;
  checkSession?: () => Promise<void>;
  executedScripts: ExecutedScript[];
  fetchExecutions: () => Promise<void>;
  setExecutedScripts: React.Dispatch<React.SetStateAction<ExecutedScript[]>>;
  addExecutedScript: (script: AddNewScript) => void;
  executionCount: number;
  setExecutionCount: React.Dispatch<React.SetStateAction<number>>;
  startEventSource: () => void;
  stopEventSource: () => void;
  setSyncing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export interface AddNewScript {
  taskId: string;
  name: string;
  startTime: string;
  executionStatus: string;
  scriptId: string;
  executionId: string;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<{ user: User | null; error: string | null; isLoading: boolean }>({
    user: null,
    error: null,
    isLoading: true,
  });

  const [executedScripts, setExecutedScripts] = React.useState<ExecutedScript[]>([]);
  const [executionCount, setExecutionCount] = React.useState<number>(0);
  const [syncing, setSyncing] = React.useState<boolean>(false);
  const eventSourceRef = React.useRef<EventSource | null>(null);

  const addExecutedScript = (script: AddNewScript) => {
    let newScript: ExecutedScript = {
      executionId: (executedScripts.length + 1).toString(),
      index: (executedScripts.length + 1).toString(),
      taskId: script.taskId,
      name: script.name,
      startTime: script.startTime,
      endTime: null,
      executionStatus: script.executionStatus,
      scriptId: script.scriptId,
    };
    setExecutedScripts((prevScripts) => [...prevScripts, newScript]);
    setExecutionCount((prevCount) => prevCount + 1);
    if (eventSourceRef.current) {
      // If EventSource is excuting，ensure continue listenning new script
      startEventSource();
    }
  };

  const startEventSource = React.useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Check if there is script running
    const hasRunningScripts = executedScripts.some((script) => script.executionStatus === 'running');
    if (!hasRunningScripts) return;

    eventSourceRef.current = new EventSource(`http://localhost:8080/api/execute/status/all`);

    const handleEventMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log('EventSource data:', data);
      if (isFirstResponse(data)) {
        const updatedExecutedScripts = updateExecutedScriptsStatus(executedScripts, data.data);
        setExecutedScripts(updatedExecutedScripts);
      } else {
        // Process the second message to update the statuses
        setExecutedScripts((prevScripts) => {
          const updatedScripts = prevScripts.map((script) => {
            if (data.data.success.includes(script.taskId)) {
              return { ...script, executionStatus: 'success', endTime: new Date().toLocaleString() };
            }
            if (data.data.failed.includes(script.taskId)) {
              return { ...script, executionStatus: 'failed', endTime: new Date().toLocaleString() };
            }
            if (data.data.running.includes(script.taskId)) {
              return { ...script, executionStatus: 'running' };
            }
            return script;
          });
          return updatedScripts;
        });
      }

      // Check if there are no more running tasks
      if (data.data.running.length === 0 && eventSourceRef.current) {
        eventSourceRef.current.close();
        setState((prev) => ({ ...prev, isRunning: false }));
      }
    };
    eventSourceRef.current?.onmessage(handleEventMessage);
  }, [executedScripts]);

  const stopEventSource = React.useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  }, []);
  const fetchExecutions = async () => {
    if (!state.user) return;
    try {
      const response = await listExecutions(state.user.id);
      if (response.success) {
        setExecutedScripts(
          response.data.map((execution: ExecutionData, index: number) => parseExecution(execution, index + 1))
        );
        setExecutionCount(response.data.length);
      } else {
        console.error('Failed to fetch execution records');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch execution records', error);
    }
  };
  // NOTE call checkSession to get the user on mount
  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await authClient.getUser();
      if (error) {
        logger.error(error);
        localStorage.removeItem('custom-auth-token');
        setState((prev) => ({ ...prev, user: null, error: 'Something went wrong', isLoading: false }));
        return;
      }
      setState((prev) => ({ ...prev, user: data ?? null, error: null, isLoading: false }));
      // Fetch executions after getting the user
      if (!data) {
        return;
      }
      // data.id = userid
      await fetchExecutions();
    } catch (err) {
      logger.error(err);
      setState((prev) => ({ ...prev, user: null, error: 'Something went wrong', isLoading: false }));
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((err) => {
      logger.error(err);
      // redirect to login page

      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, []);

  React.useEffect(() => {
    return () => {
      stopEventSource();
    };
  }, [stopEventSource]);

  return (
    <UserContext.Provider
      value={{
        ...state,
        checkSession,
        executedScripts,
        fetchExecutions,
        syncing,
        setExecutedScripts,
        addExecutedScript,
        setSyncing,
        executionCount,
        setExecutionCount,
        startEventSource,
        stopEventSource,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const UserConsumer = UserContext.Consumer;
