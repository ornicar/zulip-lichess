import { UserId, ZulipDest, ZulipOrig } from './zulip';

export interface ParrotAdd {
  verb: 'parrotAdd';
  key: string;
  value: string;
}

export interface ParrotGet {
  verb: 'parrotGet';
  key: string;
}

export interface ParrotDel {
  verb: 'parrotDel';
  key: string;
}

export interface Hi {
  verb: 'hi';
}

export interface Fortune {
  verb: 'fortune';
}

export interface Play {
  verb: 'play';
  min: number;
  inc: number;
  rated: boolean;
}

export interface Help {
  verb: 'help';
}

export interface Invite {
  verb: 'invite';
  user: string;
  streams: string;
}

type Command = ParrotAdd | ParrotDel | Hi | Fortune | Play | Invite | Help | ParrotGet;

const all = new Set(['add', 'del', 'list', 'hi', 'hello', 'help', 'halp', 'h', 'fortune', 'play', 'invite']);

export const parseCommand = (cmd: string, _orig: ZulipOrig): Command => {
  const split = cmd.split(' ').map(t => t.trim());
  const verb = split[0].toLowerCase();
  if (verb == 'add') {
    if (!all.has(split[1])) return { verb: 'parrotAdd', key: split[1], value: split.slice(2).join(' ') };
  }
  if (verb == 'del') return { verb: 'parrotDel', key: split[1] };
  if (verb == 'fortune') return { verb };
  if (verb == 'hi' || verb == 'hello') return { verb: 'hi' };
  if (verb == 'help' || verb == 'halp' || verb == 'h') return { verb: 'help' };
  if (verb == 'play') return parsePlay(split);
  if (verb == 'invite') {
    const [user, streams] = split.slice(0);
    return { verb: 'invite', user, streams };
  }
  return { verb: 'parrotGet', key: cmd };
};

const parsePlay = (words: string[]): Play => {
  const [min, inc] = words[1].split('+').map(x => parseInt(x));
  return {
    verb: 'play',
    min,
    inc,
    rated: words.includes('rated'),
  };
};
