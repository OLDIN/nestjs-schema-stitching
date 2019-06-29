import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import * as fs from 'fs';
import { ClientOpts as redisConnectOptions } from 'redis';

export interface IEnvConfig {
  NODE_ENV: 'development' | 'production' | 'test'
  SERVER_PORT: number
  DOMAIN: string
}

export class ConfigService {
  private readonly envConfig: IEnvConfig;

  constructor(filePath: string) {
    const config: any = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
    // console.log('this.envConfig = ', this.envConfig);
  }

  public get(key: string): any {
    return this.envConfig[key];
  }

  public get isProduction(): boolean {
    return this.envConfig.NODE_ENV === 'production';
  }

  public get isDevelopment(): boolean {
    return this.envConfig.NODE_ENV === 'development';
  }

  private validateInput(envConfig: IEnvConfig): IEnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid(['development', 'production', 'test'])
        .default('development'),
      SERVER_PORT: Joi.number().default(3000)
    }).unknown();

    const { error, value: validatedEnvConfig } = Joi.validate(
      envConfig,
      envVarsSchema,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }
}
