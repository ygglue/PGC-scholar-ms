import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Obfuscator from 'rollup-plugin-obfuscator'

const obfuscatorConfig = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.1,
  debugProtection: false,
  debugProtectionInterval: 0,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  identifiersPrefix: 'obfuscated',
  logLevel: 'silent',
  numbersToExpressions: true,
  renameProperties: false,
  rotateStringArray: true,
  selfDefending: true,
  shuffleStringArray: true,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.75,
  stringArrayEncoding: ['base64'],
  stringArrayIndexesType: ['hexadecimal'],
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    ...(process.env.NODE_ENV === 'production' ? [Obfuscator(obfuscatorConfig)] : [])
  ],
})