import { useMemo, useState } from "react";
import { Frequency, TASKS_ROUTE } from "../constants";
import { useRoomsQuery } from "../queries/useRooms";
import { useSaveTask } from "../queries/useSaveTask";
import { Task } from "../types";
import { useDeleteTask } from "../queries/useDeleteTask";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Fab,
  TextField,
  Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import { ActionButton } from "../components/ActionButton";
import { PickerModal } from "../components/PickerModal";
import "react-datepicker/dist/react-datepicker.css";
import { DiscardModal } from "./DiscardModal";
import { useAppContext } from "../context/use-app-context";
import { DeleteModal } from "./DeleteModal";
import { AppReducerActions } from "../context/types";
import { useOriginParam } from "../hooks/useOriginParam";

type Props = {
  initialTask: Task;
};

const EditTaskForm = ({ initialTask }: Props) => {
  const [task, setTask] = useState(initialTask);
  const { dispatch } = useAppContext();
  const pageOrigin = useOriginParam();
  const backUrl =
    pageOrigin === "home" ? "/" : `${TASKS_ROUTE}?roomId=${task.roomId}`;

  const router = useRouter();

  const { rooms } = useRoomsQuery();

  const { mutate: saveTask } = useSaveTask({
    onMutate: () => {
      dispatch({
        type: AppReducerActions.SET_HAS_CHANGES_ACTION,
        payload: false,
      });
    },
    onSuccess: () => {
      router.push(backUrl);
    },
  });
  const { mutate: doDelete } = useDeleteTask({
    onSuccess: () => {
      router.push(backUrl);
    },
  });

  const [isRoomDialogVisible, setIsRoomDialogVisible] = useState(false);
  const [isFreqDialogVisible, setIsFreqDialogVisible] = useState(false);
  const [shouldShowDeleteModal, setShouldShowDeleteModal] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  const onSelectRoom = (roomName: string) => {
    const room = rooms.find((r) => r.name === roomName);
    if (room) {
      setTask((t) => ({ ...t, roomId: room.id }));
      dispatch({
        type: AppReducerActions.SET_HAS_CHANGES_ACTION,
        payload: true,
      });
    }
    setIsRoomDialogVisible(false);
  };

  const onSelectFrequency = (frequency: Frequency) => {
    setTask((t) => ({ ...t, frequencyType: frequency }));
    setIsFreqDialogVisible(false);
    dispatch({
      type: AppReducerActions.SET_HAS_CHANGES_ACTION,
      payload: true,
    });
  };

  const onChangeDate = (date: Date) => {
    setTask((t) => ({ ...t, lastDone: date.getTime() }));
    dispatch({
      type: AppReducerActions.SET_HAS_CHANGES_ACTION,
      payload: true,
    });
  };

  const save = (taskToSave: Task) => {
    if (!taskToSave.name) {
      setErrors((e) => ({ ...e, name: "You must enter a task name" }));
    } else {
      saveTask(taskToSave);
    }
  };

  const roomName = useMemo(
    () => rooms.find((room) => room.id === task.roomId)?.name ?? "",
    [rooms, task.roomId]
  );

  return (
    <>
      <Container>
        <TextField
          fullWidth
          label="Name"
          name="Name"
          onChange={(e) => {
            setTask({ ...task, name: e.target.value });
            dispatch({
              type: AppReducerActions.SET_HAS_CHANGES_ACTION,
              payload: true,
            });
          }}
          sx={{ backgroundColor: "white", marginY: "10px" }}
          value={task.name}
        />
        {errors.name && (
          <Alert severity="error" sx={{ fontSize: 18 }}>
            {errors.name}
          </Alert>
        )}
        <Card
          onClick={() => setIsRoomDialogVisible(true)}
          sx={{ alignItems: "center", paddingY: "10px", marginY: "10px" }}
        >
          <Container>
            <Typography fontSize={"18px"}>Room: {roomName}</Typography>
          </Container>
        </Card>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginY: "10px",
            paddingY: "10px",
          }}
        >
          <Typography>Every</Typography>
          <TextField
            name="Frequency Amount"
            onChange={(e) => {
              const newAmount = e.target.value ? parseInt(e.target.value) : 0;
              setTask((t) => ({ ...t, frequencyAmount: newAmount }));
              dispatch({
                type: AppReducerActions.SET_HAS_CHANGES_ACTION,
                payload: true,
              });
            }}
            sx={{ backgroundColor: "white", marginX: "10px" }}
            type="numeric"
            value={task.frequencyAmount?.toString()}
          />
          <Button
            onClick={() => {
              setIsFreqDialogVisible(true);
              dispatch({
                type: AppReducerActions.SET_HAS_CHANGES_ACTION,
                payload: true,
              });
            }}
            variant="outlined"
          >
            {task.frequencyType}
          </Button>
        </Box>

        <Typography fontSize="18px">Last completed:</Typography>
        <DatePicker
          className="date-picker"
          name="Last completed"
          onChange={onChangeDate}
          openToDate={new Date()}
          selected={new Date(task.lastDone)}
        />

        <ActionButton
          color="success"
          onClick={() => save({ ...task, lastDone: new Date() })}
          text="Just did it!"
        />
        <ActionButton onClick={() => save(task)} text="Save" />
      </Container>

      <PickerModal
        onClose={() => setIsFreqDialogVisible(false)}
        onSelect={(value) => onSelectFrequency(value as Frequency)}
        open={isFreqDialogVisible}
        options={[
          Frequency.DAYS,
          Frequency.WEEKS,
          Frequency.MONTHS,
          Frequency.YEARS,
        ]}
      />

      <PickerModal
        onClose={() => setIsRoomDialogVisible(false)}
        onSelect={onSelectRoom}
        open={isRoomDialogVisible}
        options={rooms.map((r) => r.name)}
      />

      <Fab
        onClick={() => setShouldShowDeleteModal(true)}
        sx={{ position: "fixed", right: "16px", bottom: "16px" }}
      >
        <Delete />
      </Fab>

      <DeleteModal
        onClose={() => setShouldShowDeleteModal(false)}
        onDelete={() => doDelete(task.id)}
        open={shouldShowDeleteModal}
        title="Are you sure you want to delete this task?"
      />

      <DiscardModal onSave={() => save(task)} />
    </>
  );
};
export default EditTaskForm;
