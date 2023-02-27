const ProgressBar = ({ progress }) => {
  return (
    <div className="outer-progress-bar">
      <div
        className="inner-progress-bar"
        style={{ width: `${progress}%`, backgroundColor: "blue" }}
      ></div>
    </div>
  );
};

export default ProgressBar;
