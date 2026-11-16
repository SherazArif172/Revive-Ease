import React from 'react';
import Penicon from "../../../assets/icons/pen.png";


const SignOffButton = ({  disabled = false , handleNavigateSignOff}) => {
  return (
    <button 
      className="sign-off-button" 
      onClick={handleNavigateSignOff}
      disabled={disabled}
    >
      <img src={Penicon} className="sign-off-icon" alt="Sign icon" height={22}/>
      Needs Sign Off
    </button>
  );
};

export default SignOffButton;