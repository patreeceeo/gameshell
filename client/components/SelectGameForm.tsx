import * as React from "react";

interface TGameCollection {
  [gameId: string]: {
    displayName: string;
  };
}

interface TProps {
  onChange: (selectedGameId: string) => void;
  games: TGameCollection;
  selectedGameId: string | undefined;
}

export const SelectGameForm: React.ComponentType<TProps> = (props) => {
  const [selectedGameId, setSelectedGameId] = React.useState(
    props.selectedGameId
  );

  const handleChange = (gameId: string) => () => {
    setSelectedGameId(gameId);
    props.onChange(gameId);
  };

  return (
    <form>
      {Object.entries(props.games).map(([gameId, { displayName }]) => (
        <label key={gameId}>
          {displayName}{" "}
          <input
            type="radio"
            name="gameId"
            checked={gameId === selectedGameId}
            onChange={handleChange(gameId)}
          />
        </label>
      ))}
    </form>
  );
};

