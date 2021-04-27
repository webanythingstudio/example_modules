// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% FinViz Front Page: UI Process %%%%%%%%%%%%%%%
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
	
		// define html
		var module_html = `
			Visit FinViz frontpage and gather available stock information.
			<br>
			<br>
			<br>
			<!-- inputs -->
			<div id='${module_ref.module_name}__inputs' style='padding: 20px;'>
			</div>
			<br>
			<center>
			<button class="ui-button ui-widget ui-corner-all" id='${module_ref.module_name}__get_stock_information'>Get Stock Information</button>
			<button class="ui-button ui-widget ui-corner-all" id='${module_ref.module_name}__clear'>Clear</button><br>
			</center>
			<br>
			<textarea id='finviz_stock_prices' style='white-space: pre-wrap; width: 100%; display: none;' rows='20'></textarea>`;

		// Initialize the user interface.
		await module_ref.initUI
		({
			ui_html: module_html,
			self_inputs:
			[{
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

			// display our stock results
			$("#finviz_stock_prices").show();
			$("#finviz_stock_prices").empty().val(JSON.stringify(arg.data.results, 1, 1));

		});


		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Install Button Hooks: jQuery %%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
					
		// send request to backend
		$(`#${module_ref.module_name}__get_stock_information`).on('click', async function()
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
			$("#finviz_stock_prices").empty();
			$("#finviz_stock_prices").hide();
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