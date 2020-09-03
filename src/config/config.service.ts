import * as dotenv from 'dotenv';
import * as dotConfigs from './config';

export class ConfigService {
  private readonly env: { [key: string]: string };
  private readonly configs: Record<string, unknown> | string | Array<string>;

  constructor() {
    dotenv.config();
    this.env = process.env as { [key: string]: string };
    this.configs = dotConfigs as
      | Record<string, unknown>
      | string
      | Array<string>;
  }

  getEnv(key: string): string {
    return this.env[key];
  }

  getConfig(key: string): Record<string, unknown> | string | Array<string> {
    const index: Array<string> = key.split('.');
    let config: Record<string, unknown> | string | Array<string>;

    for (let i = 0; i < index.length; i += 1) {
      config = this.configs[index[i]];
    }

    const result: Record<string, unknown> | string | Array<string> = config;
    return result;
  }
}