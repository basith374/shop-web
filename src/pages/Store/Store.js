import React, { useRef, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import _ from 'lodash';

const GET_STORE = gql`
    query store($id: Int!) {
        store(id: $id) {
            id
            name
            streetAddress
            locality
            pincode
            active
        }
    }
`

const GET_STORES = gql`
    query {
        stores {
            id
        }
    }
`

const ADD_STORE = gql`
    mutation CreateStore($name: String!, $streetAddress: String, $locality: String!, $pincode: String, $active: Boolean) {
        addStore(name: $name, streetAddress: $streetAddress, locality: $locality, pincode: $pincode, active: $active) {
            id
        }
    }
`

const DELETE_STORE = gql`
    mutation DeleteStore($id: Int!) {
        deleteStore(id: $id)
    }
`

const UPDATE_STORE = gql`
    mutation UpdateStore($id: Int!, $name: String!, $streetAddress: String, $locality: String!, $pincode: String, $active: Boolean) {
        updateStore(id: $id, name: $name, streetAddress: $streetAddress, locality: $locality, pincode: $pincode, active: $active)
    }
`

export default () => {
    let history = useHistory();
    let { id } = useParams();
    if(id) id = parseInt(id, 10)
    const { data } = useQuery(GET_STORE, {
        skip: !id,
        variables: { id }
    });
    const [addStore] = useMutation(ADD_STORE, {
        update(cache, { data: { addStore }}) {
            const { stores } = cache.readQuery({ query: GET_STORES })
            cache.writeQuery({
                query: GET_STORES,
                data: { stores: stores.concat([addStore]) }
            })
            history.goBack()
        }
    });
    const [updateStore] = useMutation(UPDATE_STORE);
    const [removeStore] = useMutation(DELETE_STORE);
    useEffect(() => {
        if(data && data.store) {
            name.current.value = data.store.name;
            addr.current.value = data.store.streetAddress;
            loca.current.value = data.store.locality;
            pinc.current.value = data.store.pincode;
            actv.current.checked = data.store.active;
        }
    }, [data]);
    // fields
    const name = useRef();
    const addr = useRef();
    const loca = useRef();
    const pinc = useRef();
    const actv = useRef();
    // methods
    const createStore = () => {
        let variables = {
            name: name.current.value,
            streetAddress: addr.current.value,
            locality: loca.current.value,
            pincode: pinc.current.value,
            active: actv.current.checked,
        }
        if(_.get(data, 'store')) updateStore({
            variables: { id, ...variables},
            update(cache) {
                const { store } = cache.readQuery({ query: GET_STORE, variables: { id } })
                cache.writeQuery({
                    query: GET_STORE,
                    data: { store: {...store, ...variables} },
                })
                history.goBack();
            }
        });
        else addStore({ variables });
    }
    const delStore = () => {
        removeStore({
            variables: { id },
            update(cache) {
                const { stores } = cache.readQuery({ query: GET_STORES })
                cache.writeQuery({
                    query: GET_STORES,
                    data: { stores: stores.filter(s => s.id !== id) }
                })
                history.goBack()
            }
        })
    }
    return <div>
        <div className="p-h">
            <h1>{_.get(data, 'store') ? 'Edit' : 'Create'} Store</h1>
        </div>
        <div className="c-f -h">
            <div className="grp">
                <label>Name *</label>
                <div>
                    <input type="text" ref={name} />
                </div>
            </div>
            <div className="grp">
                <label>Street Address</label>
                <div>
                    <textarea ref={addr}></textarea>
                </div>
            </div>
            <div className="grp">
                <label>Locality *</label>
                <div>
                    <input type="text" ref={loca} />
                </div>
            </div>
            <div className="grp">
                <label>Pincode</label>
                <div>
                    <input type="text" ref={pinc} />
                </div>
            </div>
            <div className="grp">
                <label className="spc"><input type="checkbox" ref={actv} defaultChecked /> Active</label>
            </div>
            <div className={id ? 'grp' : ''}>
                <button onClick={createStore}>{_.get(data, 'store') ? 'Update' : 'Create'}</button>
            </div>
        </div>
        {_.get(data, 'store') && <div className="sep">
            <div className="p-h">
                <h1>Delete</h1>
            </div>
            <div className="c-f">
                <button onClick={delStore} className="red">Delete</button>
            </div>
        </div>}
    </div>
}