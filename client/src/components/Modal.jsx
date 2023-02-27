import { useState } from "react";
import ProgressBar from "./ProgressBar";
import { useCookies } from "react-cookie";

const Modal = ({ mode, setShowModal, task, getData }) => {
  console.log(mode, task);

  const editMode = mode === "Edit" ? true : false;

  const [cookies, setCookie, removeCookie] = useCookies(null);

  const emailFromCookies = cookies.Email;

  const [data, setData] = useState({
    user_email: editMode ? task.user_email : emailFromCookies,
    title: editMode ? task.title : "",
    progress: editMode ? task.progress : 50,
    date: editMode ? task.date : new Date(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const postData = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.status === 200) {
        console.log("worked");
        setShowModal(false);
        getData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const editData = async (e) => {
    e.preventDefault();
    console.log("submitted edit", data);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL}/todos/${task.id}`,
        {
          method: "PUT",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (response.status === 200) {
        setShowModal(false);
        getData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="overlay">
      <div className="modal">
        <div>
          <div className="form-title-container">
            <h3>{mode} your task</h3>
            <button onClick={() => setShowModal(false)}>X</button>
          </div>
          <form>
            <input
              required
              maxLength={30}
              placeholder="Your task name goes here"
              name="title"
              value={data.title}
              onChange={handleChange}
            />
            <br />
            <label htmlFor="range">Drag to select your current progress</label>
            <input
              required
              type="range"
              min="0"
              max="100"
              name="progress"
              value={data.progress}
              onChange={handleChange}
            />
            <input
              className={mode}
              type="submit"
              onClick={editMode ? editData : postData}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Modal;
