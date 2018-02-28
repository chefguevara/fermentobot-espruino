import React, { Component } from 'react';
import styled from 'styled-components';

import {
  subscribeToBroadcast,
  subscribeToConnect,
  subscribeToMessages,
  emitMessage,
  emitTemperature
} from './utils/api';

import Header from './components/header';
import ClientsConnected from './components/clientsConnected';
import Screen from './components/screen';
import ClientList from './components/clientList';
import Button from './components/button';
import Input from './components/input';

const StyledApp = styled.div`
  text-align: center;
`;

const StyledDataWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px 0;
`;

const StyledWrapper = styled.div`

`;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      clients: [],
      input: ''
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onButtonClick = this.onButtonClick.bind(this);
  }

  componentDidMount() {
    // Suscripcion al los fermentadores
    subscribeToConnect((err, customId) => {
      console.log(`${customId} connected!`);
      emitTemperature();
    });

    // Suscripcion a mensajes de fermentadores
    subscribeToMessages((err, message) => {
      this.setState(prevState => ({
        messages: [
          ...prevState.messages,
          message.description
        ]
      }));
    });

    // Suscripcion a mensajes generales
    subscribeToBroadcast((err, clients) => this.setState({ clients }));
  }

  // Manejo de cambio en el Input
  onInputChange(value) {
    this.setState({ input: value });
  }

  // Manejo de click del Boton
  onButtonClick() {
    if (!this.state.input) return;
    emitMessage(this.state.input);
  }

  render() {
    return (
      <StyledApp>
        <Header>
          <ClientsConnected number={this.state.clients.length} />
        </Header>
        <StyledDataWrapper>
          <ClientList clients={this.state.clients} />
          <StyledWrapper>
            <Screen messages={this.state.messages} />
            <Input
              onChange={this.onInputChange}
              onKeyPress={this.onButtonClick}
            />
            <Button onClick={this.onButtonClick}>
              Enviar
            </Button>
          </StyledWrapper>
        </StyledDataWrapper>
      </StyledApp>
    );
  }
}

export default App;
