import { UserId, ZulipDest, ZulipOrig } from './zulip';

export interface Hi {
  verb: 'hi';
}

export interface Fortune {
  verb: 'fortune';
}

type Command = Hi | Fortune;

export const parseCommand = (cmd: string, _orig: ZulipOrig): Command => {
  const verb = cmd.split(' ')[0].toLowerCase();
  if (verb == 'fortune') return { verb };
  if (verb == 'hi' || verb == 'hello') return { verb: 'hi' };
  throw "I don't get it.";
};
