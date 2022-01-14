import Ajv from 'ajv';
import standaloneCode from 'ajv/dist/standalone';
import { writeFileSync } from 'fs';
import * as path from 'path';
import {
  accessTokenSchema,
  getValueSchema,
  setMultipleValuesSchema,
  setValueSchema,
} from './schemas';

try {
  const targetPath = path.join(process.cwd(), 'src', 'ajv.js');

  writeFileSync(
    targetPath,
    standaloneCode(
      new Ajv({ code: { source: true } })
        .addSchema(accessTokenSchema, 'accessTokenValidator')
        .addSchema(getValueSchema, 'getValueValidator')
        .addSchema(setValueSchema, 'setValueValidator')
        .addSchema(setMultipleValuesSchema, 'setMultipleValuesValidator')
    )
  );
} catch (error) {
  console.error(error);
  process.exit(1);
}
