#ifdef _WIN32
#include <windows.h>
#include <stdio.h>

__declspec(dllexport) void keyDown(unsigned char key) {
    INPUT keyInput;
    keyInput.type = INPUT_KEYBOARD;
    keyInput.ki.wScan = MapVirtualKey(key, MAPVK_VK_TO_VSC);
    keyInput.ki.time = 0;
    keyInput.ki.dwExtraInfo = 0;
    keyInput.ki.wVk = key;
    keyInput.ki.dwFlags = 0;
    SendInput(1, &keyInput, sizeof(INPUT));
}

__declspec(dllexport) void keyUp(unsigned char key) {
    INPUT keyInput;
    keyInput.type = INPUT_KEYBOARD;
    keyInput.ki.wScan = MapVirtualKey(key, MAPVK_VK_TO_VSC);
    keyInput.ki.time = 0;
    keyInput.ki.dwExtraInfo = 0;
    keyInput.ki.wVk = key;
    keyInput.ki.dwFlags = KEYEVENTF_KEYUP;
    SendInput(1, &keyInput, sizeof(INPUT));
}

__declspec(dllexport) void mouseDown(int button) {
    DWORD event;
    switch (button) {
        case 0:
            event = MOUSEEVENTF_LEFTDOWN;
            break;
        case 1:
            event = MOUSEEVENTF_RIGHTDOWN;
            break;
        case 2:
            event = MOUSEEVENTF_MIDDLEDOWN;
            break;
        default:
            printf("Invalid input.");
    }

    INPUT mouseInput;
    mouseInput.type = INPUT_MOUSE;
    mouseInput.mi.dwFlags = event;
    mouseInput.mi.dx = 0;
    mouseInput.mi.dy = 0;
    mouseInput.mi.mouseData = 0;
    mouseInput.mi.time = 0;
    mouseInput.mi.dwExtraInfo = 0;
    SendInput(1, &mouseInput, sizeof(INPUT));
}

__declspec(dllexport) void mouseUp(int button) {
    DWORD event;
    switch (button) {
        case 0:
            event = MOUSEEVENTF_LEFTUP;
            break;
        case 1:
            event = MOUSEEVENTF_RIGHTUP;
            break;
        case 2:
            event = MOUSEEVENTF_MIDDLEUP;
            break;
        default:
            printf("Invalid input.");
    }

    INPUT mouseInput;
    mouseInput.type = INPUT_MOUSE;
    mouseInput.mi.dwFlags = event;
    mouseInput.mi.dx = 0;
    mouseInput.mi.dy = 0;
    mouseInput.mi.mouseData = 0;
    mouseInput.mi.time = 0;
    mouseInput.mi.dwExtraInfo = 0;
    SendInput(1, &mouseInput, sizeof(INPUT));
}

__declspec(dllexport) void setCursor(int x, int y) {
    INPUT mouseInput;
    mouseInput.type = INPUT_MOUSE;
    mouseInput.mi.dx = (x * 65535) / GetSystemMetrics(SM_CXSCREEN);
    mouseInput.mi.dy = (y * 65535) / GetSystemMetrics(SM_CYSCREEN);
    mouseInput.mi.mouseData = 0;
    mouseInput.mi.time = 0;
    mouseInput.mi.dwExtraInfo = 0;
    mouseInput.mi.dwFlags = MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE;
    SendInput(1, &mouseInput, sizeof(INPUT));
}

__declspec(dllexport) void setCursorNA(int x, int y) {
    INPUT mouseInput;
    mouseInput.type = INPUT_MOUSE;
    mouseInput.mi.dx = x;
    mouseInput.mi.dy = y;
    mouseInput.mi.mouseData = 0;
    mouseInput.mi.time = 0;
    mouseInput.mi.dwExtraInfo = 0;
    mouseInput.mi.dwFlags = MOUSEEVENTF_MOVE;
    SendInput(1, &mouseInput, sizeof(INPUT));
}

__declspec(dllexport) void setCursorR(int x, int y) {
    SetCursorPos(x, y);
}

__declspec(dllexport) void scroll(int amount) {
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

__declspec(dllexport) void getCursor(int* coords) {
    POINT p;
    GetCursorPos(&p);
    coords[0] = p.x;
    coords[1] = p.y;
}

__declspec(dllexport) void getScreenSize(int* size) {
    size[0] = GetSystemMetrics(SM_CXSCREEN);
    size[1] = GetSystemMetrics(SM_CYSCREEN);
}

__declspec(dllexport) void getPixelColor(int x, int y, int* rgb) {
    HDC hdc = GetDC(NULL);
    COLORREF color = GetPixel(hdc, x, y);
    ReleaseDC(NULL, hdc);

    rgb[0] = GetRValue(color);
    rgb[1] = GetGValue(color);
    rgb[2] = GetBValue(color);
}

#else
#include <stdio.h>
void keyDown() {
    // No-op on non-Windows platforms
    printf("Key press not supported on this platform.\n");
}
#endif