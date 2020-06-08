import React from 'react';
import { useHistory } from 'react-router-dom';
import './products.css';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import _ from 'lodash';
import EmptyPage from '../EmptyPage';
import Loading from '../Loading';

const ProductCard = (props) => {
    let history = useHistory();
    return <div className="p-c ptr" onClick={e => history.push('/products/' + props.product.id)}>
        <div className="pc-h">
        </div>
        <div className="pc-b">
            <div className="pc-t">{props.product.name}</div>
            <div>{_.get(props.product.category, 'name')}</div>
            <div>
                <div>active</div>
            </div>
        </div>
    </div>
}

const GET_PRODUCTS = gql`
    query {
        products {
            id
            name
            category {
                id
                name
            }
        }
    }
`

const Products = () => {
    const { data, error, loading } = useQuery(GET_PRODUCTS);
    let history = useHistory();
    return <div className="p-m">
        <div className="p-h">
            <h1>Products</h1>
            <div className="ph-r">
                <button onClick={e => history.push('/products/create')}>Add</button>
            </div>
        </div>
        {loading && <Loading />}
        {error && <EmptyPage msg="Error" />}
        {!loading && data.products.length === 0 && <EmptyPage msg="No products" />}
        {!loading && <div className="c-c">
            {data.products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>}
    </div>
}

export default Products;