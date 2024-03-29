import { useQuery, UseQueryOptions } from "react-query";
import { Task } from "../types";
import { TASKS_QUERY_KEY } from "../constants";

type TasksResponse = {
  tasks: Task[];
  nextId: number;
};

export const useTasksQuery = (
  options?: UseQueryOptions<
    TasksResponse,
    Error,
    TasksResponse,
    typeof TASKS_QUERY_KEY
  >
) => {
  const queryResult = useQuery(TASKS_QUERY_KEY, getTasks, options);
  return {
    ...queryResult,
    tasks: queryResult.data?.tasks ?? [],
    nextId: queryResult.data?.nextId,
  };
};

const getTasks = (): Promise<TasksResponse> =>
  fetch(`/api/tasks`)
    .then((res) => res.json())
    .then((data) => ({ ...data, tasks: sanitizeTasksData(data.tasks) }));

const sanitizeTasksData = (data: unknown) => {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((item) => new Task(item));
};
