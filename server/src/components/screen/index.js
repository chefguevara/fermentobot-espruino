import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledScreen = styled.code`
  display: flex;
  margin: 20px auto 0;
  background-color: #eee;
  border: 1px solid #bbb;
  width: 400px;
  height: 300px;
  overflow-y: auto;
  text-align: left;
`;

const CenteredDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

// const CenteredDiv =

const Screen = ({ messages }) => (
  <StyledScreen>
    {messages.length >= 1
      ? (
        <ul>
          {messages.map((msg, key) =>
            <li key={key}>{msg}</li>
          )}
        </ul>)
      : (<CenteredDiv>no hay mensajes</CenteredDiv>)
    }
  </StyledScreen>
);

Screen.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.string)
};

Screen.defaultProps = {
  messages: []
};

export default Screen;
