const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom Metro configurations here if needed
config.transformer = {
  ...config.transformer,
  // Ensure proper transformation for Expo Go v54
};

module.exports = config;
