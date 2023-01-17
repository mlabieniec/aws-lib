import './Auth.css';
import React, { useEffect, useRef, useState } from 'react';
import { Auth, API, Config } from 'aws-lib';

const config = new Config();
config.encryption(true, 'my-app-key');

const auth = new Auth();
const api = new API(auth);

// this is used by the google API for retrieving the auth token. This coorelatese to the 
// HTML block's `data-callback="googleCallback"` attribute. Without this, the google api
// would POST back to the page. This could be another option utilizing the included ability
// to render Express views via the API library portion (See `aws/api/`)
window.googleCallback = function(data) {
    auth.initProvider(auth.AUTH_PROVIDERS.google, data.credential);
}

function AuthView(props) {

    const usernameRef = useRef('');
    const codeRef = useRef('');

    const [username, setUsername] = useState();
    const [code, setCode] = useState();
    const [session, setSession] = useState();
    const [access, setAccess] = useState();

    useEffect(() => {

        async function getSession() {
            try {
                const session = await auth.initAuth(username);
                setSession(session);
            } catch(e) {
                alert(e);
            }
        }

        async function getAccess() {
            try {
                const access = await auth.verify(username, code);
                setAccess(access);
                this.api.initApi();
            } catch (e) {
                alert(e);
            }
        }

        if (username && !session && !access) {
            getSession();
        }

        if (username && code && !access) {
            getAccess();
        }

        if (access) {
            console.log('You are now authenticated!');
            console.log(access);
        }

    }, [username, session, code, access]);

    return (
        <div className='AuthContainer'>
            
            {!username &&
                <div className='UsernameContainer'>
                    <p>Enter Phone Number (Passwordless/SMS MFA)</p>
                    <div className='AuthUsername'>
                        <input type="text" ref={usernameRef} placeholder="Phone Number"></input>
                        <button onClick={() => setUsername(usernameRef.current.value)}>Login or Signup</button>
                    </div>
                    <div id="g_id_onload"
                        data-client_id={config.exports.google}
                        data-callback="googleCallback"
                        data-auto_prompt="false">
                    </div>
                    <div className="g_id_signin"
                        data-type="standard"
                        data-size="large"
                        data-theme="filled_black"
                        data-text="sign_in_with"
                        data-shape="pill"
                        data-logo_alignment="center">
                    </div>
                </div>
            }
            
            {session &&
                <div className='VerifyContainer'>
                    <p>Enter the code that was sent</p>
                    <div className='AuthCode'>
                        <input type="text" ref={codeRef} placeholder="Confirmation Code"></input>
                        <button onClick={() => setCode(codeRef.current.value)}>Verify Code</button>
                        <button onClick={() => auth.initAuth(username)}>Send a New Code</button>
                    </div>
                </div>
            }

            {access &&

                <div className='AccessContainer'>
                    <button onClick={() => api.request()}>Make Authenticated API Call</button>
                </div>

            }

        </div>
    );
}

export default AuthView;