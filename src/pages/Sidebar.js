import React from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const GET_PENDING_ORDERS = gql`
    query {
        pendingOrders {
            id
            customer {
                id
                name
            }
            address {
                id
                locality
            }
            total
            status
            createdAt
        }
    }
`

const Sidebar = () => {
    let { data } = useQuery(GET_PENDING_ORDERS);
    const pendingOrdersBadge = () => {
        if (data) {
            let count = data.pendingOrders.length;
            return <span className="badge">{count}</span>
        }
        return null
    }
    return <div className="s-b">
        <div>
            <NavLink to="/homepage" activeClassName="actv">Homepage</NavLink>
        </div>
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
            <NavLink to="/orders" activeClassName="actv">Orders {pendingOrdersBadge()}</NavLink>
        </div>
    </div>
}

export default Sidebar;