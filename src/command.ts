import { UserId, ZulipDest, ZulipOrig } from './zulip';

export interface Hi {
  verb: 'hi';
}

export interface Fortune {
  verb: 'fortune';
}

export interface Help {
  verb: 'help';
}

type Command = Hi | Fortune | Help;

export const parseCommand = (cmd: string, _orig: ZulipOrig): Command => {
  const verb = cmd.split(' ')[0].toLowerCase();
  if (verb == 'fortune') return { verb };
  if (verb == 'hi' || verb == 'hello') return { verb: 'hi' };
  if (verb == 'help' || verb == 'halp' || verb == 'h') return { verb: 'help' };
  throw "I don't get it.";
};
