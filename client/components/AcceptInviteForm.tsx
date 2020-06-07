import * as React from "react";
import { TInvitesRecievedCollection, TGameCollection } from "../state";

interface TProps {
  onAccept: (userNameRemote: string) => void;
  invitesRecievedByUserName: TInvitesRecievedCollection;
  games: TGameCollection;
}

export const AcceptInviteForm: React.ComponentType<TProps> = (props) => {
  const handleAccept = (userNameRemote: string) => () => {
    props.onAccept(userNameRemote);
  };

  return (
    <ul>
      {Object.entries(props.invitesRecievedByUserName).map(
        ([userNameRemote, { gameId }]) => (
          <li key={userNameRemote} aria-label={`invite from ${userNameRemote}`}>
            {gameId &&
              `${userNameRemote} wants to play ${props.games[gameId].displayName}`}
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

