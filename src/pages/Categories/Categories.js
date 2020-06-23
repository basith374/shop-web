import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Loading from '../Loading';
import Dropdown from '../Dropdown';

const DELETE_CATEGORY = gql`
    mutation DeleteCategory($id: Int!) {
        deleteCategory(id: $id)
    }
`
const UPDATE_CATEGORY = gql`
    mutation UpdateCategory($id: Int!, $name: String!) {
        updateCategory(id: $id, name: $name)
    }
`

const ADD_CATEGORY = gql`
    mutation CreateCategory($name: String!) {
        addCategory(name: $name) {
            id,
            name
        }
    }
`

const GET_CATEGORIES = gql`
    query {
        categories {
            id,
            name
        }
    }
`

const CategoryCard = (props) => {
    const [removeCategory] = useMutation(DELETE_CATEGORY);
    const [updateCategory] = useMutation(UPDATE_CATEGORY);
    const [edit, setEdit] = useState(false);
    const input = useRef();
    const onDelete = () => {
        removeCategory({
            variables: { id: props.category.id },
            update(cache) {
                const { categories } = cache.readQuery({ query: GET_CATEGORIES })
                cache.writeQuery({
                    query: GET_CATEGORIES,
                    data: { categories: categories.filter(c => c.id !== props.category.id) }
                })
            }
        })
    }
    let onKeyDown = e => {
        let input = e.target;
        if(e.keyCode === 13 && input.value.length > 3) {
            let name = input.value;
            updateCategory({
                variables: { id: props.category.id, name },
                update(cache) {
                    const { categories } = cache.readQuery({ query: GET_CATEGORIES })
                    cache.writeQuery({
                        query: GET_CATEGORIES,
                        data: {
                            categories: categories.map(c => {
                                if(c.id === props.category.id) return Object.assign({}, c, { name });
                                else return c;
                            })
                        }
                    })
                }
            });
            setEdit(false);
        }
    }
    let editMode = () => {
        setEdit(true);
    }
    useEffect(() => {
        if(edit) input.current.focus();
    }, [edit]);
    return <div className="p-c">
        <Dropdown button={toggle => <button onClick={toggle}><img src="/menu.svg" alt="menu" /></button>}>
            <button onClick={onDelete}>Delete</button>
        </Dropdown>
        <div className="pc-h">
        </div>
        <div className="pc-b">
            <div className="pc-t">
                {edit ? <input ref={input} onKeyDown={onKeyDown} defaultValue={props.category.name} /> : <div onClick={editMode}>{props.category.name}</div>}
            </div>
        </div>
    </div>
}

const CategoryNew = () => {
    const [addCategory] = useMutation(ADD_CATEGORY, {
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

const Categories = () => {
    const { loading, data } = useQuery(GET_CATEGORIES);
    const renderContent = () => {
        if(loading) return <Loading />
        return <div className="c-c">
            <CategoryNew />
            {data.categories.map(c => <CategoryCard key={c.id} category={c} />)}
        </div>
    }
    return <div>
        <div className="p-h">
            <h1>Categories</h1>
        </div>
        {renderContent()}
    </div>
}

export default Categories;