#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

typedef struct {
    const char* key;
    int mapping;
    int isMouse;
} KeyMap;

KeyMap keyMap[] = {
    {"A", 10000 + 'A', 0}, {"B", 10000 + 'B', 0}, {"C", 10000 + 'C', 0}, {"D", 10000 + 'D', 0}, {"E", 10000 + 'E', 0}, 
    {"F", 10000 + 'F', 0}, {"G", 10000 + 'G', 0}, {"H", 10000 + 'H', 0}, {"I", 10000 + 'I', 0}, {"J", 10000 + 'J', 0}, 
    {"K", 10000 + 'K', 0}, {"L", 10000 + 'L', 0}, {"M", 10000 + 'M', 0}, {"N", 10000 + 'N', 0}, {"O", 10000 + 'O', 0}, 
    {"P", 10000 + 'P', 0}, {"Q", 10000 + 'Q', 0}, {"R", 10000 + 'R', 0}, {"S", 10000 + 'S', 0}, {"T", 10000 + 'T', 0}, 
    {"U", 10000 + 'U', 0}, {"V", 10000 + 'V', 0}, {"W", 10000 + 'W', 0}, {"X", 10000 + 'X', 0}, {"Y", 10000 + 'Y', 0}, 
    {"Z", 10000 + 'Z', 0}, {"a", 'A', 0}, {"b", 'B', 0}, {"c", 'C', 0}, {"d", 'D', 0}, {"e", 'E', 0}, 
    {"f", 'F', 0}, {"g", 'G', 0}, {"h", 'H', 0}, {"i", 'I', 0}, {"j", 'J', 0}, {"k", 'K', 0}, 
    {"l", 'L', 0}, {"m", 'M', 0}, {"n", 'N', 0}, {"o", 'O', 0}, {"p", 'P', 0}, {"q", 'Q', 0}, 
    {"r", 'R', 0}, {"s", 'S', 0}, {"t", 'T', 0}, {"u", 'U', 0}, {"v", 'V', 0}, {"w", 'W', 0}, 
    {"x", 'X', 0}, {"y", 'Y', 0}, {"z", 'Z', 0}, {"1", '1', 0}, {"2", '2', 0}, {"3", '3', 0}, 
    {"4", '4', 0}, {"5", '5', 0}, {"6", '6', 0}, {"7", '7', 0}, {"8", '8', 0}, {"9", '9', 0}, 
    {"0", '0', 0}, {"ENTER", VK_RETURN, 0}, {"SHIFT", VK_SHIFT, 0}, {"CTRL", VK_CONTROL, 0}, 
    {"ALT", VK_MENU, 0}, {"SPACE", VK_SPACE, 0}, {"ESC", VK_ESCAPE, 0}, {"LEFT", VK_LEFT, 0}, 
    {"RIGHT", VK_RIGHT, 0}, {"UP", VK_UP, 0}, {"DOWN", VK_DOWN, 0}, {"MB_LEFT", MOUSEEVENTF_LEFTDOWN, 1}, 
    {"MB_RIGHT", MOUSEEVENTF_RIGHTDOWN, 1}, {"MB_MIDDLE", MOUSEEVENTF_MIDDLEDOWN, 1},
    {"!", 10000 + '1', 0}, {"@", 10000 + '2', 0}, {"#", 10000 + '3', 0}, {"$", 10000 + '4', 0}, 
    {"%", 10000 + '5', 0}, {"^", 10000 + '6', 0}, {"&", 10000 + '7', 0}, {"*", 10000 + '8', 0}, 
    {"(", 10000 + '9', 0}, {")", 10000 + '0', 0}, {"_", 10000 + VK_OEM_MINUS, 0}, 
    {"+", 10000 + VK_OEM_PLUS, 0}, {"~", 10000 + VK_OEM_3, 0}, {"{", 10000 + VK_OEM_4, 0}, 
    {"}", 10000 + VK_OEM_6, 0}, {"|", 10000 + VK_OEM_102, 0}, {":", 10000 + VK_OEM_1, 0}, 
    {"\"", 10000 + VK_OEM_7, 0}, {"<", 10000 + VK_OEM_COMMA, 0}, {">", 10000 + VK_OEM_PERIOD, 0}, 
    {"?", 10000 + VK_OEM_2, 0}, {"=", VK_OEM_PLUS, 0}, {"-", VK_OEM_MINUS, 0}, {"`", VK_OEM_3, 0}, 
    {"[", VK_OEM_4, 0}, {"]", VK_OEM_6, 0}, {"\\", VK_OEM_5, 0}, {";", VK_OEM_1, 0}, 
    {"'", VK_OEM_7, 0}, {",", VK_OEM_COMMA, 0}, {".", VK_OEM_PERIOD, 0}, {"/", VK_OEM_2, 0}, 
    {"CMD", VK_LWIN, 0}, {"WIN", VK_LWIN, 0}, {"CAPS", VK_CAPITAL, 0}, {"TAB", VK_TAB, 0}, 
    {"LIST", VK_APPS, 0}, {"END", VK_END, 0}, {"PRNTSCR", VK_SNAPSHOT, 0}, {"SCRL_LOCK", VK_SCROLL, 0}, 
    {"PAUSE", VK_PAUSE, 0}, {"PG_UP", VK_PRIOR, 0}, {"PG_DOWN", VK_NEXT, 0}, {"HOME", VK_HOME, 0}, 
    {"INS", VK_INSERT, 0}, {"DEL", VK_DELETE, 0}
};

int keyMapSize = sizeof(keyMap) / sizeof(KeyMap);

void exitError(char* msg, FILE* file) {
    printf("%s", msg);
    fclose(file);
    exit(1);
}

int isValidInteger(const char* str, int positive) {
    if (*str == '\0') return 0;
    if (*str == '-' && !positive) str++;

    while (*str) {
        if (!isdigit(*str)) {
            return 0;
        }
        str++;
    }

    return 1;
}

INPUT keyToINPUT(WORD vkey, int up) {
    INPUT keyInput;
    keyInput.type = INPUT_KEYBOARD;
    keyInput.ki.wScan = MapVirtualKey(vkey, MAPVK_VK_TO_VSC);
    keyInput.ki.time = 0;
    keyInput.ki.dwExtraInfo = 0;
    keyInput.ki.wVk = vkey;
    keyInput.ki.dwFlags = up ? KEYEVENTF_KEYUP : 0;
    return keyInput;
}

INPUT mouseClickToINPUT(DWORD event) {
    INPUT mouseInput;
    mouseInput.type = INPUT_MOUSE;
    mouseInput.mi.dwFlags = event;
    mouseInput.mi.dx = 0;
    mouseInput.mi.dy = 0;
    mouseInput.mi.mouseData = 0;
    mouseInput.mi.time = 0;
    mouseInput.mi.dwExtraInfo = 0;
    return mouseInput;
}

void scroll(int amount) {
    INPUT mouseInput;
    mouseInput.type = INPUT_MOUSE;
    mouseInput.mi.dx = 0;
    mouseInput.mi.dy = 0;
    mouseInput.mi.mouseData = WHEEL_DELTA * amount;
    mouseInput.mi.time = 0;
    mouseInput.mi.dwExtraInfo = 0;
    mouseInput.mi.dwFlags = MOUSEEVENTF_WHEEL;
    SendInput(1, &mouseInput, sizeof(INPUT));
}

KeyMap* findKey(const char* key) {
    for (int i = 0; i < keyMapSize; i++) {
        if (strcmp(keyMap[i].key, key) == 0)
            return &keyMap[i];
    }
    return NULL;
}

int pressKey(const char* key, int *isShiftDown) {
    KeyMap* km = findKey(key);
    if (!km) {
        printf("Invalid key: %s\n", key);
        return 0;
    }

    if (km->isMouse) {
        INPUT mouseInput = mouseClickToINPUT(km->mapping);
        SendInput(1, &mouseInput, sizeof(INPUT));
    } 
    else {
        int mappingValue = km->mapping;
        int prefix = mappingValue / 10000;
        int code = mappingValue % 10000;

        if (strcmp(key, "SHIFT") == 0) {
            *isShiftDown = 1;
        }
        else if (prefix == 1 && !*isShiftDown) {
            INPUT shift = keyToINPUT(VK_SHIFT, 0);
            SendInput(1, &shift, sizeof(INPUT));
        }

        INPUT keyInput = keyToINPUT(code, 0);
        SendInput(1, &keyInput, sizeof(INPUT));
    }

    return 1;
}

int releaseKey(const char* key, int *isShiftDown) {
    KeyMap* km = findKey(key);
    if (!km) {
        printf("Invalid key: %s\n", key);
        return 0;
    }
    
    if (km->isMouse) {
        int releaseEvent;

        if (km->mapping == MOUSEEVENTF_LEFTDOWN)
            releaseEvent = MOUSEEVENTF_LEFTUP;
        else if (km->mapping == MOUSEEVENTF_RIGHTDOWN)
            releaseEvent = MOUSEEVENTF_RIGHTUP;
        else
            releaseEvent = MOUSEEVENTF_MIDDLEUP;

        INPUT mouseInput = mouseClickToINPUT(releaseEvent);
        SendInput(1, &mouseInput, sizeof(INPUT));
    } 
    else {
        int mappingValue = km->mapping;
        int prefix = mappingValue / 10000;
        int code = mappingValue % 10000;

        INPUT keyInput = keyToINPUT(code, 1);
        SendInput(1, &keyInput, sizeof(INPUT));

        if (strcmp(key, "SHIFT") == 0) {
            *isShiftDown = 0;
        }
        else if (prefix == 1 && !*isShiftDown) {
            INPUT shift = keyToINPUT(VK_SHIFT, 1);
            SendInput(1, &shift, sizeof(INPUT));
        }
    }

    return 1;
}

void parseAndRun(const char* filename, int repeat) {
    FILE* file = fopen(filename, "r");
    if (!file) {
        printf("Error opening file: %s\n", filename);
        exit(1);
    }

    char line[256];
    int loopCount = 0;

    while (repeat < 0 || loopCount < repeat) {
        rewind(file);
        int isShiftDown = 0;

        while (fgets(line, sizeof(line), file)) {
            char command = line[0];
            char* argument = line + 1;
            argument[strcspn(argument, "\n")] = 0;

            switch (command) {
                case 'p':
                    if (!pressKey(argument, &isShiftDown)) {
                        exitError("", file);
                    }
                    break;
                case 'r':
                    if (!releaseKey(argument, &isShiftDown)) {
                        exitError("", file);
                    }
                    break;
                case 'w':
                    if (!isValidInteger(argument, 1)) {
                        exitError("Invalid integer given to wait command\n", file);
                    }
                    Sleep(atoi(argument));
                    break;
                case 'c': {
                    int x, y;
                    if (sscanf(argument, "%d,%d", &x, &y) != 2) {
                        exitError("Invalid cursor move command\n", file);
                    }
                    SetCursorPos(x, y);
                    break;
                }
                case 's':
                    scroll(atoi(argument));
                    break;
                default:
                    printf("Invalid command: %c\n", command);
                    exitError("", file);
            }
        }

        if (isShiftDown) {
            INPUT input = {0};
            input.type = INPUT_KEYBOARD;
            input.ki.wVk = VK_SHIFT;
            input.ki.dwFlags = KEYEVENTF_KEYUP;
            SendInput(1, &input, sizeof(INPUT));
            isShiftDown = 0;
        }

        loopCount++;
    }

    fclose(file);
}

int main(int argc, char* argv[]) {
    // Invalid argument count, return usage
    if (argc < 2) {
        printf("Usage: %s <script.keyc> [repeat]\n", argv[0]);
        return 1;
    }

    // Deal with "Repeat" argument
    int repeat = 1;
    if (argc > 2) {
        if (strcmp(argv[2], "ON") == 0) repeat = -1;
        else if (strcmp(argv[2], "OFF") == 0) repeat = 1;
        else {
            int val = atoi(argv[2]);
            if (val == 0 && strcmp(argv[2], "0") != 0) {
                printf("Argument given for repeat is invalid: %s\n", argv[2]);
                return 1;
            }
            repeat = val;
        }
    }

    // Get file name (account for whether .keyc is there)
    char filename[256];
    snprintf(filename, sizeof(filename), "%s", argv[1]);
    if (!strstr(filename, ".keyc"))
        strcat(filename, ".keyc");

    parseAndRun(filename, repeat);
    return 0;
}