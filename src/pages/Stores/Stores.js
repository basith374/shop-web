import React from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import EmptyPage from '../EmptyPage';
import Loading from '../Loading';

const StoreCard = (props) => {
    let history = useHistory();
    return <div className="p-c ptr" onClick={e => history.push('/stores/' + props.store.id)}>
        <div className="pc-h">
        </div>
        <div className="pc-b">
            <div className="pc-t">{props.store.name}</div>
            <div>{props.store.locality}</div>
        </div>
    </div>
}

const GET_STORES = gql`
    query {
        stores {
            id
            name
            locality
        }
    }
`

const Stores = () => {
    let history = useHistory();
    const { data, loading } = useQuery(GET_STORES);
    const renderContent = () => {
        if(loading) return <Loading />
        if(!loading && data.stores.length === 0) return <EmptyPage msg="No stores" />
        return <div className="c-c">
            {data.stores.map(s => <StoreCard key={s.id} store={s} />)}
        </div>
    }
    return <div className="p-m">
        <div className="p-h">
            <h1>Stores</h1>
            <div className="ph-r">
                <button onClick={e => history.push('/stores/create')}>Add</button>
            </div>
        </div>
        {renderContent()}
    </div>
}

export default Stores;