import * as React from "react";
// import * as socketIO from "socket.io-client";
// import { IUser } from "../../server/state";
import { useMachine } from "@xstate/react";
import Machine from "../state";
import WhoForm from "./WhoForm";
import { InviteForm, SelectGameForm, AcceptInviteForm } from ".";

// const socket = socketIO();

const gamesEnabled = {
  snake: {
    displayName: "Wrastle Snake",
  },
  min3test: {
    displayName: "Test minimum players",
  },
};

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
    <main>
      <section>
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
      </section>
      {state.matches("what") && (
        <section>
          <h1>What are we doing here?</h1>
          <AcceptInviteForm
            games={gamesEnabled}
            invitesRecievedByUserName={state.context.invitesRecievedByUserName}
            onAccept={handleAcceptInvite}
          />
          <h2>Choose a game</h2>
          <SelectGameForm
            games={gamesEnabled}
            selectedGameId={state.context.selectedGameId}
            onChange={handleChangeSelectedGame}
          />
          <h2>Invite friends</h2>
          <InviteForm
            friendsByUserName={state.context.friendsByUserName}
            onSubmit={handleSubmitInvites}
          />
        </section>
      )}
      <footer>
        <small>
          <i>gametheory</i> v0.1e-42, copyleft 2020{" "}
          <a href="https://patrickcanfield.com">Patrick Canfield</a>
        </small>
      </footer>
    </main>
  );

  function handleSubmitWho({ userName }: { userName: string }) {
    send({ type: "IDENTIFY_USER", userName });
  }

  function handleChangeSelectedGame(gameId: string) {
    send({ type: "SELECT_GAME", gameId });
  }

  function handleSubmitInvites(userNames: string[]) {
    send({ type: "INVITE_FRIENDS", userNames });
  }

  function handleAcceptInvite(userNameRemote: string) {
    send({ type: "ACCEPT_INVITE", userNameRemote });
  }

  function listFriends() {
    return Object.entries(state.context.friendsByUserName);
  }
};

export default Concierge;
