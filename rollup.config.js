import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const extensions = ['.ts']
const noDeclarationFiles = { compilerOptions: { declaration: false } }

const babelRuntimeVersion = pkg.dependencies['@babel/runtime'].replace(
  /^[^0-9]*/,
  ''
)

const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
  return id => pattern.test(id)
}

export default [
  // CommonJS
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/react-redux-blaze.js',
      format: 'cjs',
      indent: false,
      globals: {
        react: 'React',
        redux: 'Redux',
        'react-dom': 'ReactDOM'
      }
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ]),
    plugins: [
      nodeResolve({
        extensions
      }),
      typescript({ useTsconfigDeclarationDir: true }),
      babel({
        extensions,
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }]
        ],
        runtimeHelpers: true
      }),
      commonjs({
        namedExports: {
          'node_modules/react-is/index.js': [
            'isValidElementType',
            'isContextConsumer'
          ],
          'node_modules/react-dom/index.js': ['unstable_batchedUpdates'],
          'node_modules/react/index.js': [
            'Component',
            'PureComponent',
            'Fragment',
            'Children',
            'createElement',
            'useContext',
            'useEffect',
            'useLayoutEffect',
            'useMemo',
            'useReducer',
            'useRef',
            'useState',
            'useCallback'
          ]
        }
      })
    ]
  },

  // ES
  {
    input: 'src/index.ts',
    output: {
      file: 'es/react-redux-blaze.js',
      format: 'es',
      indent: false,
      globals: {
        react: 'React',
        redux: 'Redux',
        'react-dom': 'ReactDOM'
      }
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ]),
    plugins: [
      nodeResolve({
        extensions
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            { version: babelRuntimeVersion, useESModules: true }
          ]
        ],
        runtimeHelpers: true
      }),
      commonjs({
        namedExports: {
          'node_modules/react-is/index.js': [
            'isValidElementType',
            'isContextConsumer'
          ],
          'node_modules/react-dom/index.js': ['unstable_batchedUpdates'],
          'node_modules/react/index.js': [
            'Component',
            'PureComponent',
            'Fragment',
            'Children',
            'createElement',
            'useContext',
            'useEffect',
            'useLayoutEffect',
            'useMemo',
            'useReducer',
            'useRef',
            'useState',
            'useCallback'
          ]
        }
      })
    ]
  },

  // ES for Browsers
  {
    input: 'src/index.ts',
    output: {
      file: 'es/react-redux-blaze.mjs',
      format: 'es',
      indent: false,
      globals: {
        react: 'React',
        redux: 'Redux',
        'react-dom': 'ReactDOM'
      }
    },
    plugins: [
      nodeResolve({
        extensions
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        exclude: 'node_modules/**'
      }),
      commonjs({
        namedExports: {
          'node_modules/react-is/index.js': [
            'isValidElementType',
            'isContextConsumer'
          ],
          'node_modules/react-dom/index.js': ['unstable_batchedUpdates'],
          'node_modules/react/index.js': [
            'Component',
            'PureComponent',
            'Fragment',
            'Children',
            'createElement',
            'useContext',
            'useEffect',
            'useLayoutEffect',
            'useMemo',
            'useReducer',
            'useRef',
            'useState',
            'useCallback'
          ]
        }
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  },

  // UMD Development
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/react-redux-blaze.js',
      format: 'umd',
      name: 'react-redux-blaze',
      indent: false,
      globals: {
        react: 'React',
        redux: 'Redux',
        'react-dom': 'ReactDOM'
      }
    },
    plugins: [
      nodeResolve({
        extensions
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        exclude: 'node_modules/**'
      }),
      commonjs({
        namedExports: {
          'node_modules/react-is/index.js': [
            'isValidElementType',
            'isContextConsumer'
          ],
          'node_modules/react-dom/index.js': ['unstable_batchedUpdates'],
          'node_modules/react/index.js': [
            'Component',
            'PureComponent',
            'Fragment',
            'Children',
            'createElement',
            'useContext',
            'useEffect',
            'useLayoutEffect',
            'useMemo',
            'useReducer',
            'useRef',
            'useState',
            'useCallback'
          ]
        }
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development')
      })
    ]
  },

  // UMD Production
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/react-redux-blaze.min.js',
      format: 'umd',
      name: 'react-redux-blaze',
      indent: false,
      globals: {
        react: 'React',
        redux: 'Redux',
        'react-dom': 'ReactDOM'
      }
    },
    plugins: [
      nodeResolve({
        extensions
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        exclude: 'node_modules/**'
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      commonjs({
        namedExports: {
          'node_modules/react-is/index.js': [
            'isValidElementType',
            'isContextConsumer'
          ],
          'node_modules/react-dom/index.js': ['unstable_batchedUpdates'],
          'node_modules/react/index.js': [
            'Component',
            'PureComponent',
            'Fragment',
            'Children',
            'createElement',
            'useContext',
            'useEffect',
            'useLayoutEffect',
            'useMemo',
            'useReducer',
            'useRef',
            'useState',
            'useCallback'
          ]
        }
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  }
]
