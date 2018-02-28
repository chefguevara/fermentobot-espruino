import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  width: 250px;
`;

const StyledUl = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  height: 300px;

  li:first-of-type {
    padding-bottom: 15px;
  }
`;

const ClientList = ({ clients }) => (
  <StyledWrapper>
    {
      clients && clients.length > 0
        ? (
          <StyledUl>
            <li>Connected clients:</li>
            {clients.map(
              (client) => <li key={client.clientId}>{client.customId}</li>
            )}
          </StyledUl>
        )
        : null
    }
  </StyledWrapper>
);

ClientList.propTypes = {
  clients: PropTypes.arrayOf(PropTypes.object)
};

ClientList.defaultProps = {
  clients: []
};

export default ClientList;
