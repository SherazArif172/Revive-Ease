import React from 'react';

const BlockKeyboardInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <input
        type="text"
        className="form-control input-dt"
        onClick={onClick}
        value={value}
        placeholder={placeholder}
        onKeyDown={(e) => e.preventDefault()}
        ref={ref}
        readOnly
    />
));

export default BlockKeyboardInput;