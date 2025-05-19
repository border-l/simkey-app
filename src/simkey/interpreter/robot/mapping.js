const Vk = {
    VK_F1: 0x70, VK_F2: 0x71, VK_F3: 0x72, VK_F4: 0x73,
    VK_F5: 0x74, VK_F6: 0x75, VK_F7: 0x76, VK_F8: 0x77,
    VK_F9: 0x78, VK_F10: 0x79, VK_F11: 0x7A, VK_F12: 0x7B,
    VK_F13: 0x7C, VK_F14: 0x7D, VK_F15: 0x7E, VK_F16: 0x7F,
    VK_F17: 0x80, VK_F18: 0x81, VK_F19: 0x82, VK_F20: 0x83,
    VK_F21: 0x84, VK_F22: 0x85, VK_F23: 0x86, VK_F24: 0x87,

    VK_0: 0x30, VK_1: 0x31, VK_2: 0x32, VK_3: 0x33, VK_4: 0x34,
    VK_5: 0x35, VK_6: 0x36, VK_7: 0x37, VK_8: 0x38, VK_9: 0x39,

    VK_LWIN: 0x5B, VK_RWIN: 0x5C, VK_CONTROL: 0x11, VK_SHIFT: 0x10,
    VK_MENU: 0x12,
    VK_CAPITAL: 0x14,
    VK_TAB: 0x09,
    VK_SPACE: 0x20,
    VK_ESCAPE: 0x1B,
    VK_RETURN: 0x0D,
    VK_BACK: 0x08,

    VK_UP: 0x26,
    VK_DOWN: 0x28,
    VK_LEFT: 0x25,
    VK_RIGHT: 0x27,
    VK_END: 0x23,
    VK_HOME: 0x24,
    VK_INSERT: 0x2D,
    VK_DELETE: 0x2E,
    VK_PRIOR: 0x21,
    VK_NEXT: 0x22,

    VK_PAUSE: 0x13,
    VK_SNAPSHOT: 0x2C,
    VK_SCROLL: 0x91,
    VK_APPS: 0x5D,
    VK_NUMLOCK: 0x90,
    VK_CLEAR: 0x0C,

    VK_NUMPAD0: 0x60, VK_NUMPAD1: 0x61, VK_NUMPAD2: 0x62,
    VK_NUMPAD3: 0x63, VK_NUMPAD4: 0x64, VK_NUMPAD5: 0x65,
    VK_NUMPAD6: 0x66, VK_NUMPAD7: 0x67, VK_NUMPAD8: 0x68,
    VK_NUMPAD9: 0x69,
    VK_ADD: 0x6B, VK_SUBTRACT: 0x6D, VK_MULTIPLY: 0x6A,
    VK_DIVIDE: 0x6F, VK_DECIMAL: 0x6E,

    VK_VOLUME_MUTE: 0xAD,
    VK_VOLUME_DOWN: 0xAE,
    VK_VOLUME_UP: 0xAF,
    VK_MEDIA_NEXT_TRACK: 0xB0,
    VK_MEDIA_PREV_TRACK: 0xB1,
    VK_MEDIA_STOP: 0xB2,
    VK_MEDIA_PLAY_PAUSE: 0xB3,

    VK_OEM_PLUS: 0xBB,
    VK_OEM_MINUS: 0xBD,
    VK_OEM_1: 0xBA,
    VK_OEM_2: 0xBF,
    VK_OEM_3: 0xC0,
    VK_OEM_4: 0xDB,
    VK_OEM_5: 0xDC,
    VK_OEM_6: 0xDD,
    VK_OEM_7: 0xDE,
    VK_OEM_COMMA: 0xBC,
    VK_OEM_PERIOD: 0xBE,
    VK_OEM_102: 0xE2
}


const mapping = {
    MB_LEFT: { code: 0, shift: null }, MB_RIGHT: { code: 1, shift: null }, MB_MIDDLE: { code: 2, shift: null },

    VOL_MUTE: { code: Vk.VK_VOLUME_MUTE, shift: false },
    VOL_DOWN: { code: Vk.VK_VOLUME_DOWN, shift: false },
    VOL_UP: { code: Vk.VK_VOLUME_UP, shift: false },

    MEDIA_NEXT: { code: Vk.VK_MEDIA_NEXT_TRACK, shift: false },
    MEDIA_PREV: { code: Vk.VK_MEDIA_PREV_TRACK, shift: false },
    MEDIA_STOP: { code: Vk.VK_MEDIA_STOP, shift: false },
    MEDIA_PLAY_PAUSE: { code: Vk.VK_MEDIA_PLAY_PAUSE, shift: false },

    BACK: { code: Vk.VK_BACK, shift: false },
    ENTER: { code: Vk.VK_RETURN, shift: false },
    SHIFT: { code: Vk.VK_SHIFT, shift: false },
    CTRL: { code: Vk.VK_CONTROL, shift: false },

    ALT: { code: Vk.VK_MENU, shift: false },
    SPACE: { code: Vk.VK_SPACE, shift: false },
    ESC: { code: Vk.VK_ESCAPE, shift: false },

    LEFT: { code: Vk.VK_LEFT, shift: false },
    RIGHT: { code: Vk.VK_RIGHT, shift: false },
    UP: { code: Vk.VK_UP, shift: false },
    DOWN: { code: Vk.VK_DOWN, shift: false },

    CMD: { code: Vk.VK_LWIN, shift: false },
    WIN: { code: Vk.VK_LWIN, shift: false },
    CAPS: { code: Vk.VK_CAPITAL, shift: false },
    TAB: { code: Vk.VK_TAB, shift: false },

    LIST: { code: Vk.VK_APPS, shift: false },
    END: { code: Vk.VK_END, shift: false },
    PRNTSCR: { code: Vk.VK_SNAPSHOT, shift: false },
    SCRL_LOCK: { code: Vk.VK_SCROLL, shift: false },

    PAUSE: { code: Vk.VK_PAUSE, shift: false },
    PG_UP: { code: Vk.VK_PRIOR, shift: false },
    PG_DOWN: { code: Vk.VK_NEXT, shift: false },
    HOME: { code: Vk.VK_HOME, shift: false },

    INS: { code: Vk.VK_INSERT, shift: false },
    DEL: { code: Vk.VK_DELETE, shift: false },

    ADD: { code: Vk.VK_ADD, shift: false },
    SUB: { code: Vk.VK_SUBTRACT, shift: false },
    MUL: { code: Vk.VK_MULTIPLY, shift: false },
    DIV: { code: Vk.VK_DIVIDE, shift: false },
    DEC: { code: Vk.VK_DECIMAL, shift: false },
    CLEAR: { code: Vk.VK_CLEAR, shift: false },

    "!":  { code: Vk.VK_1, shift: true },
    "@":  { code: Vk.VK_2, shift: true },
    "#":  { code: Vk.VK_3, shift: true },
    "$":  { code: Vk.VK_4, shift: true },
    "%":  { code: Vk.VK_5, shift: true },
    "^":  { code: Vk.VK_6, shift: true },
    "&":  { code: Vk.VK_7, shift: true },
    "*":  { code: Vk.VK_8, shift: true },
    "(":  { code: Vk.VK_9, shift: true },
    ")":  { code: Vk.VK_0, shift: true },
  
    "_":  { code: Vk.VK_OEM_MINUS, shift: true },
    "+":  { code: Vk.VK_OEM_PLUS, shift: true },
    "~":  { code: Vk.VK_OEM_3, shift: true },
    "{":  { code: Vk.VK_OEM_4, shift: true },
    "}":  { code: Vk.VK_OEM_6, shift: true },
    "|":  { code: Vk.VK_OEM_5, shift: true },
    ":":  { code: Vk.VK_OEM_1, shift: true },
    "\"": { code: Vk.VK_OEM_7, shift: true },
    "<":  { code: Vk.VK_OEM_COMMA, shift: true },
    ">":  { code: Vk.VK_OEM_PERIOD, shift: true },
    "?":  { code: Vk.VK_OEM_2, shift: true },
  
    "=":  { code: Vk.VK_OEM_PLUS, shift: false },
    "-":  { code: Vk.VK_OEM_MINUS, shift: false },
    "`":  { code: Vk.VK_OEM_3, shift: false },
    "[":  { code: Vk.VK_OEM_4, shift: false },
    "]":  { code: Vk.VK_OEM_6, shift: false },
    "\\": { code: Vk.VK_OEM_5, shift: false },
    ";":  { code: Vk.VK_OEM_1, shift: false },
    "'":  { code: Vk.VK_OEM_7, shift: false },
    ",":  { code: Vk.VK_OEM_COMMA, shift: false },
    ".":  { code: Vk.VK_OEM_PERIOD, shift: false },
    "/":  { code: Vk.VK_OEM_2, shift: false }
}

// Function mapping
for (let i = 1; i <= 24; i++) {
    mapping["F" + i] = { code: Vk["VK_F" + i], shift: false }
}

// Digit & Numpad digit mapping
for (let i = 0; i <= 9; i++) {
    mapping[i] = { code: String(i).charCodeAt(0), shift: false }
    mapping["NUM_" + i] = { code: Vk["VK_NUMPAD" + i], shift: false }
}

// Upper & lowercase letter mapping
for (let i = 65; i <= 90; i++) {
    mapping[String.fromCharCode(i)] = { code: i, shift: true }
    mapping[String.fromCharCode(i + 32)] = { code: i, shift: false }
}

module.exports = mapping