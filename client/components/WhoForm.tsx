import * as React from "react";

interface IFormData {
  userName: string;
}
interface IProps {
  onSubmit: (data: IFormData) => void;
}

const WhoForm: React.ComponentType<IProps> = (props) => {
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="userName" />
    </form>
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    props.onSubmit({
      userName: data.get("userName") as string,
    });
  }
};

export default WhoForm;
