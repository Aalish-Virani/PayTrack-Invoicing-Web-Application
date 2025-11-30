import React from "react";
import backIcon from "../../assets/icon-arrow-left.svg";
import { useNavigate } from "react-router-dom";

const BackBtn = ({ route }) => {

  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <button onClick={goBack} className="flex items-center gap-4">
      <span>
        <img src={backIcon} />
      </span>
      <span className="pb-0.5">Back</span>
    </button>
  );
};

export default BackBtn;
