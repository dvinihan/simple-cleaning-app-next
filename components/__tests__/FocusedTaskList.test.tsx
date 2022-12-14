import { FocusedTaskList } from "../FocusedTaskList";
import { Frequency } from "../../constants";
import { withQueryClient } from "../../util/test-utils";
import { useRoomsQuery } from "../../hooks/useRooms";
import { useTasksQuery } from "../../hooks/useTasks";
import { screen } from "@testing-library/react";

jest.mock("../../hooks/useRooms.ts");
jest.mock("../../hooks/useTasks.ts");

const mockRooms = {
  rooms: [
    { id: 0, name: "Family Room" },
    { id: 1, name: "Living Room" },
  ],
};
const mockTasks = {
  tasks: [
    {
      id: 0,
      frequencyAmount: 7,
      frequencyType: Frequency.DAYS,
      lastDone: new Date("1/1/22"),
      name: "Do dishes",
      roomId: 0,
    },
    {
      id: 1,
      frequencyAmount: 7,
      frequencyType: Frequency.MONTHS,
      lastDone: new Date("4/18/22"),
      name: "Take out trash",
      roomId: 0,
    },
    {
      id: 2,
      frequencyAmount: 2,
      frequencyType: Frequency.WEEKS,
      lastDone: new Date("11/1/22"),
      name: "Laundry",
      roomId: 1,
    },
    {
      id: 3,
      frequencyAmount: 2,
      frequencyType: Frequency.WEEKS,
      lastDone: new Date("11/4/22"),
      name: "clean baby",
      roomId: 1,
    },
  ],
};

beforeEach(() => {
  (useRoomsQuery as jest.Mock).mockReturnValue(mockRooms);
  (useTasksQuery as jest.Mock).mockReturnValue(mockTasks);
});

it("overdue tasks - no room id", async () => {
  jest.useFakeTimers().setSystemTime(new Date("11/17/2022"));
  withQueryClient(<FocusedTaskList type="overdue" />);
  expect(screen.queryByText("Overdue tasks")).toBeVisible();
  expect(screen.queryByText("Do dishes")).toBeVisible();
  expect(screen.queryByText("Laundry")).toBeVisible();
  expect(screen.queryByText("Take out trash")).not.toBeInTheDocument();
  expect(screen.queryByText("clean baby")).not.toBeInTheDocument();
  expect(screen.getByTestId("task-Laundry").getAttribute("href")).toBe(
    `/editTask?taskId=2&origin=${window.location.href}`
  );
});

it("upcoming tasks - no room id", () => {
  jest.useFakeTimers().setSystemTime(new Date("11/17/2022"));
  withQueryClient(<FocusedTaskList type="upcoming" />);
  expect(screen.queryByText("Upcoming tasks")).toBeVisible();
  expect(screen.queryByText("Do dishes")).not.toBeInTheDocument();
  expect(screen.queryByText("Laundry")).not.toBeInTheDocument();
  expect(screen.queryByText("Take out trash")).toBeVisible();
  expect(screen.queryByText("clean baby")).toBeVisible();
  expect(screen.getByTestId("task-clean baby").getAttribute("href")).toBe(
    `/editTask?taskId=3&origin=${window.location.href}`
  );
});

it("overdue tasks - with room id", () => {
  jest.useFakeTimers().setSystemTime(new Date("11/17/2022"));
  withQueryClient(<FocusedTaskList roomId={0} type="overdue" />);
  expect(screen.queryByText("Overdue tasks")).toBeVisible();
  expect(screen.queryByText("Do dishes")).toBeVisible();
  expect(screen.queryByText("Laundry")).not.toBeInTheDocument();
  expect(screen.queryByText("Take out trash")).not.toBeInTheDocument();
  expect(screen.queryByText("clean baby")).not.toBeInTheDocument();
  expect(screen.getByTestId("task-Do dishes").getAttribute("href")).toBe(
    `/editTask?taskId=0&origin=${window.location.href}`
  );
});

it("upcoming tasks - with room id", () => {
  jest.useFakeTimers().setSystemTime(new Date("11/17/2022"));
  withQueryClient(<FocusedTaskList roomId={0} type="upcoming" />);
  expect(screen.queryByText("Upcoming tasks")).toBeVisible();
  expect(screen.queryByText("Do dishes")).not.toBeInTheDocument();
  expect(screen.queryByText("Laundry")).not.toBeInTheDocument();
  expect(screen.queryByText("Take out trash")).toBeVisible();
  expect(screen.queryByText("clean baby")).not.toBeInTheDocument();
  expect(screen.getByTestId("task-Take out trash").getAttribute("href")).toBe(
    `/editTask?taskId=1&origin=${window.location.href}`
  );
});

it("overdue tasks - render nothing", () => {
  jest.useFakeTimers().setSystemTime(new Date("11/17/2021"));
  withQueryClient(<FocusedTaskList type="overdue" />);
  expect(screen.queryByText("Overdue tasks")).not.toBeInTheDocument();
  expect(screen.queryByTestId(/task-.*/)).not.toBeInTheDocument;
});

it("upcoming tasks - render nothing", () => {
  jest.useFakeTimers().setSystemTime(new Date("11/17/2021"));
  withQueryClient(<FocusedTaskList type="upcoming" />);
  expect(screen.queryByText("Upcoming tasks")).not.toBeInTheDocument();
  expect(screen.queryByTestId(/task-.*/)).not.toBeInTheDocument;
});
