import { Add } from "@mui/icons-material";
import { Box, Fab } from "@mui/material";
import { NEW_ROOM_ROUTE, TASKS_ROUTE } from "../constants";
import { useRoomsQuery } from "../hooks/useRooms";
import { FocusedTaskList } from "../components/FocusedTaskList";
import { ListItem } from "../components/ListItem";
import Link from "next/link";
import { LoadingPage } from "../components/LoadingPage";
import { NavBar } from "../components/NavBar";

const Home = () => {
  const { rooms, isLoading } = useRoomsQuery();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <NavBar title="Rooms" />
      <Box>
        <FocusedTaskList type="overdue" />
        <FocusedTaskList type="upcoming" />
        {rooms.map((room) => (
          <ListItem
            href={`${TASKS_ROUTE}?roomId=${room.id}`}
            key={room.id}
            text={room.name}
          />
        ))}
      </Box>
      <Fab
        sx={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
        }}
      >
        <Link href={`${NEW_ROOM_ROUTE}?origin=${window.location.href}`}>
          <Add />
        </Link>
      </Fab>
    </>
  );
};

export default Home;
