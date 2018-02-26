import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import logo from '../../logo.svg';

const StyledWrapper = styled.header`
  background-color: #222;
  padding: 20px;
  color: white;
`;

const StyledImg = styled.img`
  @keyframes App-logo-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  animation: App-logo-spin infinite 20s linear;
  height: 80px;
`;

const StyledTitle = styled.h1`
  font-size: 1.5em;
`;

const Header = ({ children }) => (
  <StyledWrapper>
    <StyledImg src={logo} alt="logo" />
    <StyledTitle>Output Management</StyledTitle>
    {children}
  </StyledWrapper>
);

Header.propTypes = {
  children: PropTypes.node.isRequired
};

export default Header;
