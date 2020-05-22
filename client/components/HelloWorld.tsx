import * as React from "react";
import * as socketIO from "socket.io-client";
import { IUser } from "../../server/state";

const socket = socketIO();

const HW: React.ComponentType<{}> = () => {
  const [players, setPlayers] = React.useState<IUser[]>([]);

  React.useEffect(() => {
    socket.on("addPlayer", ({ players }: { players: any[] }) =>
      setPlayers(players)
    );
  }, [socket]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    socket.emit("arrive", { userName: data.get("userName") });
  }

  return (
    <>
      <h1>Who goes there?</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="userName" />
      </form>
      <ul>
        {players.map(({ userName }) => (
          <li key={userName}>{userName}</li>
        ))}
      </ul>
    </>
  );
};

export default HW;
