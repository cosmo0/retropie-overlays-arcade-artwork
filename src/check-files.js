/*
* Checks that the files are all correctly configured
*/

const fs = require('fs-extra');
const path = require('path');
const readlineSync = require('readline-sync');
const sharp = require('sharp');

const templateOverlay = fs.readFileSync('src/template-overlay.cfg', { encoding: 'utf-8' });
const templateRom = fs.readFileSync('src/template-game.cfg', { encoding: 'utf-8' });

const romsFolder = 'overlays/roms';
const overlaysFolder = 'overlays/configs';

const configPath = '/opt/retropie/configs/all/retroarch/overlay/arcade-artwork';

let usedOverlays = [];

console.log('');
console.log('');
console.log('===== Checking roms =====');

let replacePath = readlineSync.keyInYNStrict('Autocorrect any wrong path?');

let romsFiles = fs.readdirSync(romsFolder).filter(file => file.endsWith('.cfg') && !file.startsWith('_'));
for (let romFile of romsFiles) {
    // get overlay file path
    let cfgContent = fs.readFileSync(path.join(romsFolder, romFile), { encoding: 'utf-8' });
    let overlayFile = /input_overlay[\s]*=[\s]*"?(.*\.cfg)"?/igm.exec(cfgContent)[1]; // extract overlay path

    // check overlays is configured with absolute path
    if (!overlayFile.startsWith(configPath)) {
        console.log('> Overlay for rom %s has a relative path: %s', romFile, overlayFile);
        if (replacePath) {
            overlayFile = overlayFile.substring(overlayFile.lastIndexOf('/') + 1); // just the file name
            overlayFile = '/opt/retropie/configs/all/retroarch/overlay/arcade-artwork/' + overlayFile;
            let newContent = cfgContent.replace(/input_overlay[\s]*=[\s]*"?(.*\.cfg)"?/igm, 'input_overlay = ' + overlayFile);
            fs.writeFileSync(path.join(romsFolder, romFile), newContent);
        }
    } else {
        overlayFile = overlayFile.substring(overlayFile.lastIndexOf('/') + 1); // just the file name
        let packOverlayFile = path.join(overlaysFolder, overlayFile); // concatenate with pack path
        usedOverlays.push(overlayFile);

        // check that the overlay file exists
        if (!fs.existsSync(packOverlayFile)) {
            console.log('> Overlay %s for rom %s does not exist', packOverlayFile, romFile);
            readlineSync.keyInPause();
        }
    }
}

console.log('%i roms processed', romsFiles.length);

console.log('');
console.log('');
console.log('===== Checking overlays =====');

let createRoms = readlineSync.keyInYNStrict('Do you wish to create rom configs for unused overlays?');

let overlayImagesUsed = []; // used images in overlays configs

let overlaysFiles = fs.readdirSync(overlaysFolder).filter(file => file.endsWith('.cfg'));
let overlayPromises = [];
for (let overlayFile of overlaysFiles) {
    // get image file name
    let overlayContent = fs.readFileSync(path.join(overlaysFolder, overlayFile), { encoding: 'utf-8' });
    let overlayImage = /overlay0_overlay[\s]*=[\s]*"?(.*\.png)"?/igm.exec(overlayContent)[1];
    overlayImagesUsed.push(overlayImage);
    let overlayImageFile = path.join(overlaysFolder, overlayImage);

    // check that the image exists
    if (!fs.existsSync(overlayImageFile)) {
        console.log('> Image file %s for overlay %s does not exist', overlayImage, overlayFile);
        readlineSync.keyInPause();
    } else {
        // resize the overlay if necessary
        var img = sharp(overlayImageFile);
        overlayPromises.push({ promise: img.metadata(), img, file: overlayImageFile });
    }

    // check that a rom config uses this overlay
    let romFile = overlayFile.replace('.cfg', '.zip.cfg');

    if (createRoms && usedOverlays.indexOf(overlayFile) < 0 && !fs.existsSync(romFile)) {
        console.log('> Creating rom config for overlay %s', overlayFile);
        fs.writeFileSync(
            path.join(romsFolder, romFile),
            templateRom.replace('{{game}}', overlayFile.replace('.cfg', '')));
    }
}

console.log('%i overlays processed', overlaysFiles.length);

let overlaysCreated = 0;
if (readlineSync.keyInYNStrict('Do you wish to create overlays configs for unused images?')) {
    let overlaysImagesFiles = fs.readdirSync(overlaysFolder).filter(file => file.endsWith('.png'));
    for (let overlayImageFile of overlaysImagesFiles) {
        // check that the image is used
        if (overlayImagesUsed.indexOf(overlayImageFile) < 0) {
            let game = overlayImageFile.replace('.png', '');

            console.log('Creating overlay config for %s', overlayImageFile);
            fs.writeFileSync(
                path.join(overlaysFolder, game + '.cfg'),
                templateOverlay.replace('{{game}}', game));
            
            // then obviously create a rom config
            fs.writeFileSync(
                path.join(romsFolder, game + '.zip.cfg'),
                templateRom.replace('{{game}}', game));
            
            overlaysCreated++;
        }
    }
}

console.log('%i overlays created', overlaysCreated);

if (overlayPromises.length > 0) {
    console.log('');
    console.log('');
    console.log('===== Resize overlays =====');

    if (readlineSync.keyInYNStrict('Do you wish to resize the overlays?')) {
        overlayPromises.forEach(p => {
            p.promise.then(meta => {
                // make sure the image is resized in 1080p
                if (meta.width > 1920 || meta.height > 1080) {
                    console.log('> Must resize the image %s to 1080p', p.file);
                    return p.img
                        .resize(1920, 1080)
                        .crop(sharp.strategy.center)
                        .toBuffer();
                }
            }).then(buffer => {
                if (buffer && buffer != null) {
                    fs.writeFileSync(p.file, buffer);
                    console.log('> Resize OK - %s', p.file);
                }
            });
        });
    }
}
