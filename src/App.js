import React from 'react';
import { BrowserRouter as Router, Switch, Route, NavLink } from 'react-router-dom';
import './App.css';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

import Product from './pages/Product';
import Products from './pages/Products';
import Category from './pages/Category';
import Categories from './pages/Categories';
import Order from './pages/Order';
import Orders from './pages/Orders';
import Store from './pages/Store';
import Stores from './pages/Stores';

const client = new ApolloClient({
  uri: 'http://localhost:4000',
})

function App() {
  return (
    <ApolloProvider client={client}>
    <div className="App">
      <div className="App-c">
        <Router>
          <div className="s-b">
            <div>
              <NavLink to="/products" activeClassName="actv">Products</NavLink>
            </div>
            <div>
              <NavLink to="/categories" activeClassName="actv">Categories</NavLink>
            </div>
            <div>
              <NavLink to="/stores" activeClassName="actv">Stores</NavLink>
            </div>
            <div>
              <NavLink to="/orders" activeClassName="actv">Orders <span className="badge">1</span></NavLink>
            </div>
          </div>
          <div className="s-c">
            <Switch>
              <Route path="/orders">
                <Orders />
              </Route>
              <Route path="/stores">
                <Stores />
              </Route>
              <Route path="/categories">
                <Categories />
              </Route>
              <Route path="/products" exact>
                <Products />
              </Route>
              <Route path="/products/:id">
                <Product />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    </div>
    </ApolloProvider>
  );
}

export default App;
