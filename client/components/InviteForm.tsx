import * as React from "react";
import { TFriendCollection, FriendCollection } from "../state";
import produce from "immer";
import { partial } from "../../utils";

type TFormData = string[];

interface TProps {
  onSubmit?: (data: TFormData) => void;
  friendsByUserName: TFriendCollection;
}

export const InviteForm: React.ComponentType<TProps> = (props) => {
  const [friendsByUserName, setFriendsByUserName] = React.useState(
    props.friendsByUserName
  );

  React.useEffect(() => {
    console.log("updating friends", props.friendsByUserName);
    setFriendsByUserName(
      FriendCollection.resolveConflicts(
        friendsByUserName,
        props.friendsByUserName
      )
    );
  });

  return (
    <form onSubmit={handleSubmit}>
      <table>
        <tbody>
          {Object.entries(friendsByUserName).map(([userName, info]) => {
            return (
              <Row
                key={userName}
                userName={userName}
                {...info}
                onChange={partial(handleChange, userName)}
                systemHasAckInvite={
                  props.friendsByUserName[userName]?.isInvited
                }
              />
            );
          })}
        </tbody>
      </table>
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

type TRowData = TFriendCollection[string] & {
  onChange: any;
  userName: string;
  systemHasAckInvite: boolean;
};

const Row: React.FunctionComponent<TRowData> = (props) => {
  const label = props.isInvited
    ? `cancel invite to ${props.userName}`
    : `invite ${props.userName}`;
  return (
    <tr>
      <td>
        <label aria-label={label}>
          <input
            type="checkbox"
            name={props.userName}
            checked={props.isInvited}
            onChange={props.onChange}
          />
          {props.userName}
        </label>
      </td>
      <td aria-label={`${props.userName}'s invitation status`}>
        {props.hasAcceptedInvite ? (
          <span aria-label="accepted">accepted!</span>
        ) : props.systemHasAckInvite ? (
          <span aria-label="invited">invited!</span>
        ) : (
          <span aria-label="not invited" />
        )}
      </td>
    </tr>
  );
};

InviteForm.defaultProps = {
  onSubmit: (data) => {
    void data;
  },
};
