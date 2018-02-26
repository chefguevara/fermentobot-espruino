import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import App from './App';
import registerServiceWorker from './registerServiceWorker';

const StyledApp = styled(App)`
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
  }
`;

ReactDOM.render(<StyledApp />, document.getElementById('root'));
registerServiceWorker();
