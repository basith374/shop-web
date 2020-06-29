import React, { useRef, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import EmptyPage from '../EmptyPage';
import Dropdown from '../Dropdown';
import { GET_USER } from '../../App';

const GET_USERS = gql`
    query {
        users {
            id
            name
            email
            roles
            active
        }
    }
`

const ADD_USER = gql`
    mutation($name: String!, $email: String!, $roles: String!) {
        addUser(name: $name, email: $email, roles: $roles) {
            id
            name
            email
            roles
            active
        }
    }
`

const UPDATE_USER = gql`
    mutation($id: Int!, $name: String!, $email: String!, $roles: String!, $active: Boolean!) {
        updateUser(id: $id, name: $name, email: $email, roles: $roles, active: $active) {
            id
        }
    }
`

const DELETE_USER = gql`
    mutation($id: Int!) {
        deleteUser(id: $id)
    }
`

const AddUser = (props) => {
    const name = useRef();
    const email = useRef();
    const role = useRef();
    const [ addUser ] = useMutation(ADD_USER, {
        update(cache, { data: { addUser }}) {
            const { users } = cache.readQuery({ query: GET_USERS });
            cache.writeQuery({
                query: GET_USERS,
                data: { users: users.concat(addUser) }
            })
        }
    });
    const onAdd = () => {
        addUser({
            variables: {
                name: name.current.value,
                email: email.current.value,
                roles: role.current.value,
            }
        }).then(() => {
            props.close()
        }).catch(err => {
            
        })
    }
    return <div className="c-f">
        <h2>Add new user</h2>
        <div className="grp">
            <label>Name</label>
            <input type="text" ref={name} />
        </div>
        <div className="grp">
            <label>Email</label>
            <input type="text" ref={email} />
        </div>
        <div className="grp">
            <label>Role</label>
            <select ref={role}>
                <option value="admin">Admin</option>
                <option value="user">User</option>
            </select>
        </div>
        <div>
            <button onClick={onAdd}>Add</button>
        </div>
    </div>
}

const UserRow = (props) => {
    const { user } = props;
    const name = useRef();
    const email = useRef();
    const role = useRef();
    const [ updateUser ] = useMutation(UPDATE_USER);
    const [ deleteUser ] = useMutation(DELETE_USER, {
        variables: { id: user.id },
        update(cache) {
            const { users } = cache.readQuery({ query: GET_USERS });
            cache.writeQuery({
                query: GET_USERS,
                data: { users: users.filter(u => u.id !== user.id) }
            })
        }
    });
    useEffect(() => {
        if(props.opened) {
            name.current.value = user.name;
            email.current.value = user.email;
            role.current.value = user.roles;
        }
    }, [ props.opened, user ]);
    const onUpdate = () => {
        const variables = {
            id: user.id,
            name: name.current.value,
            email: email.current.value,
            roles: role.current.value,
            active: user.active,
        }
        updateUser({
            variables,
            update(cache) {
                const { users } = cache.readQuery({ query: GET_USERS })
                cache.writeQuery({
                    query: GET_USERS,
                    data: {
                        users: users.map(u => {
                            if(u.id === user.id) return {...u, ...variables };
                            else return u;
                        })
                    }
                })
                props.toggle()
            }
        })
    }
    const onDelete = () => {
        deleteUser()
    }
    const onDeactivate = () => {

    }
    const content = [
        <tr key="m" onClick={() => props.toggle(user.id)} className={props.opened ? 'dc' : ''}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.roles}</td>
        </tr>
    ]
    if(props.opened) {
        content.push(<tr className="ex" key="n">
            <td colSpan={3}>
                <div className="od-x">
                    <div className="od-l">
                        <div className="c-f">
                            <div className="grp">
                                <label>Name</label>
                                <input type="text" ref={name} />
                            </div>
                            <div className="grp">
                                <label>Email</label>
                                <input type="text" ref={email} />
                            </div>
                            <div className="grp">
                                <label>Role</label>
                                <select ref={role}>
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                            </div>
                            <div>
                                <button onClick={onUpdate}>Update</button>
                            </div>
                        </div>
                    </div>
                    {/* <div className="od-l">
                        <button className="btn red" onClick={onDeactivate}>Deactivate User</button>
                    </div> */}
                    <div className="od-l">
                        <button className="btn red" onClick={onDelete}>Delete User</button>
                    </div>
                </div>
            </td>
        </tr>)
    }   
    return content;
}

const Users = () => {
    const [openRow, setOpenRow] = useState();
    const { loading, error, data } = useQuery(GET_USERS);
    const { data: { user } } = useQuery(GET_USER);
    if(error) return <div>error</div>
    if(!loading && data.users.length === 0) return <EmptyPage msg="No users" />
    const toggleRow = (i) => setOpenRow(openRow === i ? '' : i);
    return <div className="p-m us-r">
        <div className="p-h">
            <h1>Users</h1>
            {user.roles === 'admin' && <div className="ph-r">
                <Dropdown button={t => <button onClick={t}>Add</button>}>
                    <AddUser />
                </Dropdown>
            </div>}
        </div>
        <div>
            {!loading && <table className="dt">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {data.users.map(c => <UserRow key={c.id} toggle={toggleRow} opened={openRow === c.id} user={c} />)}
                </tbody>
            </table>}
        </div>
    </div>
}

export default Users;