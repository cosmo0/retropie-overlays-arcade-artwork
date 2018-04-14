# Retropie artwork arcade overlays pack

Overlays (or bezels) are images added "above" the emulator, to mask the black borders around the image.

This pack adds simple artwork overlays for arcade games.

**Usage of the pack in a commercial product is strictly forbidden.**

## Credits

Please see [credits](CREDITS.md) to check out the awesome original packs I picked from.  
I did mostly nothing except move files around and mess with config files. If you think these overlays are good, please go thank the original authors.

If one of your file is here and you want me to remove it, or want to be credited, please [file an issue](https://github.com/cosmo0/retropie-arcade-overlays/issues).

## Artwork overlays (1235 games)

Compilation of "artwork-style" arcade overlays for many games.

There is an artwork or fanart images around the game area, to maximize it, and just cover the black border around with an image. Sometimes it's inspired from the artwork on the real cabinet, sometimes it's completely custom-made.

## Installation

Use the [Retropie Arcade Manager](https://github.com/cosmo0/retropie-arcade-manager/) tool to install these overlays.

## Content details

Mix between [Mamehead](https://forums.libretro.com/t/arcade-overlays/4084/284), [Derek Moore](https://www.youtube.com/user/oldstarscream), [UDb23](https://github.com/UDb23/rpie-ovl) and [Simbz33](https://github.com/simbz33/retropie-overlay) creations and compilations.

The compilation is "complete", and does not care whether the games works on your raspberry pi, needs special hardware (lightgun...), does not work in MAME2003, etc.

However, if a parent game does not work in MAME but one of its clone does, the config files will exist for both games; that's why there seem to be duplicates and clones.
No shader is configured ; you can set a system-wide shader by editing the `retroarch.cfg` file at the root of your system config folder.

I have removed the screen bezels (TV-like borders) when present in the originals, because I want the overlays to have a coherent look and removing all was the easiest way.

Some overlays have a black and white vertical gradient that I find quite disturbing, but removing them would require a bit more work than I'm prepared to do. Feel free to edit them out and make a pull request, if you're so inclined.
