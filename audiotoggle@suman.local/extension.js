const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;

let button;

function runCmd(command) {
    try {
        GLib.spawn_command_line_async(command);
    } catch (e) {
        global.log("AudioToggle Error: " + e);
    }
}

function init() {
}

function enable() {
    button = new PanelMenu.Button(0.0, 'Audio Toggle', false);

    // Default top bar icon (Headphones)
    let icon = new St.Icon({
        icon_name: 'audio-headphones-symbolic',
        style_class: 'system-status-icon',
        style: 'color: #00d8ff;' 
    });
    button.add_child(icon);

    let itemHp = new PopupMenu.PopupMenuItem('🎧 Force Headphone Mode');
    itemHp.connect('activate', () => {
        runCmd('pactl set-sink-port @DEFAULT_SINK@ analog-output-headphones');
        runCmd('amixer -c 0 set "Auto-Mute Mode" Disabled');
        runCmd('amixer -c 0 set Speaker 0% unmute');
        runCmd('amixer -c 0 set Headphone 100% unmute');
        runCmd('amixer -c 0 set Master unmute');
        // Update top bar to Cyan Headphone icon
        icon.set_icon_name('audio-headphones-symbolic');
        icon.set_style('color: #00d8ff;');
    });
    button.menu.addMenuItem(itemHp);

    let itemSpk = new PopupMenu.PopupMenuItem('🔊 Force Speaker Mode');
    itemSpk.connect('activate', () => {
        runCmd('pactl set-sink-port @DEFAULT_SINK@ analog-output-speaker');
        runCmd('amixer -c 0 set "Auto-Mute Mode" Disabled');
        runCmd('amixer -c 0 set Headphone 0% unmute');
        runCmd('amixer -c 0 set Speaker 100% unmute');
        runCmd('amixer -c 0 set Master unmute');
        // Update top bar to Orange Speaker icon
        icon.set_icon_name('audio-speakers-symbolic');
        icon.set_style('color: #ff9900;');
    });
    button.menu.addMenuItem(itemSpk);
    
    let itemBoth = new PopupMenu.PopupMenuItem('🔊+🎧 Play Both Together');
    itemBoth.connect('activate', () => {
        runCmd('pactl set-sink-port @DEFAULT_SINK@ analog-output-speaker');
        runCmd('amixer -c 0 set "Auto-Mute Mode" Disabled');
        runCmd('amixer -c 0 set Headphone 100% unmute');
        runCmd('amixer -c 0 set Speaker 100% unmute');
        runCmd('amixer -c 0 set Master unmute');
        // Update top bar to Green High-Volume icon
        icon.set_icon_name('audio-volume-high-symbolic');
        icon.set_style('color: #00ff66;');
    });
    button.menu.addMenuItem(itemBoth);

    Main.panel.addToStatusArea('AudioToggle', button);
}

function disable() {
    if (button) {
        button.destroy();
        button = null;
    }
}
