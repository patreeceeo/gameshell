import * as React from "react";
// import * as socketIO from "socket.io-client";
// import { IUser } from "../../server/state";
import { useMachine } from "@xstate/react";
import Machine from "../state";

// const socket = socketIO();

const Concierge: React.ComponentType<{}> = () => {
  // const [players, setPlayers] = React.useState<IUser[]>([]);

  // React.useEffect(() => {
  //   socket.on("addPlayer", ({ players }: { players: any[] }) =>
  //     setPlayers(players)
  //   );
  // }, [socket]);

  // function handleSubmit(e: React.FormEvent) {
  //   e.preventDefault();
  //   const data = new FormData(e.target as HTMLFormElement);
  //   socket.emit("arrive", { userName: data.get("userName") });
  // }

  const [state, send] = useMachine(Machine);

  return (
    <div>
      <h1>Who goes there?</h1>
      {state.matches("who") && (
        <form onSubmit={handleSubmit}>
          <input type="text" name="userName" />
        </form>
      )}
      <ul>
        {!state.matches("who") && <li>{state.context.userNameLocal}</li>}
        {listFriends().map(([userName]) => (
          <li key={userName}>{userName}</li>
        ))}
      </ul>
      <h1>What are we doing here?</h1>
    </div>
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    send({ type: "IDENTIFY_USER", userName: data.get("userName") as string });
  }

  function listFriends() {
    return Object.entries(state.context.friendsByUserName);
  }
};

export default Concierge;
