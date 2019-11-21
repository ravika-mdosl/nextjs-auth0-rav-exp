import { IncomingMessage, ServerResponse } from 'http';

import { NextApiRequest } from 'next';
import request from 'request';
import { promisify } from 'util';
import { ISession } from '../session/session';
import { ISessionStore } from '../session/store';
import IAuth0Settings from '../settings';

const [getAsync] = [request.get].map(promisify);

export default function silentLoginHandler(settings: IAuth0Settings, sessionStore: ISessionStore) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (!req) {
      throw new Error('Request is not available');
    }

    if (!res) {
      throw new Error('Response is not available');
    }

    // should probably change this to body
    const accessToken = (req as NextApiRequest).query.access_token as string;

    if (!accessToken) {
      throw new Error('The access token is required');
    }

    const existingSession = await sessionStore.read(req);
    if (existingSession) {
      // Do nothing, already have a cookie to use
      res.end();
      return;
    }

    const { body: user } = await getAsync({
      baseUrl: `https://${settings.domain}`,
      url: 'userinfo',
      json: true,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!user || !Object.keys(user).length) {
      throw new Error('The user could not be retrieved with the provided access token');
    }

    // Create the session.
    const session: ISession = {
      // user: {
      //   ...claims
      // },
      user,
      // idToken: tokenSet.id_token,
      accessToken,
      // refreshToken: tokenSet.refresh_token,
      createdAt: Date.now()
    };

    // Create the session.
    await sessionStore.save(req, res, session);

    res.end();
  };
}
