import * as React from "react";

interface TFormData {
  selectedGameId: string;
}

interface TGameCollection {
  [gameId: string]: {
    displayName: string;
  };
}

interface TProps {
  onSubmit?: (data: TFormData) => void;
  games: TGameCollection;
}

export const SelectGameForm: React.ComponentType<TProps> = (props) => {
  return (
    <form onSubmit={handleSubmit}>
      {Object.entries(props.games).map(([gameId, { displayName }]) => (
        <label key={gameId}>
          {displayName} <input type="radio" name="gameId" value={gameId} />
        </label>
      ))}
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

