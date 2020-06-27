import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import { ApolloClient, InMemoryCache, ApolloLink } from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { createUploadLink } from "apollo-upload-client";
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

import Login from './pages/Login';
import Sidebar from './pages/Sidebar';
import Content from './pages/Content';

function AuthPage() {
  return <div className="App">
    <div className="App-c">
      <Router>
        <Sidebar />
        <Content />
      </Router>
    </div>
  </div>
}

function App() {
  // auth status
  let [auth, setAuth] = useState(localStorage.getItem('token') ? true : false);
  const uploadLink = createUploadLink({ uri: process.env.REACT_APP_API_URL });
  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: localStorage.getItem('token') || null,
      }
    }));
    return forward(operation);
  })
  const logoutLink = onError(({ networkError }) => {
    if (networkError.statusCode === 400) {
      setAuth(false);
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
  })
  const wsLink = new WebSocketLink({
    uri: process.env.REACT_APP_WS_URL,
    options: {
      reconnect: true
    },
  })
  const link = ApolloLink.split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    ApolloLink.from([authMiddleware, logoutLink, uploadLink])
  )
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link,
  })
  let content = auth ? <AuthPage /> : <Login setAuth={setAuth} />
  return <ApolloProvider client={client}>
    {content}
  </ApolloProvider>
}

export default App;
