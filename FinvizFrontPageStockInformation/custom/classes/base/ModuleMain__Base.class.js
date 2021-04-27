// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Module Main Thread: Base Class %%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// Module base class for main thread parts.

// imports
const { ipcMain } = require('electron');
var path          = require('path');
var fs            = require('fs');

// main thread base class
module.exports.ModuleMain__Base = class ModuleMain__Base
{

	// class constructor
	constructor(params)
	{

		// module settings
		this.settings = 
		{
			listening:     false,
			listener_name: null,
			config:        null,
			params:        params
		};

		// autoload the module configuration from json
		// var module_config_file = path.join(__dirname, "module.json");
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

			// gather listenr name
			this.settings.listener_name = "module__" + this.settings.config.name;

		}
		else
		{
			console.log("Module Failed To Load JSON Config File: "+module_config_file);
			return;
		}
		
		console.log("Main Thread -> Module Loaded OK: "+__filename);
		
	}

	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Initialize Main Thread Listener %%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	// initialize listener
	async initListener(async_function)
	{
		
		// note: Don't add module ref here.
		
		// gather listener name
		var listener_name  = "module__" + this.settings.config.name;		
		this.listener_name = listener_name;
		ipcMain.on(listener_name, async_function);

		// return indicating success
		return true;

	}

	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Get Injectables %%%%%%%%%%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	// get injectable values that will be pushed into the dom
	async getInjectables(injectable_paths)
	{

		// gather injectable scripts
		var injectable_script_body = "";
		for(var idx = 0; idx < injectable_paths.length; idx++)
		{

			// read injectable path into buffer
			var injectable_path = injectable_paths[idx];
			try
			{
				injectable_script_body += fs.readFileSync(injectable_path).toString() + "\n";
			} catch(err){}

		}

		// return injectables
		return injectable_script_body;

	}

	
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Utilities %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	// simple sleep utility
	async asyncSleep(sleep_ms)
	{
		await new Promise(function(resolve, reject)
		{
			setTimeout(function(){
				resolve();
			}, sleep_ms, resolve)
		});
	}


}