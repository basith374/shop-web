import React from 'react';
import moment from 'moment';
import './orders.css';

const Orders = () => {
    let orders = [
        {
            id: 0,
            name: 'Bazi',
            place: 'Dharmadam',
            order_total: 100,
            time: moment().valueOf(),
            state: 0,
        },
        {
            id: 1,
            name: 'Foozi',
            place: 'Parimadom',
            order_total: 890,
            time: moment().subtract(1, 'minute').valueOf(),
            state: 1,
        },
        {
            id: 2,
            name: 'Moozi',
            place: 'Kannur',
            order_total: 500,
            time: moment().subtract(14, 'minute').valueOf(),
            state: 2,
        },
        {
            id: 3,
            name: 'Shoozi',
            place: 'Chokli',
            order_total: 13000,
            time: moment().subtract(30, 'minute').valueOf(),
            state: 3,
        },
    ]
    const now = moment().valueOf();
    const renderState = state => {
        if(state === 0) return <div className="ylw">Waiting</div>
        if(state === 1) return <div className="blu">Dispatched</div>
        if(state === 2) return <div className="grn">Delivered</div>
        if(state === 3) return <div className="red">Cancelled</div>
        return 'Unknown';
    }
    return <div>
        <div className="p-h">
            <h1>Orders</h1>
        </div>
        <div>
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
                    {orders.map(s => {
                        return <tr key={s.id}>
                            <td>{s.name}</td>
                            <td>{s.place}</td>
                            <td>₹ {s.order_total}</td>
                            <td>{moment.duration(now - s.time).humanize()} ago</td>
                            <td>{renderState(s.state)}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </div>
}

export default Orders;