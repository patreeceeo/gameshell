import * as React from "react";
import { TFriendCollection } from "../state";
import { partial } from "../../utils";
import produce from "immer";

type TFormData = string[];

interface TProps {
  onSubmit?: (data: TFormData) => void;
  friendsByUserName: TFriendCollection;
}

export const InviteForm: React.ComponentType<TProps> = (props) => {
  const [friendsByUserName, setFriendsByUserName] = React.useState(
    props.friendsByUserName
  );

  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(props.friendsByUserName).map((userName) => {
        const label = `invite ${userName}`;
        return (
          <label key={userName} aria-label={label}>
            <input
              type="checkbox"
              name={userName}
              checked={friendsByUserName[userName].isInvited}
              onChange={partial(handleChange, userName)}
            />
            {userName}
          </label>
        );
      })}
      <input
        type="button"
        aria-label="invite everyone"
        onClick={inviteAll}
        value="invite all"
      />
      <input type="submit" aria-label="send invites" value="send" />
    </form>
  );

  function inviteAll() {
    setFriendsByUserName(
      produce(friendsByUserName, (draft: TFriendCollection) => {
        Object.keys(draft).forEach((key) => (draft[key].isInvited = true));
      })
    );
  }

  function handleChange(userName: string) {
    setFriendsByUserName(
      produce(friendsByUserName, (draft: TFriendCollection) => {
        draft[userName].isInvited = !draft[userName].isInvited;
      })
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    props.onSubmit(
      Object.entries(friendsByUserName)
        .filter(([_, { isInvited }]) => {
          return isInvited;
        })
        .map(([userName]) => userName)
    );
  }
};

InviteForm.defaultProps = {
  onSubmit: (data) => {
    void data;
  },
};
