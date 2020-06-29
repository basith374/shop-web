import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import { ApolloClient, InMemoryCache, ApolloLink } from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import { createUploadLink } from "apollo-upload-client";
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import _ from 'lodash';
import { gql } from 'apollo-boost';

import Login from './pages/Login';
import Sidebar from './pages/Sidebar';
import Content from './pages/Content';
import Loading from './pages/Loading';

export const GET_USER = gql`
  query {
    user {
      id
      name
      roles
    }
  }
`

function ConfirmModal() {
  const [confirm, setConfim] = useState();
  const cb = useRef();
  useEffect(() => {
    window.confirmAction = (msg, callback) => {
      setConfim(msg)
      cb.current = callback;
    }
  }, [])
  const onCancel = () => {
    setConfim();
    cb.current = null;
  }
  const onConfirm = () => {
    cb.current(onCancel);
  }
  if(!confirm) return null;
  return <div className="mdl">
    <div className="mdl-c">
      <div className="mdl-t">{confirm}</div>
      <div className="mdl-f c-f">
        <button onClick={onConfirm} className="red">Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  </div>
}

function AuthPage() {
  const { loading, error } = useQuery(GET_USER)
  const render = () => {
    if(loading) return <Loading />
    if(error) return <div>error</div>
    return <Router>
      <Sidebar />
      <Content />
      <ConfirmModal />
    </Router>
  }
  return <div className="App">
    <div className="App-c">
      {render()}
    </div>
  </div>
}

function App() {
  // auth status
  let [auth, setAuth] = useState(localStorage.getItem('token') ? true : false);
  useEffect(() => {
    window.logout = () => {
      setAuth(false)
      localStorage.removeItem('token');
    }
  });
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
  const logoutLink = onError(err => {
    if (_.get(err, 'networkError.statusCode') === 400) {
      setAuth(false);
      localStorage.removeItem('token');
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
