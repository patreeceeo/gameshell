import * as React from "react";
import { TFriendCollection } from "../state";
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
                systemHasAckInvite={props.friendsByUserName[userName].isInvited}
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
        console.log(userName, draft[userName].isInvited);
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
  const label = `invite ${props.userName}`;
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
      <td>{props.systemHasAckInvite && "invited!"}</td>
    </tr>
  );
};

InviteForm.defaultProps = {
  onSubmit: (data) => {
    void data;
  },
};
