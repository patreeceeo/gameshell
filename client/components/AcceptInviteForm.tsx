import * as React from "react";
import { TGameCollection } from "../state";
import * as Invites from "../../models/InviteCollection";

interface TProps {
  onAccept: (userNameRemote: string) => void;
  invitesRecievedByUserName: Invites.TTabularMap;
  games: TGameCollection;
}

export const AcceptInviteForm: React.ComponentType<TProps> = (props) => {
  const handleAccept = (userNameRemote: string) => () => {
    props.onAccept(userNameRemote);
  };

  return (
    <ul>
      {[...props.invitesRecievedByUserName.entries()].map(
        ([userNameRemote, { gameId }]) => (
          <li key={userNameRemote} aria-label={`invite from ${userNameRemote}`}>
            {gameId &&
              `${userNameRemote} has invited you to play ${
                props.games[gameId].displayName || "TBD"
              }!`}
            <button
              aria-label="accept invite"
              onClick={handleAccept(userNameRemote)}
            >
              accept
            </button>
          </li>
        )
      )}
    </ul>
  );
};
