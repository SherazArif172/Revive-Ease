import React from "react";
import BaseTextareaAutosize from '@mui/material/TextareaAutosize';
import { styled } from "@mui/material";

const Textarea = styled(BaseTextareaAutosize)(
  () => `
    box-sizing: border-box;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid white;
    resize: none;
    background-color: #FFFFFF;
    box-shadow: 2px 3px 10px 0px #0357711F;


    &:focus-visible {
      outline: none;
      
      box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.25); /* Subtle focus ring */
    }
  `
);

const TextAreaAutosize = ({
  classNames = "",
  placeholder,
  minRows = 3,
  maxRows = 10,
  value,
  onChange,
  defaultValue,
  ...rest
}) => {
  return (
    <Textarea
      className={`form-control px-3 py-3 ${classNames}`}
      aria-label="Text Area"
      minRows={minRows}
      maxRows={maxRows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      defaultValue={defaultValue}
      {...rest}
    />
  );
};

export default TextAreaAutosize;
