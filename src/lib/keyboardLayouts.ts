// Legend arrays per layout for zone selection
export const LEGEND_ROWS: Record<string, string[][]> = {
  "60": [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "⌫"],
    ["⇥", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
    ["⇪", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "⏎"],
    ["⇧", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "⇧"],
    ["Ctrl", "⌘", "Alt", " ", "Alt", "⌘", "Fn", "Ctrl"],
  ],
  "65": [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "⌫", "Del"],
    ["⇥", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
    ["⇪", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "⏎"],
    ["⇧", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "⇧", "↑"],
    ["Ctrl", "⌘", "Alt", " ", "Alt", "Fn", "Ctrl", "←", "↓", "→"],
  ],
  "75": [
    ["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "Del"],
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "⌫", "Home"],
    ["⇥", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
    ["⇪", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "⏎"],
    ["⇧", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "⇧", "↑"],
    ["Ctrl", "⌘", "Alt", " ", "Alt", "Fn", "Ctrl", "←", "↓", "→"],
  ],
  "tkl": [
    ["Esc", "", "", "", "F1", "F2", "F3", "F4", "", "F5", "F6", "F7", "F8", "PrtSc", "ScrLk", "Pause", ""],
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "⌫", "", "Ins", "Home", "PgUp"],
    ["⇥", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\", "", "Del", "End", "PgDn"],
    ["⇪", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "⏎", "", "", ""],
    ["⇧", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "⇧", "", "", "↑", ""],
    ["Ctrl", "⌘", "Alt", " ", "Alt", "⌘", "Menu", "Ctrl", "", "←", "↓", "→"],
  ],
  "full": [
    ["Esc", "", "", "", "F1", "F2", "F3", "F4", "", "F5", "F6", "F7", "F8", "PrtSc", "ScrLk", "Pause", "", "", "", "", ""],
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "⌫", "", "Ins", "Home", "PgUp", "", "NumLk", "/", "*"],
    ["⇥", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\", "", "Del", "End", "PgDn", "", "7", "8", "9"],
    ["⇪", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "⏎", "", "", "", "", "", "", "4", "5", "6"],
    ["⇧", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "⇧", "", "", "↑", "", "", "", "1", "2", "3"],
    ["Ctrl", "⌘", "Alt", " ", "Alt", "⌘", "Menu", "Ctrl", "", "←", "↓", "→", "", "", "", "0", "", "."],
  ],
};

// Mod flags: true = modifier key (used for zone classification)
export const MOD_FLAGS: Record<string, boolean[][]> = {
  "60": [
    [false,false,false,false,false,false,false,false,false,false,false,false,false,true],
    [true,false,false,false,false,false,false,false,false,false,false,false,false,true],
    [true,false,false,false,false,false,false,false,false,false,false,false,true],
    [true,false,false,false,false,false,false,false,false,false,false,true],
    [true,true,true,true,true,true,true,true],
  ],
  "65": [
    [false,false,false,false,false,false,false,false,false,false,false,false,false,true,true],
    [true,false,false,false,false,false,false,false,false,false,false,false,false,true],
    [true,false,false,false,false,false,false,false,false,false,false,false,true],
    [true,false,false,false,false,false,false,false,false,false,false,true,true],
    [true,true,true,true,true,true,true,true,true,true],
  ],
  "75": [
    [true,true,true,true,true,true,true,true,true,true,true,true,true,true],
    [false,false,false,false,false,false,false,false,false,false,false,false,false,true,true],
    [true,false,false,false,false,false,false,false,false,false,false,false,false,true],
    [true,false,false,false,false,false,false,false,false,false,false,false,true],
    [true,false,false,false,false,false,false,false,false,false,false,true,true],
    [true,true,true,true,true,true,true,true,true,true],
  ],
  "tkl": [
    [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
    [false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true],
    [true,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true],
    [true,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true],
    [true,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true],
    [true,true,true,true,true,true,true,true,true,true,true,true],
  ],
  "full": [
    [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
    [false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true,true,true,true,true],
    [true,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true,true,true,true,true],
    [true,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true,true,true,true,true,true],
    [true,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true,true,true,true,true,true],
    [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
  ],
};

// Row counts per layout (number of physical keys per row)
export const ROW_COUNTS: Record<string, number[]> = {
  "60": [14, 14, 13, 12, 8],
  "65": [15, 14, 13, 13, 9],
  "75": [14, 15, 14, 13, 13, 9],
  "tkl": [13, 17, 17, 16, 15, 12],
  "full": [17, 21, 21, 19, 19, 15],
};
