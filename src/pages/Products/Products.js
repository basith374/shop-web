import React from 'react';
import { useHistory } from 'react-router-dom';
import './products.css';

const ProductCard = (props) => {
    let history = useHistory();
    return <div className="p-c" onClick={e => history.push('/products/' + props.product.id)}>
        <div className="pc-h">
        </div>
        <div className="pc-b">
            <div className="pc-t">{props.product.name}</div>
            <div>{props.product.category}</div>
            <div>
                <div>active</div>
            </div>
        </div>
    </div>
}

const Products = () => {
    let products = [
        {
            id: 0,
            name: 'Sugar',
            category: 'Cooking',
            active: true,
        },
        {
            id: 1,
            name: 'Salt',
            category: 'Cooking',
            active: true,
        },
        {
            id: 2,
            name: 'Cinnamon',
            category: 'Cooking',
            active: true,
        },
        {
            id: 3,
            name: 'Barley',
            category: 'Cooking',
            active: true,
        },
        {
            id: 4,
            name: 'Wheat',
            category: 'Cooking',
            active: true,
        },
    ]
    return <div>
        <h1 className="p-h">Products</h1>
        <div className="c-c">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
    </div>
}

export default Products;