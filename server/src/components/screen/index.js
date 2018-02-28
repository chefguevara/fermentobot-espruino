import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledScreen = styled.code`
  display: flex;
  margin: 20px auto 0;
  background-color: #eee;
  border: 1px solid #bbb;
  width: 250px;
  height: 280px;
  overflow-y: auto;
  text-align: left;
`;

const CenteredDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const StyledUl = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  margin: 0 auto;
`;

// const CenteredDiv =

const Screen = ({ messages }) => (
  <StyledScreen>
    {messages.length >= 1
      ? (
        <StyledUl>
          {messages.map((msg, key) =>
            <li key={key}>{`${msg.client} - ${msg.temp}`}</li>
          )}
        </StyledUl>)
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
