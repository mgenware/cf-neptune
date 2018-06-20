export class AnimationConfig {
  duration = 800;
}

export class ColorConfig {
  normalText = 'black';
  normalFill = 'white';
  addedFill = '#e7ffc1';
  removingFill = '#ffd1de';
}

export class Config {
  animation = new AnimationConfig();
  color = new ColorConfig();
}

export default new Config();
