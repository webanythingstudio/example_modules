// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% ModuleUI: Renderer Thread %%%%%%%%%%%%%%%%%%%
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
				
		// Create UI html.  You can load this however you want, it just needs to be valid and relevant to the context.  You
		// are not limited to using fieldsets, you can use whatever you want so long as it fits in a table row.
		var module_html = `
			${module_ref.module_description}
			<br>
			<br>
			<!-- inputs -->
			<div id='${module_ref.module_name}__inputs' style='padding: 20px;'>
			</div>
			<br>
			<center>
			<button class="ui-button ui-widget ui-corner-all" id='${module_ref.module_name}__get_articles'>Get Articles</button>
			<button class="ui-button ui-widget ui-corner-all" id='${module_ref.module_name}__clear'>Clear</button>
			<br>
			<br>
			<textarea id='${module_ref.module_name}__output' style='width: 100%; display: none;' rows='20'></textarea>
			</center>`;

		// Initialize the user interface.
		await module_ref.initUI
		({
			ui_html: module_html,
			self_inputs:
			[{
				type:  "textbox",
				label: "Number of pages to retrieve.",
				id:    `pages_to_retrieve`,
				style: "width: 100%;",
				placeholder: "Page count to retrieve (eg. 1, 5, 10).  Don't set this too high."
			},
			{
				type:  "directorypicker",
				label: "Directory where article links will be stored.",
				id:    `save_directory`,
				style: "width: 100%;",
				placeholder: "This directory will be used to store search results as JSON."
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

			// show output
			$(`#${module_ref.module_name}__output`).empty().val(JSON.stringify(arg.data.results, 1, 1));
			$(`#${module_ref.module_name}__output`).show();

		});


		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Install Button Hooks: jQuery %%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				
		// get articles
		$(`#${module_ref.module_name}__get_articles`).on('click', async function()
		{
			module_ref.send
			({
				event: "MESSAGE",
				data:  await module_ref.getDataFromSelfInputs()
			});
		});

		// clear output 
		$(`#${module_ref.module_name}__clear`).on('click', async function()
		{
			$(`#${module_ref.module_name}__output`).empty().hide();
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