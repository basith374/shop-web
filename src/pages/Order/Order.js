import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import _ from 'lodash';
import './order.css';

const GET_CUSTOMERS = gql`
    query {
        customers {
            id
            name
            addresses {
                id
                streetAddress
                locality
            }
        }
    }
`

const GET_PRODUCTS = gql`
    query {
        products {
            id
            name
            variants {
                id
                name
                price
            }
        }
    }
`

const ADD_ORDER = gql`
    mutation CreateOrder($CustomerId: Int!, $addressId: Int!, $deliveryCharge: Float!, $OrderItems: [OrderItemInput!]!) {
        addOrder(CustomerId: $CustomerId, addressId: $addressId, deliveryCharge: $deliveryCharge, OrderItems: $OrderItems) {
            id
        }
    }
`

const GET_ORDERS = gql`
    query {
        orders {
            id
        }
    }
`

const OrderItem = (props) => {
    let { data } = props;
    let [qty, setQty] = useState(0);
    let [item, setItem] = useState();
    const changeProduct = (product) => {
        setItem(product);
        props.setQty(product, parseInt(qty, 10));
    }
    const changeQty = ({ target: { value} }) => {
        value = value.replace(/\D*/g, '')
        setQty(value)
        if(item && value) props.setQty(item, parseInt(value, 10));
    }
    return <tr>
        <td>
            <select>
                {data && data.products.map(p => {
                    return <optgroup key={p.id} label={p.name}>
                        <option>Select product</option>
                        {p.variants.map(pv => {
                            return <option key={pv.id} value={pv.id} onClick={() => changeProduct(pv)}>{pv.name} - ₹{pv.price}</option>
                        })}
                    </optgroup>
                })}
            </select>
        </td>
        <td><input type="text" value={qty} onChange={changeQty} /></td>
        <td>{item && item.price}</td>
        <td>{item ? item.price * qty : 0}</td>
    </tr>
}

const Order = () => {
    // fields
    const address = useRef();
    const delChrg = useRef();
    // state
    let [items, setItems] = useState([]);
    let [customer, setCustomer] = useState();
    let [sum, setSum] = useState({});
    // query
    const { data } = useQuery(GET_CUSTOMERS);
    const { data: data2 } = useQuery(GET_PRODUCTS);
    const [addOrder] = useMutation(ADD_ORDER);
    // methods
    const addItem = () => {
        setItems(items.concat({ id: 't_' + new Date().valueOf() }))
    }
    const removeItem = id => {
        setItems(items.filter(i => i.id !== id))
    }
    const createOrder = () => {
        let variables = {
            CustomerId: customer.id,
            addressId: parseInt(address.current.value, 10),
            deliveryCharge: parseFloat(delChrg.current.value),
            OrderItems: _.map(sum, (v, k) => ({id: parseInt(k), qty: v}))
        }
        addOrder({
            variables,
        }, {
            update(cache, { addOrder }) {
                let orders = cache.readQuery(GET_ORDERS);
                cache.writeQuery({
                    query: GET_ORDERS,
                    data: { orders: orders.concat(addOrder) }
                })
            }
        })
    }
    const changeCustomer = ({target: { value }}) => {
        if(value) {
            let customer = _.find(data.customers, ['id', parseInt(value, 10)]);
            setCustomer(customer);
        }
    }
    const changeQty = (p, qty) => {
        setSum({...sum, [p.id]: p.price * qty})
    }
    return <div>
        <div className="p-h">
            <h1>Create Order</h1>
        </div>
        <div className="c-f -h">
            <div className="grp">
                <label>Customer *</label>
                <div>
                    <select onChange={changeCustomer}>
                        <option>Select customer</option>
                        {data && data.customers.map(c => {
                            return <option key={c.id} value={c.id}>{c.name}</option>
                        })}
                    </select>
                </div>
            </div>
            <div className="grp">
                <label>Address *</label>
                <div>
                    <select ref={address}>
                        {customer && customer.addresses.map(a => {
                            let { streetAddress, locality } = a;
                            if(streetAddress.length > 10) streetAddress = streetAddress.slice(0, 9) + '...';
                            return <option key={a.id} value={a.id}>{[streetAddress, locality].join(', ')}</option>
                        })}
                    </select>
                </div>
            </div>
            <div className="grp">
                <label>Delivery charge *</label>
                <div>
                    <input type="number" step="0.01" ref={delChrg} />
                </div>
            </div>
        </div>
        <div className="c-f -c">
            <h2>Items</h2>
            <table className="ot">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(i => <OrderItem key={i.id} item={i} remove={removeItem} data={data2} setQty={changeQty} />)}
                    <tr>
                        <td><button onClick={addItem}>Add</button></td>
                    </tr>
                </tbody>
            </table>
            <div className="sect -c">
                <table>
                    <tbody>
                        <tr>
                            <td>Total</td>
                            <td>{Object.keys(sum).reduce((c, a) => c + sum[a], 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div className="c-f">
            <div className="">
                <button onClick={createOrder}>Create</button>
            </div>
        </div>
    </div>
}

export default Order;