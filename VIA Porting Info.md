# Making a board compatible with VIA Configurator

**💥NOTE💥: Don't do this yet, all of this stuff is still 🚑💣BLEEDING EDGE💣🚑, and you will 🔪cut yourself🔪 badly if you choose to do it. Please wait for 🗿Wilba's QMK code to be refactored prior to pushing anything to QMK, as we don't want to end up with a bunch of different forks of the code.**

So you've seen VIA Configurator in action, and you want to get this magic supported for your board?

There's two main steps:
1. Add dynamic keymap support to keyboard in QMK
2. Add layout to VIA

### Example
Here's an example port of the Iris that was done based on the WT60-A code:
- [QMK Changes](https://github.com/qmk/qmk_firmware/pull/4849/commits/7795bd585c33da2120550d7e6815fb3caa05f2aa)
- [VIA Changes](https://github.com/olivia/via-config/pull/35)

## Adding support in QMK

Wilba suggests looking at the [WT60-A](https://github.com/qmk/qmk_firmware/tree/master/keyboards/wilba_tech/wt60_a) as an example on getting a PCB compatible with VIA Configurator.

### Changes to `config.h`

1. Make sure `VENDOR_ID`/`PRODUCT_ID` combo is unique, as VIA uses this to detect what board is used. You'll need this later on.
2. Add the lines for EEPROM and DYNAMIC_KEYMAP stuff at the bottom. Make sure you change the values for `DYNAMIC_KEYMAP_MACRO_EEPROM_ADDR` and `DYNAMIC_KEYMAP_MACRO_EEPROM_SIZE` as specified below.

```c
#define DYNAMIC_KEYMAP_LAYER_COUNT 4

// EEPROM usage

// TODO: refactor with new user EEPROM code (coming soon)
#define EEPROM_MAGIC 0x451F
#define EEPROM_MAGIC_ADDR 32
// Bump this every time we change what we store
// This will automatically reset the EEPROM with defaults
// and avoid loading invalid data from the EEPROM
#define EEPROM_VERSION 0x08
#define EEPROM_VERSION_ADDR 34

// Dynamic keymap starts after EEPROM version
#define DYNAMIC_KEYMAP_EEPROM_ADDR 35
// Dynamic macro starts after dynamic keymaps (35+(4*10*6*2)) = (35+480)
#define DYNAMIC_KEYMAP_MACRO_EEPROM_ADDR 515    // **** CHANGE THIS BASED ON MATRIX_ROWS & MATRIX_COLS ****
#define DYNAMIC_KEYMAP_MACRO_EEPROM_SIZE 509    // **** CHANGE THIS BASED ON 1024-DYNAMIC_KEYMAP_MACRO_EEPROM_ADDR ****
#define DYNAMIC_KEYMAP_MACRO_COUNT 16

```

#### Calculating `DYNAMIC_KEYMAP_MACRO_EEPROM_ADDR`:
`DYNAMIC_KEYMAP_MACRO_EEPROM_ADDR = DYNAMIC_KEYMAP_EEPROM_ADDR + (DYNAMIC_KEYMAP_LAYER_COUNT * MATRIX_ROWS * MATRIX_COLS * 2)`

#### Calculating `DYNAMIC_KEYMAP_MACRO_EEPROM_SIZE`:
`DYNAMIC_KEYMAP_MACRO_EEPROM_SIZE = 1024 - DYNAMIC_KEYMAP_MACRO_EEPROM_ADDR`

### Changes to `<keyboard>.c`

Remove code for `matrix_init_kb(void)`.

### Changes to `rules.mk`

Add:

```c
SRC += keyboards/wilba_tech/wt_main.c

RAW_ENABLE = yes
DYNAMIC_KEYMAP_ENABLE = yes
```

Remove any unnecessary features to clear up room for the dynamic keymap code being compiled into the .hex file.

## Adding support in VIA Configurator

Clone the [VIA Configurator repo](https://github.com/olivia/via-config) and create a new branch.

### Changes to `app/utils/device-meta.js`
1. Add new layout macro name in the `import {...} from './kle-parser';` section
2. Add device info to `DEVICE_META_MAP: DeviceMetaMap`

### Changes to `app/utils/hid-keyboards.js`
1. Add VENDOR_ID/PRODUCT_ID combo to `isValidVendorProduct` function

### Changes to `app/utils/layout-parser.js`

1. Copy LAYOUT macro from keyboard in QMK and paste into file as a new exported const
2. Add layout to `MatrixLayout`

### Changes to `app/utils/kle-parser.js`

1. Create layout in [KLE](http://www.keyboard-layout-editor.com)
    - For boards with columnar stagger (ergolumnar), right now, keep everything in the same row aligned together
2. Copy "Raw data" output
3. Add `export const LAYOUT_<keyboard name>` and paste KLE raw data output into it
4. If spacing between two keys in a row or the spacing from the edge to the first key in a row shows up weird, open up `Key.css` and copy/create a new indent class for the missing spacing, as seen here: https://github.com/olivia/via-config/pull/35/commits/d79e788d45b19d373cb977a7d0e3e9d700978987
