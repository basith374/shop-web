import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Dashboard from './Dashboard';
import Product from './Product';
import Products from './Products';
import Categories from './Categories';
import Order from './Order';
import Orders from './Orders';
import Store from './Store';
import Stores from './Stores';
import Customers from './Customers';
import Images from './Images';
import Homepage from './Homepage';
import Users from './Users';

const Content = () => {
    return <div className="s-c">
        <Switch>
            <Route path="/" exact>
                <Dashboard />
            </Route>
            <Route path="/homepage">
                <Homepage />
            </Route>
            <Route path="/orders" exact>
                <Orders />
            </Route>
            <Route path="/orders/create">
                <Order />
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
            <Route path="/users">
                <Users />
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

export default Content;