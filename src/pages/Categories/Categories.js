import React from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const CategoryCard = (props) => {
    return <div className="p-c">
        <div className="pc-h">
        </div>
        <div className="pc-b">
            <div className="pc-t">{props.category.name}</div>
        </div>
    </div>
}

const ADD_CATEGORY = gql`
    mutation CreateCategory($name: String!) {
        addCategory(name: $name) {
            id,
            name
        }
    }
`

const CategoryNew = () => {
    const [addCategory, { data }] = useMutation(ADD_CATEGORY, {
        update(cache, { data: { addCategory }}) {
            const { categories } = cache.readQuery({ query: GET_CATEGORIES })
            cache.writeQuery({
                query: GET_CATEGORIES,
                data: { categories: categories.concat([addCategory]) }
            })
        }
    });
    let onKeyDown = e => {
        let input = e.target;
        if(e.keyCode === 13 && input.value.length > 3) {
            addCategory({ variables: { name: input.value }});
            input.value = '';
        }
    }
    return <div className="p-c">
        <div className="pc-h">
        </div>
        <div className="pc-b">
            <div className="pc-t"><input type="text" onKeyDown={onKeyDown} placeholder="New category" /></div>
        </div>
    </div>
}

const GET_CATEGORIES = gql`
    query {
        categories {
            id,
            name
        }
    }
`

const Categories = () => {
    const { loading, error, data } = useQuery(GET_CATEGORIES);
    if(loading) return <div>loading...</div>;
    return <div>
        <h1 className="p-h">Categories</h1>
        <div className="c-c">
            <CategoryNew />
            {data.categories.map(c => <CategoryCard key={c.id} category={c} />)}
        </div>
    </div>
}

export default Categories;