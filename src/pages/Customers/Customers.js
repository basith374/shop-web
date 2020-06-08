import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import EmptyPage from '../EmptyPage';

const GET_CUSTOMERS = gql`
    query {
        customers {
            id
            name
        }
    }
`

const Customers = () => {
    const { loading, data } = useQuery(GET_CUSTOMERS);
    if(!loading && data.customers.length === 0) return <EmptyPage msg="No customers" />
    return <div className="p-m">
        <div className="p-h">
            <h1>Customers</h1>
        </div>
        <div>
            {!loading && <table>
                <tbody>
                    {data.customers.map(c => <tr key={c.id}>
                        <td>{c.name}</td>
                    </tr>)}
                </tbody>
            </table>}
        </div>
    </div>
}

export default Customers;