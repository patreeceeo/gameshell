import * as React from "react";
import { TFriendCollection } from "../state";

interface TFormData {
  selectedGameId: string;
  invitedUserNames: string[];
}

interface TGameCollection {
  [gameId: string]: {
    displayName: string;
  };
}

interface TProps {
  onSubmit?: (data: TFormData) => void;
  friendsByUserName: TFriendCollection;
  games: TGameCollection;
}

const WhatForm: React.ComponentType<TProps> = (props) => {
  return (
    <form onSubmit={handleSubmit}>
      <section>
        <header>Games</header>
        {Object.entries(props.games).map(([gameId, { displayName }]) => (
          <label key={gameId}>
            {displayName} <input type="radio" name="gameId" value={gameId} />
          </label>
        ))}
        {Object.keys(props.friendsByUserName).map((userName) => (
          <label key={userName}>
            {userName} <input type="radio" name="userName" value={userName} />
          </label>
        ))}
      </section>
    </form>
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // const data = new FormData(e.target as HTMLFormElement);
    // props.onSubmit({
    //   userName: data.get("userName") as string,
    // });
  }
};

export default WhatForm;
