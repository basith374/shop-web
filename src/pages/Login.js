import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { GoogleLogin } from 'react-google-login';
import { gql } from 'apollo-boost';

const LOGIN = gql`
  mutation LoginMutation($email: String!, $name: String!, $token: String!) {
    login(email: $email, name: $name, token: $token)
  }
`

const Login = (props) => {
    const [login] = useMutation(LOGIN);
    const [error, setError] = useState();
    const onLogin = (rsp) => {
        let { email, givenName: name } = rsp.profileObj;
        login({
            variables: { token: rsp.tokenId, email, name }
        }).then(rsp => {
            localStorage.setItem('token', rsp.data.login);
            props.setAuth(true);
        }).catch(err => {
            console.log(err)
            if(err.graphQLErrors) {
                err.graphQLErrors.forEach(f => {
                    setError(f.message)
                })
            }
        })
    }
    const handleLoginFailure = (err) => {
        console.log(err)
    }
    return <div className="App">
        <div className="App-l">
            <div className="App-lc">
                <div className="al-t">Dashboard login</div>
                <div className="al-gb">
                    <GoogleLogin
                        clientId={'370868874003-92rm2j8u3sftuio1ptod99b2tfkp6jh0'}
                        buttonText="Sign in with Google"
                        onSuccess={onLogin}
                        onFailure={handleLoginFailure}
                        cookiePolicy={'single_host_origin'}
                        responseType='code,token'
                    />
                </div>
                {error && <div className="err">{error}</div>}
            </div>
        </div>
    </div>
}

export default Login;