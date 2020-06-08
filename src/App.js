import React from 'react';
import { BrowserRouter as Router, Switch, Route, NavLink } from 'react-router-dom';
import './App.css';
import { ApolloClient, InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { createUploadLink } from "apollo-upload-client";

import Product from './pages/Product';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Order from './pages/Order';
import Orders from './pages/Orders';
import Store from './pages/Store';
import Stores from './pages/Stores';
import Customers from './pages/Customers';
import Images from './pages/Images/Images';


const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: createUploadLink({ uri: 'http://localhost:4000' })
})

function Sidebar() {
  return <div className="s-b">
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
      <NavLink to="/images" activeClassName="actv">Images</NavLink>
    </div>
    <div>
      <NavLink to="/customers" activeClassName="actv">Customers</NavLink>
    </div>
    <div>
      <NavLink to="/orders" activeClassName="actv">Orders <span className="badge">1</span></NavLink>
    </div>
  </div>
}

function Content() {
  return <div className="s-c">
    <Switch>
      <Route path="/orders">
        <Orders />
      </Route>
      <Route path="/stores" exact>
        <Stores />
      </Route>
      <Route path="/stores/create">
        <Store />
      </Route>
      <Route path="/stores/:id">
        <Store />
      </Route>
      <Route path="/customers">
        <Customers />
      </Route>
      <Route path="/categories">
        <Categories />
      </Route>
      <Route path="/products" exact>
        <Products />
      </Route>
      <Route path="/products/create">
        <Product />
      </Route>
      <Route path="/products/:id">
        <Product />
      </Route>
      <Route path="/images">
        <Images />
      </Route>
    </Switch>
  </div>
}

function App() {
  return (
    <ApolloProvider client={client}>
    <div className="App">
      <div className="App-c">
        <Router>
          <Sidebar />
          <Content />
        </Router>
      </div>
    </div>
    </ApolloProvider>
  );
}

export default App;
