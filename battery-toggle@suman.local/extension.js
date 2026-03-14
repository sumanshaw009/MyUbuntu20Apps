const { GObject, St, Clutter, GLib } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;
const ByteArray = imports.byteArray;

// Hardware path for Lenovo G500s conservation mode
const BATTERY_PATH = '/sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode';

const BatteryToggle = GObject.registerClass(
class BatteryToggle extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Battery Toggle');

        // Swap St.Icon for an St.Label to allow full-color emojis
        this.statusLabel = new St.Label({
            text: '⏳', // Temporary loading state
            y_align: Clutter.ActorAlign.CENTER,
            style: 'font-size: 16px;' // Ensures the emoji is a good size
        });
        this.add_child(this.statusLabel);

        // Create Dropdown Menu Items
        this.healthItem = new PopupMenu.PopupMenuItem('🌱 Health Mode (60%)');
        this.lifeItem = new PopupMenu.PopupMenuItem('🔋 Life Mode (100%)');

        this.menu.addMenuItem(this.healthItem);
        this.menu.addMenuItem(this.lifeItem);

        // Bind clicks to the command execution
        this.healthItem.connect('activate', () => this._setMode('1'));
        this.lifeItem.connect('activate', () => this._setMode('0'));

        // Set initial label state
        this._updateIcon();
    }

    _setMode(value) {
        try {
            // pkexec prompts for password to write to the protected sysfs file
            let cmd = `pkexec sh -c "echo ${value} > ${BATTERY_PATH}"`;
            Util.spawnCommandLine(cmd);
            
            // Wait 1 second for the file to update before refreshing the label
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
                this._updateIcon();
                return GLib.SOURCE_REMOVE;
            });
        } catch (e) {
            log('Error setting battery mode: ' + e);
        }
    }

    _updateIcon() {
        try {
            // Read the hardware file
            let [success, contents] = GLib.file_get_contents(BATTERY_PATH);
            if (success) {
                let state = ByteArray.toString(contents).trim();
                if (state === '1') {
                    this.statusLabel.set_text('🌱'); 
                } else {
                    this.statusLabel.set_text('🔋'); 
                }
            }
        } catch (e) {
            this.statusLabel.set_text('⚠️'); 
        }
    }
});

let indicator;

function init() {
}

function enable() {
    indicator = new BatteryToggle();
    Main.panel.addToStatusArea('battery-toggle', indicator);
}

function disable() {
    if (indicator) {
        indicator.destroy();
        indicator = null;
    }
}
