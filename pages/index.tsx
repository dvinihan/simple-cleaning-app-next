import { Add } from "@mui/icons-material";
import { Box, Fab } from "@mui/material";
import { NEW_ROOM_ROUTE, TASKS_ROUTE } from "../constants";
import { useRoomsQuery } from "../queries/useRooms";
import { FocusedTaskList } from "../components/FocusedTaskList";
import { ListItem } from "../components/ListItem";
import Link from "next/link";
import { LoadingPage } from "../components/LoadingPage";
import { NavBar } from "../components/NavBar";
import { useGetTaskMap } from "../hooks/useGetTaskMap";

const Home = () => {
  const { rooms, isLoading } = useRoomsQuery();

  const { overdueTasks, upcomingTasks } = useGetTaskMap();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <NavBar title="Rooms" />
      <Box>
        <FocusedTaskList
          origin="home"
          tasksToDisplay={overdueTasks}
          title="Overdue tasks"
        />
        <FocusedTaskList
          origin="home"
          tasksToDisplay={upcomingTasks}
          title="Upcoming tasks"
        />
        {rooms.map((room) => (
          <ListItem
            dataTestId="room-link"
            href={`${TASKS_ROUTE}?roomId=${room.id}`}
            key={room.id}
            text={room.name}
          />
        ))}
      </Box>
      <Link href={NEW_ROOM_ROUTE}>
        <Fab
          sx={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
          }}
        >
          <Add />
        </Fab>
      </Link>
    </>
  );
};

export default Home;
