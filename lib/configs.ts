export interface AnimationConfig {
  duration: number;
}

export interface ColorConfig {
  added: string;
  removing: string;
}

export interface Config {
  animation: AnimationConfig;
  color: ColorConfig;
}

const defaults: Config = {
  animation: {
    duration: 800,
  },
  color: {
    added: '#e7ffc1',
    removing: '#ffd1de',
  },
};

export default defaults;
