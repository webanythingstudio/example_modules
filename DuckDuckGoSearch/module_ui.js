// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Duck Duck Go Search: UI Process %%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// general imports
const { ipcRenderer } = require('electron');
var fs           = require('fs-extra');
var path         = require('path');
var $            = window.$;
var custom_utils = require(path.join(__dirname, "custom", "classes", "main", "custom_utils.js"));

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
				
		
		var module_html = `
			This will run a search on Duck Duck Go and save the results as a JSON file within a directory.
			<br>
			<br>
			<br>
			<!-- inputs -->
			<div id='${module_ref.module_name}__inputs' style='padding: 20px;'>
			</div>
			<br>
			<center>
			<button class="ui-button ui-widget ui-corner-all" id='${module_ref.module_name}__run_search'>Run Search</button>
			<button class="ui-button ui-widget ui-corner-all" id='${module_ref.module_name}__clear'>Clear</button>
			<br>
			<br>
			<textarea id='${module_ref.module_name}__search_output' style='width: 100%; display: none;' rows='20'></textarea>
			</center>`;

		// Initialize the user interface.
		await module_ref.initUI
		({
			ui_html: module_html,
			self_inputs:
			[{
				type:  "textbox",
				label: "This is the value we will be searching for.",
				id:    `search_term`,
				style: "width: 100%;",
				placeholder: "This is the search value/term you want to use when searching Duck Duck Go!."
			},
			{
				type:  "directorypicker",
				label: "This is where search results will be saved.",
				id:    `save_directory`,
				style: "width: 100%;",
				placeholder: "Search results will be saved to this directory."
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

			$(`#${module_ref.module_name}__search_output`).empty();
			$(`#${module_ref.module_name}__search_output`).show();
			$(`#${module_ref.module_name}__search_output`).val(JSON.stringify(arg.data.results, 1,1));

		});


		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Install Button Hooks: jQuery %%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		
		// run search
		$(`#${module_ref.module_name}__run_search`).on('click', async function()
		{
			module_ref.send
			({
				event: "MESSAGE",
				data:  await module_ref.getDataFromSelfInputs()
			});
		});

		// clear data
		$(`#${module_ref.module_name}__clear`).on('click', async function()
		{
			$(`#${module_ref.module_name}__search_output`).empty();
			$(`#${module_ref.module_name}__search_output`).hide();
		});


		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Send Some Arbitrary Output %%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		// This will just display a message in the module output pane.  You can set 
		// these values however you want, but try to be reasonable or the output
		// tables will grow hideous.
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