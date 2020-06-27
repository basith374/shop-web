import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import moment from 'moment';
import './orders.css';
import Loading from '../Loading';
import EmptyPage from '../EmptyPage';
import { ORDER_SUBSCRIPTION } from '../Sidebar';
import Dropdown from '../Dropdown';

export const GET_ORDERS = gql`
    query {
        orders {
            id
            customer {
                id
                name
            }
            address {
                id
                locality
            }
            items {
                name
                price
                qty
            }
            total
            status
            createdAt
        }
    }
`

const Orders = () => {
    const { data, loading, error } = useQuery(GET_ORDERS);
    const [openRow, setOpenRow] = useState('');
    useSubscription(ORDER_SUBSCRIPTION, {
        onSubscriptionData({ client, subscriptionData }) {
            if(subscriptionData.data) {
                const { orders } = client.cache.readQuery({ query: GET_ORDERS });
                client.writeQuery({
                    query: GET_ORDERS,
                    data: { orders: orders.concat(subscriptionData.data.orderAdded) }
                })
            }
        }
    });
    const history = useHistory();
    const now = moment().valueOf();
    const renderState = state => {
        if(state === 0) return <div className="ylw">Waiting</div>
        if(state === 1) return <div className="blu">Processing</div>
        if(state === 2) return <div className="blu">Dispatched</div>
        if(state === 3) return <div className="grn">Delivered</div>
        if(state === 4) return <div className="red">Cancelled</div>
        return 'Unknown';
    }
    const toggleRow = id => setOpenRow(openRow === id ? '' : id)
    const renderContent = () => {
        if(error) return <EmptyPage msg="Error" />;
        if(loading) return <Loading />;
        if(!loading && data.orders.length === 0) return <EmptyPage msg="No orders" />
        return <div className="od-t">
            <table className="dt">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Place</th>
                        <th>Items</th>
                        <th>Order sum</th>
                        <th>When</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.orders.map(s => {
                        const content = [
                            <tr key={s.id} className={s.id === openRow ? 'dc' : ''} onClick={() => toggleRow(s.id)}>
                                <td>{s.customer.name}</td>
                                <td>{s.address.locality}</td>
                                <td>{s.items.length}</td>
                                <td>₹ {s.total}</td>
                                <td>{moment.duration(now - parseInt(s.createdAt, 10)).humanize()} ago</td>
                                <td>{renderState(s.status)}</td>
                            </tr>
                        ]
                        if(openRow === s.id) {
                            content.push(<tr key={s.id + 'ex'} className="ex">
                                <td colSpan={6}>
                                    <div className="od-x">
                                        <div className="od-l o">
                                            <table>
                                                <tr>
                                                    <th>Item</th>
                                                    <th>Price</th>
                                                    <th>Qty</th>
                                                </tr>
                                                <tbody>
                                                {s.items.map(f => {
                                                    return <tr key={f.name}>
                                                        <td>{f.name}</td>
                                                        <td>{f.price}</td>
                                                        <td>{f.qty}</td>
                                                    </tr>
                                                })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="od-l">
                                            <Dropdown button={t => <button className="btn ci" onClick={t}>Change status <img src="down-arrow.svg" alt="caret" /></button>}>
                                                <button className="pur">Processing</button>
                                                <button className="blu">Dispatched</button>
                                            </Dropdown>
                                        </div>
                                        <div className="od-l">
                                            <button className="btn ic"><img src="/correct.svg" alt="check" /> Mark Delivered</button>
                                        </div>
                                        <div>
                                            <button className="btn ic red"><img src="/close.svg" alt="check" /> Cancel Order</button>
                                        </div>
                                    </div>
                                </td>
                            </tr>)
                        }
                        return content;
                    })}
                </tbody>
            </table>
        </div>
    }
    return <div>
        <div className="p-h">
            <h1>Orders</h1>
            <div className="ph-r">
                <button onClick={e => history.push('/orders/create')}>Add</button>
            </div>
        </div>
        {renderContent()}
    </div>
}

export default Orders;