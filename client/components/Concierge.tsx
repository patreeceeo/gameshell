import * as React from "react";
import { useMachine } from "@xstate/react";
import Machine, { TInviteRecieved } from "../state";
import WhoForm from "./WhoForm";
import { InviteForm, SelectGameForm, AcceptInviteForm } from ".";
import {
  onFriendsArrive,
  onFriendsDepart,
  onRecieveInvites,
} from "../requests";
import { IUser } from "../../server/state";

const gamesEnabled = {
  snake: {
    displayName: "Wrastle Snake",
  },
  min3test: {
    displayName: "Test minimum players",
  },
};

const Concierge: React.ComponentType<{}> = () => {
  const [state, send] = useMachine(Machine);
  React.useEffect(() => {
    onFriendsArrive((users: IUser[]) => {
      console.log("FRIENDS_ARRIVE", users);
      send({ type: "FRIENDS_ARRIVE", users });
    });
    onFriendsDepart((userNames: string[]) => {
      console.log("FRIENDS_DEPART", userNames);
      send({ type: "FRIENDS_DEPART", userNames });
    });
    onRecieveInvites((invites: TInviteRecieved[]) => {
      console.log("RECIEVE_INVITES", invites);
      send({ type: "RECIEVE_INVITES", payload: invites });
    });
  });

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
          {state.context.friendsByUserName.serialize().map(({ userName }) => (
            <li key={userName}>{userName}</li>
          ))}
        </ul>
      </section>
      {(state.matches("what") || state.matches("respondToInvites.waiting")) && (
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
      Current state: {JSON.stringify(state.value)}
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
};

export default Concierge;
