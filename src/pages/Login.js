import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { GoogleLogin } from 'react-google-login';
import { gql } from 'apollo-boost';

const LOGIN = gql`
  mutation LoginMutation($email: String!, $name: String!, $token: String!) {
    login(email: $email, name: $name, token: $token)
  }
`

const Login = (props) => {
    let [login] = useMutation(LOGIN);
    const onLogin = (rsp) => {
        let { email, givenName: name } = rsp.profileObj;
        login({
            variables: { token: rsp.tokenId, email, name }
        }).then(rsp => {
            localStorage.setItem('token', rsp.data.login);
            localStorage.setItem('username', email);
            props.setAuth(true);
        })
    }
    const handleLoginFailure = (err) => {
        console.log(err)
    }
    return <div className="App">
        <div className="App-l">
            <div className="App-lc">
                <div className="al-t">Dashboard login</div>
                <GoogleLogin
                    clientId={}
                    buttonText="Sign in with Google"
                    onSuccess={onLogin}
                    onFailure={handleLoginFailure}
                    cookiePolicy={'single_host_origin'}
                    responseType='code,token'
                // isSignedIn={true}
                />
            </div>
        </div>
    </div>
}

export default Login;