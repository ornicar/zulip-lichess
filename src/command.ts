import { ZulipOrig } from './zulip';

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

export interface Play {
  verb: 'play';
  min: number;
  inc: number;
  rated: boolean;
}

export interface Help {
  verb: 'help';
}

type Command = ParrotAdd | ParrotDel | Hi | Play | Help | ParrotGet;

const all = new Set(['add', 'del', 'list', 'hi', 'hello', 'help', 'halp', 'h', 'play']);

export const parseCommand = (cmd: string, _orig: ZulipOrig): Command => {
  const split = cmd.split(' ').map(t => t.trim());
  const verb = split[0].toLowerCase();
  if (verb == 'add') {
    if (!all.has(split[1])) return { verb: 'parrotAdd', key: split[1].toLowerCase(), value: split.slice(2).join(' ') };
  }
  if (verb == 'del') return { verb: 'parrotDel', key: split[1].toLowerCase() };
  if (verb == 'hi' || verb == 'hello') return { verb: 'hi' };
  if (verb == 'help' || verb == 'halp' || verb == 'h') return { verb: 'help' };
  if (verb == 'play') return parsePlay(split);
  return { verb: 'parrotGet', key: cmd.replace(/ /g, "").toLowerCase() };
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
