// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% File Downloader: UI Process %%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// general imports
const { ipcRenderer } = require('electron');
var fs    = require('fs-extra');
var path  = require('path');
var $     = window.$;

// import the ui base class
var ModuleUI__Base = require(path.join(__dirname, "custom", "classes", "base", "ModuleUI__Base.class.js")).ModuleUI__Base;

// Module UI
module.exports.module_ui = class ModuleUI extends ModuleUI__Base
{

	// construct module
	constructor(params)
	{

		// set module config file before calling parent constructor.
		params.module_config_file = path.join(__dirname, "module.json");

		// call parent constructor
		super(params);
		
	}

	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Install The Module %%%%%%%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	// starts the module
	async install(params)
	{

		// set self reference
		var module_ref = this;

		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Initialize the UI %%%%%%%%%%%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				
		// Create UI html.  You can load this however you want, it just needs to be valid and relevant to the context.  You
		// are not limited to using fieldsets, you can use whatever you want so long as it fits in a table row.
		var module_html = `
			${module_ref.module_description}
			<!-- inputs -->
			<div id='${module_ref.module_name}__inputs' style='padding: 20px;'></div>
			<br>
			<center>
			<button class="ui-button ui-widget ui-corner-all" id='${module_ref.module_name}__download_files'>Download Files Matching</button>
			<button class="ui-button ui-widget ui-corner-all" id='${module_ref.module_name}__stop'>Stop</button>
			<button class="ui-button ui-widget ui-corner-all" id='${module_ref.module_name}__clear'>Clear</button>
			<div id='${module_ref.module_name}__output'></div>
			</center>
			<br><br>`;

		// Initialize the user interface.
		await module_ref.initUI
		({
			ui_html: module_html,
			self_inputs:
			[{
				type:  "textbox",
				label: "Page URL To Download From.",
				id:    `url_to_download_from`,
				style: "width: 100%;",
				placeholder: "Set the URL you'd like to download from here."
			},
			{
				type:  "directorypicker",
				label: "Select/Set a download directory.",
				id:    `download_directory`,
				style: "width: 100%;",
				placeholder: "This is where files will be downloaded."
			},
			{
				type:  "textbox",
				label: "File extensions to download.",
				id:    `file_extension_to_download`,
				style: "width: 100%;",
				placeholder: "Set the file extension type you'd like to download (eg: '.txt', '.mid', '.wav') here."
			},
			{
				type:  "select",
				label: "Randomize download order?",
				id:    `randomize_download_order`,
				style: "width: 100%;",
				options:
				[{
					value: "yes",
					text:  "yes"
				},
				{
					value: "no",
					text:  "no"
				}]
			},
			{
				type:  "select",
				label: "Run headless? (Won't show browser).",
				id:    `headless`,
				style: "width: 100%;",
				options:
				[{
					value: "yes",
					text:  "yes"
				},
				{
					value: "no",
					text:  "no"
				}]
			}]
		});
			
		
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Install UI IPC Listener %%%%%%%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		// initialize module listener
		await module_ref.initListener(async function(e, arg)
		{

			switch(arg.event)
			{

				// notify when we've downloaded a file
				case "DOWNLOADED_FILE": 
					$(`#${module_ref.module_name}__output`).css('font-weight', 'bold');
					$(`#${module_ref.module_name}__output`).css('padding', '10px');
					$(`#${module_ref.module_name}__output`).append("<br>Downloaded: ", arg.data.href);
					$(`#${module_ref.module_name}__output`).append("<br>Saved: ", arg.data.downloaded_file);
					break;
			
				// notify when a user stop request has been completed
				case "STOP":
					$(`#${module_ref.module_name}__output`).append("<br>Stopped downloading files!");
					break;

				// notify when downloader has started
				case "START":
					$(`#${module_ref.module_name}__output`).append("<br>Finding files to download and starting downloads.  Please wait.");
					break;
			
				// notify when downloading files has finished
				case "FINISHED":
					$(`#${module_ref.module_name}__output`).append("<br>Finished downloading files.");
					break;
				
				default:
					break;

			}

		});


		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Install Button Hooks: jQuery %%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		
		// send download request button
		$(`#${module_ref.module_name}__download_files`).on('click', async function()
		{
			module_ref.send
			({
				event: "MESSAGE",
				data:  await module_ref.getDataFromSelfInputs()
			});
		});

		// stop downloads
		$(`#${module_ref.module_name}__stop`).on('click', async function()
		{
			module_ref.send
			({
				event: "STOP",
				data:  await module_ref.getDataFromSelfInputs()
			});
		});

		// clear output button
		$(`#${module_ref.module_name}__clear`).on('click', async function()
		{
			$(`#${module_ref.module_name}__output`).empty();
		});



		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Send Some Arbitrary Output %%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		await module_ref.output
		({
			o: "MODULE",
			e: "PLUG",
			m: `The "${module_ref.module_name}" module has been plugged in and installed.`
		});
		
		// return indicating success
		return true;

	}

}