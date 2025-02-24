const fs = require('fs');
const path = require('path');

// === Updated Section: Define the project root to the project root directory ===
const projectRoot = path.resolve('C:/Development/inversity');

// If you prefer using backslashes, ensure they are escaped properly:
// const projectRoot = path.resolve('C:\\Development\\inversity');

// Debug mode flag
const DEBUG = true;

/**
 * SECTION: File Selection Configuration
 */
// List specific files to include. Ensure paths are relative to projectRoot.
const inclusionList = []; // Leave empty to include all files matching the rules.

/**
 * SECTION: Exclusion Configuration
 */
// Directories to exclude entirely
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.vscode',
  'cache',
];

// Specific files to exclude
const EXCLUDED_FILES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
];

// File extensions to exclude
const EXCLUDED_EXTENSIONS = ['.log', '.map', '.tmp', '.lock'];

// File extensions to include
const INCLUDED_EXTENSIONS = /\.(js|ts|tsx|scss|css|html|json|md|env)$/;

// Utility: Debug logging
const debugLog = (...args) => {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
};

/**
 * Checks if a directory or file should be excluded
 */
const shouldExclude = (fullPath) => {
  // Normalize paths to use forward slashes for consistency
  const relativePath = path.relative(projectRoot, fullPath).replace(/\\/g, '/');
  const basename = path.basename(fullPath);

  if (!fs.existsSync(fullPath)) {
    debugLog(`Skipping non-existent path: ${fullPath}`);
    return true; // Treat non-existent paths as excluded
  }

  // Exclude directories
  if (fs.statSync(fullPath).isDirectory()) {
    return EXCLUDED_DIRS.some(
      (dir) =>
        relativePath.includes(`/${dir}/`) || // Directory nested somewhere
        relativePath.startsWith(`${dir}/`) || // Directory at root
        relativePath === dir // Exact match
    );
  }

  // Exclude specific files by name or full relative path
  if (fs.statSync(fullPath).isFile()) {
    const isExactExcludedFile = EXCLUDED_FILES.some(
      (file) => file === relativePath || file === basename
    );

    const isExcludedExtension = EXCLUDED_EXTENSIONS.includes(
      path.extname(fullPath)
    );
    if (isExactExcludedFile) {
      debugLog(`Explicitly excluding file: ${relativePath}`);
    }
    return isExactExcludedFile || isExcludedExtension;
  }

  return false;
};

/**
 * Recursively gets all files while respecting inclusion/exclusion rules
 */
const getAllFiles = (dirPath, arrayOfFiles = []) => {
  debugLog(`Scanning directory: ${dirPath}`);

  // First check if the directory should be excluded
  if (shouldExclude(dirPath)) {
    debugLog(`Skipping excluded directory: ${dirPath}`);
    return arrayOfFiles;
  }

  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);

      try {
        const stats = fs.lstatSync(fullPath);

        // Skip symlinks
        if (stats.isSymbolicLink()) {
          debugLog(`Skipping symlink: ${fullPath}`);
          continue;
        }

        if (stats.isDirectory()) {
          if (!shouldExclude(fullPath)) {
            debugLog(`Recursing into directory: ${fullPath}`);
            getAllFiles(fullPath, arrayOfFiles);
          } else {
            debugLog(`Skipping excluded directory: ${fullPath}`);
          }
        } else if (stats.isFile()) {
          const filename = path.basename(fullPath);

          // Respect inclusion list if it's not empty
          if (inclusionList.length > 0) {
            const relativePath = path
              .relative(projectRoot, fullPath)
              .replace(/\\/g, '/');
            if (inclusionList.includes(relativePath)) {
              debugLog(`Adding file from inclusion list: ${fullPath}`);
              arrayOfFiles.push(fullPath);
            } else {
              debugLog(`Skipping file not in inclusion list: ${fullPath}`);
            }
          } else if (
            INCLUDED_EXTENSIONS.test(filename) &&
            !shouldExclude(fullPath)
          ) {
            debugLog(`Adding file: ${fullPath}`);
            arrayOfFiles.push(fullPath);
          } else {
            debugLog(`Skipping file: ${fullPath}`);
          }
        }
      } catch (error) {
        console.error(`Error processing path ${fullPath}:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }

  return arrayOfFiles;
};

/**
 * Gets formatted date and time string for file naming
 */
const getFormattedDateTime = () => {
  const now = new Date();
  return now
    .toISOString()
    .replace(/[:\-T]/g, '_')
    .split('.')[0];
};

/**
 * Main concatenation function
 */
const concatenateFiles = () => {
  console.log('Starting file concatenation...');
  console.log(`Project root: ${projectRoot}`);

  const filesToProcess = getAllFiles(projectRoot);
  console.log(`Found ${filesToProcess.length} files to process`);

  // Define the output file path. You can change it as needed.
  const outputFile = path.join(
    projectRoot, // Output file will be placed at the project root
    `session-files-${getFormattedDateTime()}.txt`
  );

  // Clear/create output file
  fs.writeFileSync(outputFile, '');

  // Process each file
  filesToProcess.forEach((filePath) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');

      const relativePath = path
        .relative(projectRoot, filePath)
        .replace(/\\/g, '/');
      fs.appendFileSync(outputFile, `\n\n=== Start of ${relativePath} ===\n\n`);
      fs.appendFileSync(outputFile, fileContent);
      fs.appendFileSync(outputFile, `\n\n=== End of ${relativePath} ===\n\n`);

      console.log(`Processed: ${relativePath}`);
    } catch (error) {
      console.error(`Error processing file: ${filePath}`, error.message);
    }
  });

  console.log(`\nConcatenation complete! Output file: ${outputFile}`);
};

/**
 * Test Exclusions
 */
const testExclusions = () => {
  console.log('\nTesting exclusions...');
  [
    `${projectRoot}/node_modules/somepackage/index.js`,
    `${projectRoot}/.next/cache/file.js`,
    `${projectRoot}/src/components/Button.tsx`,
    `${projectRoot}/package-lock.json`,
    `${projectRoot}/.git/config`,
    `${projectRoot}/dist/bundle.js`,
  ].forEach((testPath) => {
    const shouldBeExcluded = shouldExclude(testPath);
    console.log(`${testPath}: ${shouldBeExcluded ? 'EXCLUDED' : 'INCLUDED'}`);
  });
};

// Run test first
testExclusions();

// Run the concatenation
concatenateFiles();
