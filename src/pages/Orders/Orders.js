import React from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import moment from 'moment';
import './orders.css';
import Loading from '../Loading';
import EmptyPage from '../EmptyPage';

const GET_ORDERS = gql`
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
            total
            status
            createdAt
        }
    }
`

const Orders = () => {
    const { data, loading, error } = useQuery(GET_ORDERS);
    const history = useHistory();
    const now = moment().valueOf();
    const renderState = state => {
        if(state === 0) return <div className="ylw">Waiting</div>
        if(state === 1) return <div className="blu">Dispatched</div>
        if(state === 2) return <div className="grn">Delivered</div>
        if(state === 3) return <div className="red">Cancelled</div>
        return 'Unknown';
    }
    const renderContent = () => {
        if(error) return <EmptyPage msg="Error" />;
        if(loading) return <Loading />;
        if(!loading && data.orders.length === 0) return <EmptyPage msg="No orders" />
        return <div>
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Place</th>
                        <th>Order sum</th>
                        <th>When</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.orders.map(s => {
                        return <tr key={s.id}>
                            <td>{s.customer.name}</td>
                            <td>{s.address.locality}</td>
                            <td>₹ {s.total}</td>
                            {/* <td>{moment.duration(now - s.time).humanize()} ago</td> */}
                            <td>{moment.duration(now - parseInt(s.createdAt, 10)).humanize()} ago</td>
                            <td>{renderState(s.status)}</td>
                        </tr>
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