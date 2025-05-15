import { fileURLToPath } from 'url';
import path from 'path';
import { getDefaultConfig } from '@expo/metro-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultConfig = getDefaultConfig(__dirname);

export default defaultConfig;