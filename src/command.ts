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

export interface Help {
  verb: 'help';
}

type Command = ParrotAdd | ParrotDel | Hi | Fortune | Help | ParrotGet;

const all = new Set(['add', 'del', 'list', 'hi', 'hello', 'help', 'halp', 'h', 'fortune']);

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
  return { verb: 'parrotGet', key: cmd };
};
