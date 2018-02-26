import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledButton = styled.button`

`;

const Button = ({ children, onClick }) => {

  const handleClick = (e) => {
    e.preventDefault();
    onClick();
  };

  return (
    <StyledButton
      onClick={handleClick}
    >
      {children}
    </StyledButton>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
};

export default Button;
