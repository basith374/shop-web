import React from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import _ from 'lodash';

export const GET_PENDING_ORDERS = gql`
    query {
        orders(status: 0) {
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

export const ORDER_SUBSCRIPTION = gql`
    subscription {
        orderAdded {
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
    useSubscription(ORDER_SUBSCRIPTION, {
        onSubscriptionData({ client, subscriptionData }) {
            if(subscriptionData.data) {
                const { orders } = client.cache.readQuery({ query: GET_PENDING_ORDERS });
                client.writeQuery({
                    query: GET_PENDING_ORDERS,
                    data: { orders: orders.concat(subscriptionData.data.orderAdded) }
                })
                new Audio('/notification_bell.mp3').play();
            }
        }
    });
    const pendingOrdersBadge = () => {
        let count = _.get(data, 'orders.length');
        if(count) return <span className="badge">{count}</span>
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