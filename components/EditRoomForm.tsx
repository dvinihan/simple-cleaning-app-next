import { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { ROOMS_QUERY_KEY, HOME_ROUTE, TASKS_ROUTE } from "../constants";
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
import { ActionModal } from "../components/ActionModal";

type Props = {
  initialRoom: Room;
};

export const EditRoomForm = ({ initialRoom }: Props) => {
  const [room, setRoom] = useState(initialRoom);

  const router = useRouter();
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<{ name?: string }>({});

  const [hasChanges, setHasChanges] = useState(false);
  const [shouldShowDeleteModal, setShouldShowDeleteModal] = useState(false);
  const [discardModalState, setDiscardModalState] = useState<{
    open: boolean;
    redirectUrl: string;
  }>({ open: false, redirectUrl: "" });

  useEffect(() => {
    router.beforePopState(({ url }) => {
      if (hasChanges) {
        setDiscardModalState({ open: true, redirectUrl: url });
        return false;
      }
      return true;
    });
  }, [hasChanges, router]);

  const { mutate: saveRoom, isLoading: isLoadingSaveRoom } = useSaveRoom({
    onSettled: () => {
      queryClient.invalidateQueries(ROOMS_QUERY_KEY);
    },
  });
  const { mutate: doDelete } = useDeleteRoom({
    onSettled: () => {
      queryClient.invalidateQueries(ROOMS_QUERY_KEY);
      router.push(HOME_ROUTE);
    },
  });

  const save = async () => {
    if (!room.name) {
      setErrors((e) => ({ ...e, name: "You must enter a room name" }));
    } else {
      saveRoom(room);
      setHasChanges(false);
    }
  };

  return (
    <>
      <Container>
        <TextField
          fullWidth
          label="Name"
          onChange={(e) => {
            setRoom({ ...room, name: e.target.value });
            setHasChanges(true);
          }}
          sx={{ backgroundColor: "white", marginY: "10px" }}
          value={room?.name}
        />
        {errors.name && (
          <Alert severity="error" sx={{ fontSize: "18px" }}>
            {errors.name}
          </Alert>
        )}
        <ActionButton
          onClick={() => {
            save();
            router.push(`${TASKS_ROUTE}?roomId=${room.id}`);
          }}
          text="Save"
        />
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

      <ActionModal
        onClose={() => setShouldShowDeleteModal(false)}
        onConfirm={() => doDelete(room.id)}
        onDeny={() => setShouldShowDeleteModal(false)}
        open={shouldShowDeleteModal}
        title="Are you sure you want to delete this room?"
      />

      <ActionModal
        onClose={() => setDiscardModalState({ open: false, redirectUrl: "" })}
        onConfirm={() => {
          save();
          router.push(discardModalState.redirectUrl);
        }}
        onDeny={() => {
          router.push(discardModalState.redirectUrl);
        }}
        open={discardModalState.open}
        title="Save changes?"
      />
    </>
  );
};
