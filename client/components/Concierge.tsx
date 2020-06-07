import * as React from "react";
// import * as socketIO from "socket.io-client";
// import { IUser } from "../../server/state";
import { useMachine } from "@xstate/react";
import Machine from "../state";
import WhoForm from "./WhoForm";
import { InviteForm } from ".";

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

  const [state, send] = useMachine(Machine, {
    context: {
      friendsByUserName: {
        tom: {
          isInvited: false,
          hasAcceptedInvite: false,
        },
        jerry: {
          isInvited: false,
          hasAcceptedInvite: false,
        },
      },
    },
  });

  return (
    <div>
      <h1>Who goes there?</h1>
      {state.matches("who") && <WhoForm onSubmit={handleSubmitWho} />}
      <ul>
        {state.context.userNameLocal && (
          <li>
            {state.context.userNameLocal} ({"<=="} that's you!)
          </li>
        )}
        {listFriends().map(([userName]) => (
          <li key={userName}>{userName}</li>
        ))}
      </ul>
      <h1>What are we doing here?</h1>
      {state.matches("what") && (
        <InviteForm friendsByUserName={state.context.friendsByUserName} />
      )}
      <small>
        <i>gametheory</i> v0.1e-42, copyleft 2020{" "}
        <a href="https://patrickcanfield.com">Patrick Canfield</a>
      </small>
    </div>
  );

  function handleSubmitWho({ userName }: { userName: string }) {
    send({ type: "IDENTIFY_USER", userName });
  }

  function listFriends() {
    return Object.entries(state.context.friendsByUserName);
  }
};

export default Concierge;
