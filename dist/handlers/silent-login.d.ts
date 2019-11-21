/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { ISessionStore } from '../session/store';
import IAuth0Settings from '../settings';
export default function silentLoginHandler(settings: IAuth0Settings, sessionStore: ISessionStore): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
