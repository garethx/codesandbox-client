import React from 'react';

import { Title } from 'app/components/Title';
import { SubTitle } from 'app/components/SubTitle';
import Input from '@codesandbox/common/lib/components/Input';
import { Button } from '@codesandbox/common/lib/components/Button';
import { protocolAndHost } from '@codesandbox/common/lib/utils/url-generator';

import { Container } from './elements';

export const DevAuthPage = () => {
  const [authCode, setAuthCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const getJWTToken = () => {
    setError(null);
    let ok = true;
    fetch(`/api/v1/auth/verify/${authCode}`)
      .then(res => {
        ok = res.ok;
        return res.json();
      })
      .then(res => {
        if (!ok) {
          throw new Error(res.errors.detail[0]);
        }
        if (
          window.opener &&
          window.opener.location.origin === window.location.origin
        ) {
          window.opener.postMessage(
            {
              type: 'signin',
              data: {
                jwt: res.data.token,
              },
            },
            protocolAndHost()
          );
        }
      })
      .catch(e => {
        setError(e.message);
      });
  };

  const baseSignInDomain = process.env.STAGING_API
    ? 'https://codesandbox.stream'
    : 'https://codesandbox.io';
  const cliLoginUrl = `${baseSignInDomain}/cli/login`;
  return (
    <Container>
      <Title>Developer Sign In</Title>
      <SubTitle style={{ width: 800 }}>
        Please enter the token you get from{' '}
        <a
          href={cliLoginUrl}
          target="popup"
          rel="noreferrer noopener"
          onClick={e => {
            e.preventDefault();
            window.open(cliLoginUrl, 'popup', 'width=600,height=600');
            return false;
          }}
        >
          here
        </a>
        . This token will sign you in with your account from codesandbox.io.
      </SubTitle>
      <div
        style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}
      >
        <Input
          style={{ width: 600, fontSize: '1.5rem' }}
          placeholder="Auth Code"
          value={authCode}
          onChange={e => {
            setAuthCode(e.target.value);
          }}
        />
        <Button onClick={getJWTToken}>Submit</Button>
      </div>

      {error && <div style={{ marginTop: '1rem' }}>Error: {error}</div>}
    </Container>
  );
};
