import { useCallback, useContext, useEffect, useState } from "react";
import { dehydrate, QueryClient, useQueryClient } from "react-query";
import { Frequency, ROOMS_QUERY_KEY, TASKS_QUERY_KEY } from "../constants";
import { getRooms, useRoomsQuery } from "../hooks/useRooms";
import { useSaveTask } from "../hooks/useSaveTask";
import { getTasks } from "../hooks/useTasks";
import { NULL_ROOM_ID, NULL_TASK_ID, Room, Task } from "../types";
import { useDeleteTask } from "../hooks/useDeleteTask";
import { getNumberUrlParam } from "../helpers/url";
import { DiscardModalContext } from "../context/DiscardModalContext";
import { useRouter } from "next/router";
import {
  Alert,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import { NavBar } from "../components/NavBar";
import { GetServerSideProps } from "next";
import { TasksApiResponse } from "./api/tasks";
import { RoomsApiResponse } from "./api/rooms";

type Props = {
  initialTask: Task | undefined;
  title: string;
  rooms: Room[];
};

type TaskInputErrors = {
  name?: string;
};

const EditTask = ({ initialTask, title, rooms }: Props) => {
  const router = useRouter();

  const queryClient = useQueryClient();
  const { mutate: saveTask } = useSaveTask({
    onSettled: () => {
      queryClient.invalidateQueries(TASKS_QUERY_KEY);
      router.back();
    },
  });
  const { mutate: doDelete } = useDeleteTask({
    onSettled: () => {
      queryClient.invalidateQueries(TASKS_QUERY_KEY);
      router.back();
    },
  });

  const [task, setTask] = useState(new Task());
  const [isRoomDialogVisible, setIsRoomDialogVisible] = useState(false);
  const [isFreqDialogVisible, setIsFreqDialogVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [shouldShowDeleteModal, setShouldShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { discardModalState, setDiscardModalState } =
    useContext(DiscardModalContext) ?? {};

  const [errors, setErrors] = useState<TaskInputErrors>({});

  const showAlert = useCallback(
    (e: Event) => {
      console.log("vinihan - hasChanges");
      if (hasChanges) {
        e.preventDefault();

        setDiscardModalState?.({
          show: true,
          action: () => {},
          hasChanges: true,
        });
      }
    },
    [hasChanges, setDiscardModalState]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", showAlert);

    return () => {
      window.removeEventListener("beforeunload", showAlert);
    };
  }, [showAlert]);

  const showRoomDialog = () => setIsRoomDialogVisible(true);
  const hideRoomDialog = () => setIsRoomDialogVisible(false);
  const showFreqDialog = () => setIsFreqDialogVisible(true);
  const hideFreqDialog = () => setIsFreqDialogVisible(false);
  const showDatePicker = () => setIsDatePickerVisible(true);
  const hideDatePicker = () => setIsDatePickerVisible(false);

  const onSelectRoom = (room: Room) => {
    setTask((t) => ({ ...t, roomId: room.id }));
    hideRoomDialog();
    setHasChanges(true);
  };

  const onSelectFrequency = (frequency: Frequency) => {
    setTask((t) => ({ ...t, frequencyType: frequency }));
    hideFreqDialog();
  };

  const onChangeDate = (date: Date) => {
    setTask((t) => ({ ...t, lastDone: date }));
    hideDatePicker();
    setHasChanges(true);
  };

  const completeTask = () => {
    save({ ...task, lastDone: new Date() });
  };

  const save = (taskToSave: Task) => {
    if (!taskToSave.name) {
      setErrors((e) => ({ ...e, name: "You must enter a task name" }));
    } else {
      saveTask(taskToSave);
      setHasChanges(false);
    }
  };

  const deleteTask = () => {
    doDelete(task.id);
  };

  const roomName = rooms.find((room) => room.id === task.roomId)?.name ?? "";

  if (
    !initialTask ||
    initialTask.id === NULL_TASK_ID ||
    initialTask.roomId === NULL_ROOM_ID
  ) {
    return <Typography>------ERROR------</Typography>;
  }

  return (
    <>
      <NavBar title={title} />
      <TextField
        label="Name"
        value={task?.name}
        onChange={(e) => {
          setTask({ ...task, name: e.target.value });
          setHasChanges(true);
        }}
        sx={{ marginBottom: "10px" }}
      />
      {errors.name && (
        <Alert sx={{ color: "red", fontSize: 18 }}>{errors.name}</Alert>
      )}
      <Card onClick={showRoomDialog}>
        <Container sx={{ alignItems: "center", paddingVertical: "10px" }}>
          <Typography fontSize={"18px"}>Room: {roomName}</Typography>
        </Container>
      </Card>
      <Container
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Typography>Every</Typography>
        <TextField
          value={task.frequencyAmount?.toString()}
          type="numeric"
          onChange={(e) => {
            const newAmount = e.target.value ? parseInt(e.target.value) : 0;
            setTask((t) => ({ ...t, frequencyAmount: newAmount }));
            setHasChanges(true);
          }}
        />
        <Button
          onClick={() => {
            showFreqDialog();
            setHasChanges(true);
          }}
          variant="outlined"
        >
          {task.frequencyType}
        </Button>
      </Container>
      <Card onClick={showDatePicker}>
        <Container sx={{ alignItems: "center", paddingVertical: "10px" }}>
          <Typography fontSize={"18px"}>
            Last completed: {task.lastDone.toDateString()}
          </Typography>
        </Container>
      </Card>
      <Button
        color="success"
        onClick={completeTask}
        sx={{ marginTop: "10px" }}
        variant="contained"
      >
        Just did it!
      </Button>

      <Button
        sx={{ marginTop: "10px" }}
        variant="contained"
        onClick={() => save(task)}
      >
        Save
      </Button>

      <Dialog onClose={hideFreqDialog} open={isFreqDialogVisible}>
        <MenuItem
          key="days-radio-button"
          onClick={() => onSelectFrequency(Frequency.DAYS)}
          defaultChecked={task.frequencyType === Frequency.DAYS}
          value={Frequency.DAYS}
        >
          {Frequency.DAYS}
        </MenuItem>
        <MenuItem
          key="weeks-radio-button"
          onClick={() => onSelectFrequency(Frequency.WEEKS)}
          defaultChecked={task.frequencyType === Frequency.WEEKS}
          value={Frequency.WEEKS}
        >
          {Frequency.WEEKS}
        </MenuItem>
        <MenuItem
          key="months-radio-button"
          onClick={() => onSelectFrequency(Frequency.MONTHS)}
          defaultChecked={task.frequencyType === Frequency.MONTHS}
          value={Frequency.MONTHS}
        >
          {Frequency.MONTHS}
        </MenuItem>
        <MenuItem
          key="years-radio-button"
          onClick={() => onSelectFrequency(Frequency.YEARS)}
          defaultChecked={task.frequencyType === Frequency.YEARS}
          value={Frequency.YEARS}
        >
          {Frequency.YEARS}
        </MenuItem>
      </Dialog>

      <Dialog onClose={hideRoomDialog} open={isRoomDialogVisible}>
        <DialogContent>
          {rooms.map((room) => {
            return (
              <MenuItem
                key={room.id}
                onClick={() => onSelectRoom(room)}
                defaultChecked={task.roomId === room.id}
                value={room.name}
              >
                {room.name}
              </MenuItem>
            );
          })}
        </DialogContent>
      </Dialog>

      {isDatePickerVisible && (
        <DatePicker selected={task.lastDone} onChange={onChangeDate} />
      )}

      <Fab
        onClick={() => {
          setShouldShowDeleteModal(true);
        }}
        sx={{ position: "absolute", margin: 16, right: 0, bottom: 0 }}
      >
        <Delete />
      </Fab>
      <Dialog
        onClose={() => setShouldShowDeleteModal(false)}
        open={shouldShowDeleteModal}
      >
        <DialogContent>
          <DialogTitle>Are you sure you want to delete this task?</DialogTitle>
          <DialogActions>
            <Button onClick={deleteTask}>Yes</Button>
            <Button onClick={() => setShouldShowDeleteModal(false)}>No</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <Dialog
        onClose={() =>
          setDiscardModalState?.({
            show: false,
            action: () => {},
            hasChanges: true,
          })
        }
        open={Boolean(discardModalState?.show)}
      >
        <DialogContent>
          <DialogTitle>Save changes?</DialogTitle>
          <DialogActions>
            <Button>No</Button>
            <Button
              onClick={() => {
                save(task);
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default EditTask;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(TASKS_QUERY_KEY, getTasks);
  await queryClient.prefetchQuery(ROOMS_QUERY_KEY, getRooms);

  const { tasks, nextId } =
    queryClient.getQueryData<TasksApiResponse>(TASKS_QUERY_KEY) ?? {};
  const { rooms } =
    queryClient.getQueryData<RoomsApiResponse>(ROOMS_QUERY_KEY) ?? {};

  let initialTask: Task | undefined;
  let title: string = "";
  if (context.query.taskId !== undefined) {
    const taskId = getNumberUrlParam(context.query, "taskId");
    initialTask = tasks?.find((task) => task.id === taskId);
    title = "Edit Task";
  } else if (context.query.roomId !== undefined) {
    const roomId = getNumberUrlParam(context.query, "roomId");
    initialTask = new Task({ roomId, id: nextId });
    title = "New Task";
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      initialTask,
      title,
      rooms,
    },
  };
};