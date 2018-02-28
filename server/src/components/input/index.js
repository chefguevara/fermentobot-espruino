import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledInput = styled.input`
  margin: 20px 10px 0 0;
  width: 70%;
`;

const Input = ({ onChange, onKeyPress }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleKeyPress = (target) => {
    if (target.key === 'Enter') {
      onKeyPress();
    }
  };

  return (
    <StyledInput
      type="text"
      name="input"
      placeholder="Envia un mensaje"
      onChange={handleChange}
      onKeyPress={handleKeyPress}
    />);
};

Input.propTypes = {
  onChange: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired
};

export default Input;
