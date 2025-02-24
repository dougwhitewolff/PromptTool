
      const fs = require('fs');
      const path = require('path');

      const EXCLUDED_DIRECTORIES = ["node_modules",".next","dist",".git","public"];

      function getDirectoryStructure(dir) {
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          return entries
            .filter(entry => {
              if (entry.name.startsWith('.')) return false; // Exclude hidden files
              if (EXCLUDED_DIRECTORIES.includes(entry.name)) return false; // Exclude specific directories
              return true;
            })
            .map(entry => {
              const res = { name: entry.name, type: entry.isDirectory() ? 'directory' : 'file' };
              if (entry.isDirectory()) {
                res.children = getDirectoryStructure(path.join(dir, entry.name));
              }
              return res;
            })
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'directory' ? -1 : 1;
            });
        } catch (error) {
          console.error('Error in getDirectoryStructure:', error);
          throw error;
        }
      }

      try {
        const structure = getDirectoryStructure('C:\Development\inversity');
        fs.writeFileSync('C:\Development\inversity\apps\web\public\file-structure.json', JSON.stringify(structure, null, 2));
        console.log('File structure successfully written to file-structure.json');
      } catch (error) {
        console.error('Error generating directory structure:', error);
        process.exit(1); // Exit with failure code
      }
    