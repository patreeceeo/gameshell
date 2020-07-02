import * as React from "react";
import { partial } from "../../utils";
import * as Friends from "../../models/FriendCollection";

type TFormData = string[];

interface TProps {
  onSubmit?: (data: TFormData) => void;
  friendsByUserName: Friends.TTabularMap;
}

export const InviteForm: React.ComponentType<TProps> = (props) => {
  const [friendsByUserName, setFriendsByUserName] = React.useState(
    props.friendsByUserName
  );

  React.useEffect(() => {
    setFriendsByUserName(props.friendsByUserName);
  }, [props.friendsByUserName]);

  return (
    <form onSubmit={handleSubmit}>
      <table>
        <tbody>
          {[...friendsByUserName.values()].map(({ userName, ...info }) => {
            return (
              <Row
                key={userName}
                userName={userName}
                {...info}
                onChange={partial(handleChange, userName)}
                systemHasAckInvite={
                  props.friendsByUserName.get(userName)?.isInvited || false
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
      Friends.update(friendsByUserName, (entry) => ({
        ...entry,
        isInvited: true,
      }))
    );
  }

  function handleChange(userName: string) {
    setFriendsByUserName(
      Friends.update(
        friendsByUserName,
        (entry) => ({
          ...entry,
          isInvited: true,
        }),
        { subset: [userName] }
      )
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (props.onSubmit) {
      const invited = Friends.filter(
        friendsByUserName,
        ({ isInvited }) => isInvited
      );
      props.onSubmit([...invited.keys()]);
    }
  }
};

type TRowData = Friends.TFriend & {
  onChange: any;
  systemHasAckInvite: boolean;
};

const Row: React.FunctionComponent<TRowData> = (props) => {
  const label = props.isInvited
    ? `cancel invite to ${props.userName}`
    : `invite ${props.userName}`;
  return (
    <tr key={props.userName}>
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
