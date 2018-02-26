import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledInput = styled.input`
  margin: 20px 10px 0 0;
  width: 200px;
`;

const Input = ({ onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <StyledInput
      type="text"
      name="input"
      placeholder="Envia un mensaje"
      onChange={handleChange}
    />);
};

Input.propTypes = {
  onChange: PropTypes.func.isRequired
};

export default Input;
