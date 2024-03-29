import { useState } from "react";
import { HOME_ROUTE, TASKS_ROUTE } from "../constants";
import { useDeleteRoom } from "../queries/useDeleteRoom";
import { useSaveRoom } from "../queries/useSaveRoom";
import { Room } from "../types";
import { useRouter } from "next/router";
import {
  Alert,
  CircularProgress,
  Container,
  Fab,
  Modal,
  TextField,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { ActionButton } from "../components/ActionButton";
import { useAppContext } from "../context/use-app-context";
import { DiscardModal } from "./DiscardModal";
import { DeleteModal } from "./DeleteModal";
import { AppReducerActions } from "../context/types";

type Props = {
  initialRoom: Room;
};

export const EditRoomForm = ({ initialRoom }: Props) => {
  const [room, setRoom] = useState(initialRoom);
  const { dispatch } = useAppContext();

  const router = useRouter();

  const [errors, setErrors] = useState<{ name?: string }>({});

  const [shouldShowDeleteModal, setShouldShowDeleteModal] = useState(false);

  const { mutate: saveRoom, isLoading: isLoadingSaveRoom } = useSaveRoom({
    onMutate: () => {
      dispatch({
        type: AppReducerActions.SET_HAS_CHANGES_ACTION,
        payload: false,
      });
    },
    onSuccess: () => {
      router.push(`${TASKS_ROUTE}?roomId=${room.id}`);
    },
  });
  const { mutate: deleteRoom } = useDeleteRoom({
    onSuccess: () => {
      router.push(HOME_ROUTE);
    },
  });

  const handleSave = () => {
    if (!room.name) {
      setErrors((e) => ({ ...e, name: "You must enter a room name" }));
    } else {
      saveRoom(room);
    }
  };

  return (
    <>
      <Container>
        <TextField
          fullWidth
          label="Name"
          name="Name"
          onChange={(e) => {
            setRoom({ ...room, name: e.target.value });
            dispatch({
              type: AppReducerActions.SET_HAS_CHANGES_ACTION,
              payload: true,
            });
          }}
          sx={{ backgroundColor: "white", marginY: "10px" }}
          value={room?.name}
        />
        {errors.name && (
          <Alert severity="error" sx={{ fontSize: "18px" }}>
            {errors.name}
          </Alert>
        )}
        <ActionButton onClick={handleSave} text="Save" />
      </Container>

      <Modal open={isLoadingSaveRoom}>
        <CircularProgress />
      </Modal>

      <Fab
        onClick={() => setShouldShowDeleteModal(true)}
        sx={{ position: "fixed", right: "16px", bottom: "16px" }}
      >
        <Delete />
      </Fab>

      <DeleteModal
        onClose={() => setShouldShowDeleteModal(false)}
        onDelete={() => deleteRoom(room.id)}
        open={shouldShowDeleteModal}
        title="Are you sure you want to delete this room?"
      />

      <DiscardModal onSave={handleSave} />
    </>
  );
};
