const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function replaceInFile(relativePath, replacements) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  fs.writeFileSync(filePath, text);
}

const metroPrivateReplacements = [
  ['metro/src/', 'metro/private/'],
  ['metro-core/src/', 'metro-core/private/'],
  ['metro-cache/src/', 'metro-cache/private/'],
  ['metro-resolver/src/', 'metro-resolver/private/'],
  ['metro-config/src/', 'metro-config/private/'],
  ['metro-source-map/src/', 'metro-source-map/private/'],
  ['metro-symbolicate/src/', 'metro-symbolicate/private/'],
  ['metro-transform-worker/src/', 'metro-transform-worker/private/'],
];

[
  'node_modules/@expo/cli/build/src/export/embed/exportEmbedAsync.js',
  'node_modules/@expo/cli/build/src/start/server/metro/getCssModulesFromBundler.js',
  'node_modules/@expo/cli/build/src/start/server/metro/MetroBundlerDevServer.js',
  'node_modules/@expo/cli/build/src/start/server/metro/runServer-fork.js',
  'node_modules/@expo/cli/build/src/start/server/metro/TerminalReporter.js',
  'node_modules/@expo/cli/build/src/start/server/metro/withMetroResolvers.js',
  'node_modules/@expo/metro-config/build/ExpoMetroConfig.js',
  'node_modules/@expo/metro-config/build/file-store.js',
  'node_modules/@expo/metro-config/build/serializer/environmentVariableSerializerPlugin.js',
  'node_modules/@expo/metro-config/build/serializer/fork/baseJSBundle.js',
  'node_modules/@expo/metro-config/build/serializer/getCssDeps.js',
  'node_modules/@expo/metro-config/build/serializer/serializeChunks.js',
  'node_modules/@expo/metro-config/build/serializer/withExpoSerializers.js',
  'node_modules/@expo/metro-config/build/transform-worker/asset-transformer.js',
  'node_modules/@expo/metro-config/build/transform-worker/getAssets.js',
  'node_modules/@expo/metro-config/build/transform-worker/metro-transform-worker.js',
  'node_modules/@expo/metro-config/build/transform-worker/transform-worker.js',
  'node_modules/metro/src/lib/getGraphId.js',
  'node_modules/metro/src/lib/getPrependedScripts.js',
  'node_modules/metro/src/lib/transformHelpers.js',
  'node_modules/metro/src/node-haste/DependencyGraph.js',
  'node_modules/metro/src/node-haste/DependencyGraph/ModuleResolution.js',
  'node_modules/metro/src/Server/symbolicate.js',
  'node_modules/metro-cache/src/stableHash.js',
  'node_modules/metro-config/src/defaults/defaults.js',
  'node_modules/metro-config/src/defaults/index.js',
  'node_modules/metro-source-map/src/composeSourceMaps.js',
  'node_modules/metro-transform-worker/src/index.js',
  'node_modules/metro-transform-worker/src/utils/assetTransformer.js',
  'node_modules/react-native/scripts/packager-reporter.js',
].forEach((file) => replaceInFile(file, metroPrivateReplacements));

replaceInFile('node_modules/@expo/cli/build/src/api/graphql/client.js', [
  ['        _core().dedupExchange,\n', ''],
]);

replaceInFile('node_modules/react-native/index.js', [
  ['./Libraries/Text/TextAncestorContext', './Libraries/Text/TextAncestor'],
]);

replaceInFile('node_modules/react-native/Libraries/Core/setUpReactDevTools.js', [
  [
    `  // Install hook before React is loaded.
  initialize(hookSettings, shouldStartProfilingNow, initialProfilingSettings);`,
    `  // Install hook before React is loaded.
  if (typeof initialize === 'function') {
    initialize(hookSettings, shouldStartProfilingNow, initialProfilingSettings);
  }`,
  ],
]);

replaceInFile('node_modules/react-native/Libraries/Image/resolveAssetSource.js', [
  [
    `function setCustomSourceTransformer(
  transformer: CustomSourceTransformer,
): void {
  _customSourceTransformers = [transformer];
}`,
    `function setCustomSourceTransformer(
  transformer: CustomSourceTransformer,
): void {
  _customSourceTransformers = [transformer];
}
export {setCustomSourceTransformer};`,
  ],
  [
    `function addCustomSourceTransformer(
  transformer: CustomSourceTransformer,
): void {
  _customSourceTransformers.push(transformer);
}`,
    `function addCustomSourceTransformer(
  transformer: CustomSourceTransformer,
): void {
  _customSourceTransformers.push(transformer);
}
export {addCustomSourceTransformer};`,
  ],
]);

replaceInFile('node_modules/metro/src/Server.js', [
  [
    `      const body = await req.rawBody;
      const parsedBody = JSON.parse(body);
      const rewriteAndNormalizeStackFrame = (frame, lineNumber) => {`,
    `      const body = await req.rawBody;
      let parsedBody;
      try {
        parsedBody = body && body !== 'undefined' ? JSON.parse(body) : null;
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
          error: "Invalid symbolication request body"
        }));
        return;
      }
      if (!parsedBody || !Array.isArray(parsedBody.stack)) {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
          error: "Invalid symbolication request stack"
        }));
        return;
      }
      const rewriteAndNormalizeStackFrame = (frame, lineNumber) => {`,
  ],
]);

replaceInFile('node_modules/@expo/cli/build/src/utils/glob.js', [
  [
    `        const g = new (_glob()).Glob(pattern, options);
        let called = false;
        const callback = (er, matched)=>{
            if (called) return;
            called = true;
            if (er) reject(er);
            else resolve(matched);
        };
        g.on("error", callback);
        g.on("end", (matches)=>callback(null, matches));`,
    `        (0, _glob().glob)(pattern, options, (er, matched)=>{
            if (er) reject(er);
            else resolve(matched);
        });`,
  ],
  [
    `        const g = new (_glob()).Glob(pattern, options);
        let called = false;
        const callback = (er, matched)=>{
            if (called) return;
            called = true;
            if (er) reject(er);
            else resolve(matched);
        };
        g.on("error", callback);
        g.on("match", (matched)=>{
            // We've disabled using abort as it breaks the entire glob package across all instances.
            // https://github.com/isaacs/node-glob/issues/279 & https://github.com/isaacs/node-glob/issues/342
            // For now, just collect every match.
            // g.abort();
            callback(null, [
                matched
            ]);
        });
        g.on("end", (matches)=>callback(null, matches));`,
    `        (0, _glob().glob)(pattern, options, (er, matched)=>{
            if (er) reject(er);
            else resolve(matched.length ? [
                matched[0]
            ] : []);
        });`,
  ],
]);
