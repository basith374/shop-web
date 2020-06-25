import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Loading from '../Loading';

const Homepage = () => {
    const [msg, setMsg] = useState();
    const {error, loading, data} = useQuery(gql`
        query {
            setting(key: "homepage")
        }
    `)
    const [updateHomepage] = useMutation(gql`
        mutation UpdateHomepage($value: String) {
            updateSetting(key: "homepage", value: $value)
        }
    `)
    const text = useRef();
    const update = () => {
        let value = JSON.stringify(JSON.parse(text.current.value), null, 0);
        updateHomepage({
            variables: { value }
        }, {
            update() {
                setMsg('Homepage updated');
                setTimeout(() => setMsg(''), 5000);
            }
        })
    }
    useEffect(() => {
        if(data && data.setting) {
            try {
                text.current.value = JSON.stringify(JSON.parse(data.setting), null, 4);
            } catch(e) {}
        }
    }, [data]);
    const render = () => {
        if(error) return <div>error</div>
        if(loading) return <Loading />
        return <div>
            <div className="grp">
                <textarea rows={20} ref={text}></textarea>
            </div>
            <button onClick={update}>Update</button>
            {msg && <div>{msg}</div>}
        </div>
    }
    return <div className="c-f">
        {render()}
    </div>
}

export default Homepage;