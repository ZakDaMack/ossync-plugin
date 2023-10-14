import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Vault } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	host: string;
	username: string;
	password: string;
	interval: number;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	host: 'http://127.0.0.1:6521',
	username: '',
	password: '',
	interval: 5
}

export default class MyPlugin extends Plugin {
	// FIELDS
	settings: MyPluginSettings;
	lastSynced: Date;
	ribbonEl: HTMLElement;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('lucide-refresh-cw', 'Sync vault now', (evt: MouseEvent) => {
			this.syncUpload();
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		this.ribbonEl = this.addStatusBarItem();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'command-sync-now',
			name: 'Sync now',
			callback: () => this.syncUpload()
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'command-sync-now',
			name: 'Sync now',
			callback: () => this.syncUpload()
		});

		// This adds a settings tab
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// interval to run sync.
		this.registerInterval(window.setInterval(() => this.syncUpload(), this.settings.interval * 60 * 1000));
		
		// updates status bar every minute
		this.registerInterval(window.setInterval(() => this.ribbonEl.setText(this.lastSynced.toDateString()), 60000));

		
		this.syncDownload();
	}

	onunload() {
		this.syncUpload();
	}

	// METHODS
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async syncUpload() {
		
		this.ribbonEl.setText("Syncing...");
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${this.settings.username}`
		};
		
		// make sure that is reachable
		// const statusUrl = new URL('status', this.settings.host).toString();
		// const statusResponse = await fetch(statusUrl, { headers });

		const files = this.app.vault.getFiles();
		const formData = new FormData();
		for (let i = 0; i < files.length; i++) {
			const buffer = await this.app.vault.readBinary(files[i]);
			console.log(files[i].path + " - " + buffer.byteLength);
			formData.set(files[i].path, new Blob([buffer]));
		}

		// get files and post to service
		const postUrl = new URL(`vault/${this.vaultSlug()}`, this.settings.host).toString();
		const uploadResponse = await fetch(postUrl, { 
			method: 'POST',
			headers: { ...headers, 'Content-Type': 'multipart/form-data' },
			body: formData
		});

		new Notice('Sync complete!');

		// update sync time
		this.lastSynced = new Date();
		this.ribbonEl.setText("Synced just now");
	}

	vaultSlug() {
		return this.app.vault.getName()
			.toLowerCase()
			.replace(' ', '-')
			.replace(/[^a-z\-]+/g, '');
	}

	async syncDownload() {		
		
		this.ribbonEl.setText("Syncing...");
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${this.settings.username}`
		};

		const getUrl = new URL(`vault/${this.vaultSlug()}`, this.settings.host).toString();
		const vaultResponse = await fetch(getUrl, { headers });
		const data = await vaultResponse.formData();

		// Display the key/value pairs
		for (const pair of data.entries()) {
			await this.app.vault.createBinary(pair[0], await new Response(pair[1]).arrayBuffer())
		}

		new Notice('Sync complete!');

		// update sync time
		this.lastSynced = new Date();
		this.ribbonEl.setText("Synced just now");
	}

}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		// host url
		new Setting(containerEl)
			.setName('Host url')
			.setDesc('Enter your host url or DNS record here.')
			.addText(text => text
				.setPlaceholder('http://127.0.0.1:6521')
				.setValue(this.plugin.settings.host)
				.onChange(async (value) => {
					this.plugin.settings.host = value;
					await this.plugin.saveSettings();
				}));
				
		// username
		new Setting(containerEl)
		.setName('Username')
		.setDesc('Enter your username to access ObsidianFreeSync.')
		.addText(text => text
			.setPlaceholder('admin')
			.setValue(this.plugin.settings.username)
			.onChange(async (value) => {
				this.plugin.settings.username = value;
				await this.plugin.saveSettings();
			}));
			
		// password
		new Setting(containerEl)
		.setName('Password')
		.setDesc('Enter your password.')
		.addText(text => text
			.setPlaceholder('password')
			.setValue(this.plugin.settings.password)
			.onChange(async (value) => {
				this.plugin.settings.password = value;
				await this.plugin.saveSettings();
			}));
			
		// interval
		new Setting(containerEl)
		.setName('Interval')
		.setDesc('Enter how often the system should back up in minutes.')
		.addText(text => text
			.setPlaceholder('5')
			.setValue(this.plugin.settings.interval.toString())
			.onChange(async (value) => {
				this.plugin.settings.interval = Number(value);
				await this.plugin.saveSettings();
			}));

	}
}
