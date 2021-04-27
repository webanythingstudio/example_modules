// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Module UI: Base Class %%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// This class is used to assist the building and generation
// of the model UI.

// basic utilities 
const { ipcRenderer, remote} = require('electron');
var dialog        = remote.dialog;
var path          = require('path');
var fs            = require('fs');
var $             = window.$;
require('jquery-ui-dist/jquery-ui');

// UI base class
module.exports.ModuleUI__Base = class ModuleUI__Base
{

	// setup basic environment for this module
	constructor(params)
	{
		
		// module settings
		this.settings = 
		{
			listening: false,
			config:    null,
			params:    params
		};

		// autoload the module configuration from json
		var module_config_file = params.module_config_file;
		if(fs.existsSync(module_config_file) === true)
		{
			this.settings.config = null;
			try
			{
				var file_content = fs.readFileSync(module_config_file);
				if(file_content)
				{
					file_content = JSON.parse(file_content.toString());
				}
			} catch(err){}

			// set module config
			if(file_content)
			{
				this.settings.config = file_content;
			}
		}
		else
		{
			console.load("Module Failed To Load JSON Config File: "+module_config_file);
		}
		
		// gather module directory
		var module_dir = path.dirname(module_config_file);

		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Run Basic Config Checks %%%%%%%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		// gather module name
		var module_name = null;
		try
		{
			module_name = this.settings.config.name
		} catch(err){}

		// gather module description
		var module_description = null;
		try
		{
			module_description = this.settings.config.description
		} catch(err){}

		// exit immediately if there is no name
		if(typeof module_name !== "string")
		{
			console.log("module_config_file_error: Module has no name! -> " + module_config_file);
			process.exit(0);
		}
		else if(module_name.length <= 0)
		{
			console.log("module_config_file_error: Module name is empty string! -> " + module_config_file);
		}

		// exit immediately if there is no description
		if(typeof module_description !== "string")
		{
			console.log("module_config_file_error: Module has no description! -> " + module_description);
		}
		else if(module_description.length <= 0)
		{
			console.log("module_config_file_error: Module description is empty string! -> " + module_config_file);
		}

		
		// set module title, name, and directory
		this.module_title       = this.settings.config.title;
		this.module_name        = this.settings.config.name;
		this.module_description = this.settings.config.description;
		this.module_dir         = module_dir;
		
		// set the input prefix
		this.input_prefix = `${this.module_name}__`;

		// self inputs (set via initUI optionally)
		this.self_inputs = [];

		console.log("Module Loaded OK: "+__filename);

		// return indicating success
		return true;

	}


	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Init UI %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	// initialize the UI
	async initUI(params)
	{

		// set self reference
		var module_ref = this;

		// set the input prefix
		var input_prefix = `${module_ref.module_name}__`;

		// add the container around the field set
		var final_html = `
		<fieldset style='word-wrap: break-word; id='${input_prefix}__fieldset'>
			<legend>
				<h3>
					<img src="./icons/bolt.svg" style='vertical-align: text-bottom;'></img>${module_ref.module_title}&nbsp;|
					<a style='font: 16px arial;' id='view_files__${module_ref.module_name}'>[files]</a>
					<a style='font: 16px arial;' id='open_editor__${module_ref.module_name}'>[edit]</a>
					<a style='font: 16px arial;' id='clear_defaults__${module_ref.module_name}'>[clear]</a>
					<a style='font: 16px arial;' id='save_defaults__${module_ref.module_name}'>[save]</a>
				</h3>
			</legend>
			<br><br>
			${params.ui_html}
		</fieldset>`;

		// get handle to datatable and add datatable row
		var modules_datatable = $("#loaded_modules_datatable").DataTable();
		modules_datatable.row.add([final_html]).draw(false);


		$(`#view_files__${module_ref.module_name}`)[0].module_directory = this.module_dir;
		$(`#view_files__${module_ref.module_name}`).on('click', async function()
		{
			window.deps.openExplorer(this.module_directory, function(err)
			{
				if(err)
				{
					alert("Could not open module directory: "+err.message);
					return;
				}
			});
		});
		


		// add the open-editor anchor click callbacks (launches VS code)
		$(`#open_editor__${module_ref.module_name}`)[0].module_directory = this.module_dir;
		$(`#open_editor__${module_ref.module_name}`).on('click', async function(event)
		{

			// ensure we're loading a directory
			if(fs.lstatSync(this.module_directory).isDirectory() !== true)
				return;

			// attempt to launch vs code
			const {exec} = require('child_process');
			exec(`code '${this.module_directory}'`, function(err, stderr, stdout)
			{
				if(err)
				{
					alert("VSCode Failed To Launch: " + err.message);
					return;
				}
			});

		});

		// clear all default values
		$(`#clear_defaults__${module_ref.module_name}`).on('click', async function()
		{

			// check self inputs and verify that they're available
			if(!module_ref.self_inputs)
				return;
			if(Array.isArray(module_ref.self_inputs) !== true)
				return;

			if(confirm("Are you sure you want to clear the current defaults?  Press OK to clear them."))
			{
				// iterate through modules
				for(var idx = 0; idx < module_ref.self_inputs.length; idx++)
				{
					var input = module_ref.self_inputs[idx];
					delete localStorage["app_input_defaults__" + input.input_id];


					var meta_type = input.type;
					var new_input = null;
					var actual_type = "";
					switch(meta_type)
					{

						case "filepicker":
						case "directorypicker":
							actual_type = "textbox";
							break;

						case "select":
							actual_type = "select";
							break;

						default:
							actual_type = "textbox";
							break;

					}


					if(actual_type === "textbox")
					{
						$("#"+input.input_id).val("");
					}
					else if(actual_type === "select")
					{					

						// empty the select
						$("#" + input.input_id).val("");
						$("#" + input.input_id).empty();

						// re-add options
						if(Array.isArray(input.options) === true)
						for(var opt_idx = 0; opt_idx < input.options.length; opt_idx++)
						{

							var option = input.options[opt_idx];
							var new_option = $("<option></option>");

							$(new_option).attr('value', option.value);
							$(new_option).text(option.text);
							if(option.selected === true)
								$(new_option).prop('selected', true);

							// add the new option
							$("#" + input.input_id).append(new_option);

						}

						$("#" + input.input_id).selectmenu("refresh");

					}

				}

			}

		});

		// save all default values
		$(`#save_defaults__${module_ref.module_name}`).on('click', async function()
		{

			// check self inputs and verify that they're available
			if(!module_ref.self_inputs)
				return;
			if(Array.isArray(module_ref.self_inputs) !== true)
				return;

			// iterate through modules
			for(var idx = 0; idx < module_ref.self_inputs.length; idx++)
			{
				var input = module_ref.self_inputs[idx];
				localStorage["app_input_defaults__" + input.input_id] = $("#"+input.input_id).val();


			}

			alert("Saved ok!");
		});

		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Build Self Inputs %%%%%%%%%%%%%%%%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		

		if(Array.isArray(params.self_inputs) === true)
			this.self_inputs = params.self_inputs;

		if(Array.isArray(params.self_inputs) === true)
		for(var idx = 0; idx < this.self_inputs.length; idx++)
		{

			// set input
			var input = this.self_inputs[idx];

			// set input id
			var input_id = input_prefix + input.id;
		
			// set the full id path
			input.input_id = input_id;

			var meta_type = input.type;

			var new_input = null;
			var actual_type = "";
			switch(meta_type)
			{

				case "filepicker":
				case "directorypicker":
					actual_type = "textbox";
					new_input = $("<input></input>");
					break;

				case "select":
					actual_type = "select";
					new_input = $("<select></select>");
					break;

				default:
					actual_type = "textbox";
					new_input = $("<input></input>");
					break;

			}

			// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
			// %%% Handle Select Types %%%%%%%%%%%%%%%%
			// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

			if(actual_type === "select")
			{

				var new_label = $(`<label style='font-weight: bold;' for='${input_id}'>${input.label}</label>`);

				if(Array.isArray(input.options) === true)
				for(var opt_idx = 0; opt_idx < input.options.length; opt_idx++)
				{

					var option = input.options[opt_idx];
					var new_option = $("<option></option>");

					
					$(new_option).attr('value', option.value);
					$(new_option).text(option.text);
					if(option.selected === true)
						$(new_option).prop('selected', true);


					// change selected 
					var default_value = localStorage["app_input_defaults__" + input_prefix + input.id];
					if(typeof default_value === "string")
					if(default_value.length > 0)
					{

						if(default_value === option.value)
							$(new_option).prop('selected', true);
					}

					// add the new option
					$(new_input).append(new_option);

				}

				$(new_input).attr('id',          input_prefix + input.id);				
				$(new_input).attr('style',       input.style);
				$(new_input).attr('class',       input.class);

				$(`#${module_ref.module_name}__inputs`).append(new_label, $("<br>"), new_input);
				
				// $(`#${module_ref.module_name}__inputs`).append(new_input);
				$(`#${module_ref.module_name}__inputs`).append("<br><br>");

				$(new_input).selectmenu();
				
				
			}


			// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
			// %%% Handle Textbox Types %%%%%%%%%%%%%%%
			// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

			if(actual_type === "textbox")
			{
				
				$(new_input).attr('id',          input_prefix + input.id);
				$(new_input).attr('type',        actual_type);
				$(new_input).attr('style',       input.style);
				$(new_input).attr('class',       input.class);
				$(new_input).attr('placeholder', input.placeholder);
				

				var new_label = $(`<label style='font-weight: bold;' for='${input_id}'>${input.label}</label>`);

				$(`#${module_ref.module_name}__inputs`).append(new_label, new_input);
				
				// $(`#${module_ref.module_name}__inputs`).append(new_input);
				$(`#${module_ref.module_name}__inputs`).append("<br><br>");

				// set input id (used for callbacks below to identify)
				$("#"+input_id)[0].input_id = input_id;


				// retrieve default for this item if we have one
				var default_value = localStorage["app_input_defaults__" + input_prefix + input.id];
				if(typeof default_value === "string")
				{
					if(default_value.length > 0)
						$(new_input).val(default_value);
				}
				else
				{
					// localStorage["app_input_defaults__" + input_prefix + input.id] = "HOLYBANANAS!";
				}

				
				// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				// %%% File Picker %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

				if(meta_type === "directorypicker")
				{

					// modules directory file picker
					$("#"+input_id).on('click', async function()
					{

						// open a file picker dialog to select module directory.
						var dialog_result = await dialog.showOpenDialog
						({
							title: "Select a directory.",
							properties: ['openDirectory', 'createDirectory']
						});

						// do nothing if cancelled
						if(dialog_result.canceled === true)
							return;

						// store the last loaded module directory
						var selected_path = dialog_result.filePaths[0];
						$("#"+this.input_id).val(selected_path);

					});

				}


				if(meta_type === "filepicker")
				{

					// modules directory file picker
					
					$("#"+input_id).on('click', async function()
					{

						// open a file picker dialog to select module directory.
						var dialog_result = await dialog.showOpenDialog
						({
							title: "Select a file.",
							properties: ['openFile', 'createFile']
						});

						// do nothing if cancelled
						if(dialog_result.canceled === true)
							return;

						// store the last loaded module directory
						var selected_path = dialog_result.filePaths[0];
						$("#"+this.input_id).val(selected_path);
						
					});

				}

			}

		}

		// return indicating success
		return true;

	}
	

	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Initialize Listeners %%%%%%%%%%%%%%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	// initialize our event listener
	async initListener(async_callback)
	{

		// set self reference
		var module_ref = this;

		// listener name that events will be sent to
		var listener_name = "module__"  + module_ref.module_name;

		// revent reply handler
		ipcRenderer.on(listener_name, async_callback);

		// return indicating success
		return true;

	}

	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Send A Message %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	// send a message to main thread listener
	async send(params)
	{

		// set self reference
		var module_ref = this;

		// listener name that events will be sent to
		var listener_name = "module__"  + module_ref.module_name;

		// return the send result
		return ipcRenderer.send(listener_name,params);

	}

	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Module Output %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	// output to logger
	async output(params)
	{
		// add module_output_log_datatable row
		var module_output_log_datatable = $("#module_output_log_datatable").DataTable();
		var date_string = (new Date()).toISOString().replace("T", " ");
		module_output_log_datatable.row.add([params.o, params.e, params.m, date_string]).draw(false);
	}

	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Retrieves Data From Class Self Inputs %%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	// retrieve data from self inputs
	async getDataFromSelfInputs()
	{

		var module_ref = this;
		if(Array.isArray(module_ref.self_inputs) !== true)
			return null;

		var ret_data = {};
		for(var idx = 0; idx < module_ref.self_inputs.length; idx++)
		{
			var input = module_ref.self_inputs[idx];
			ret_data[input.id] = $("#"+input.input_id).val();
			
		}
		console.log("ret_dataret_dataret_data");
		console.log({ret_data: ret_data});
		return ret_data;

	}

}