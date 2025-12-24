// @vitest-environment node
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('PWA Configuration and Assets', () => {
    const publicPath = path.resolve(__dirname, '../../public');
    const viteConfigPath = path.resolve(__dirname, '../../vite.config.js');

    it('has vite-plugin-pwa configured in vite.config.js', async () => {
        const configContent = fs.readFileSync(viteConfigPath, 'utf-8');
        expect(configContent).toContain('VitePWA(');
        expect(configContent).toContain("name: 'Action Atlas'");
        expect(configContent).toContain("short_name: 'ActionAtlas'");
    });

    it('has the manifest defined with correct properties', async () => {
        const configContent = fs.readFileSync(viteConfigPath, 'utf-8');
        // Simple regex check for manifest properties
        expect(configContent).toMatch(/theme_color:\s*'#0a0f1e'/);
        expect(configContent).toMatch(/registerType:\s*'autoUpdate'/);
    });

    const requiredAssets = [
        'favicon.ico',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon.png',
        'apple-touch-icon.png'
    ];

    it.each(requiredAssets)('contains the required asset: %s', (assetName) => {
        const assetPath = path.join(publicPath, assetName);
        const exists = fs.existsSync(assetPath);
        expect(exists).toBe(true);
    });
});
