import React, { Component } from 'react';
import styled from 'styled-components';

import {
  subscribeToBroadcast,
  subscribeToConnect,
  subscribeToMessages,
  emitMessage
} from './utils/api';

import Header from './components/header';
import Clients from './components/clients';
import Screen from './components/screen';
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

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      clients: 0,
      input: '',
      fermentadores: []
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onButtonClick = this.onButtonClick.bind(this);
  }

  componentDidMount() {
    // Suscripcion al los fermentadores
    subscribeToConnect((err, fermentador) => {
      this.setState(prevState => ({
        fermentadores: [...prevState.fermentadores, fermentador]
      }));
    });
    // Suscripcion a mensajes de fermentadores
    subscribeToMessages((err, message) => {
      this.setState(prevState => ({
        messages: [...prevState.messages, message.description]
      }));
    });
    // Suscripcion a mensajes generales
    subscribeToBroadcast((err, clients) => this.setState({ clients }));
  }

  onInputChange(value) {
    this.setState({ input: value });
  }

  onButtonClick() {
    if (!this.state.input) return;
    emitMessage(this.state.input);
  }

  render() {
    console.log('fermentadores: ', this.state.fermentadres);

    return (
      <StyledApp>
        <Header>
          <Clients clients={this.state.clients} />
        </Header>
        <StyledDataWrapper>
          hola
        </StyledDataWrapper>
        <Screen messages={this.state.messages} />
        <Input
          onChange={this.onInputChange}
          onKeyPress={this.onButtonClick}
        />
        <Button onClick={this.onButtonClick}>
          Enviar
        </Button>
      </StyledApp>
    );
  }
}

export default App;
