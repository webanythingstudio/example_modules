// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% File Downloader: Main Process %%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// import basics
const { BrowserWindow } = require("electron");
var fs                  = require('fs');
var fetch               = require('node-fetch');
var path                = require('path');
var url                 = require('url');
const { ipcMain }       = require('electron');
const pie               = require("puppeteer-in-electron");
const browser           = require("puppeteer-extra");
var ModuleMain__Base    = require(path.join(__dirname, "custom", "classes", "base", "ModuleMain__Base.class.js")).ModuleMain__Base;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Puppeteer Extra: Plugins %%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// enable puppeteer stealth plugin
const stealth_plug      = require('puppeteer-extra-plugin-stealth');
browser.use(stealth_plug());

// enable puppeteer adblocker plugin
const adblock_plug = require('puppeteer-extra-plugin-adblocker');
const { writeFile } = require("fs-extra");
browser.use(adblock_plug({ blockTrackers: true }))

// enable user agent randomization plugin
browser.use(require('puppeteer-extra-plugin-anonymize-ua')())


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Add Shuffle Utility %%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// shuffle utility
function shuffle(array) 
{
	var currentIndex = array.length, temporaryValue, randomIndex;
  
	// While there remain elements to shuffle...
	while (0 !== currentIndex) 
	{
  
	  // Pick a remaining element...
	  randomIndex   = Math.floor(Math.random() * currentIndex);
	  currentIndex -= 1;
  
	  // And swap it with the current element.
	  temporaryValue      = array[currentIndex];
	  array[currentIndex] = array[randomIndex];
	  array[randomIndex]  = temporaryValue;
	   
	}
  
	return array;

}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Class Definition %%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// global module singleton
var global_module_ref = null;

// module main entry point
module.exports.module_main = class ModuleMain extends ModuleMain__Base
{

	// construct module
	constructor(params)
	{

		// Set default module config file.
		params.module_config_file = path.join(__dirname, "module.json");

		// Run base constructor.
		super(params);

		// These scripts are added to the injectables buffer when getInjectables() is called.  You can add whatever
		// files you want and they'll be injected.
		this.injectable_set = 
		[
			path.join(__dirname, "injectables", "jquery-3.6.0.min.js"),
			path.join(__dirname, "injectables", "utilities.js")
		];
		
		// store the current state of your downloads
		this.state = 
		{
			stop_requested: false
		};

		
	}


	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Download Files from URL %%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	// download files
	async downloadFilesFromURLMatching(params)
	{

		// set self reference
		var module_ref = this;

		// ensure the download directory exists and it's a directory
		try
		{
			if(fs.lstatSync(params.download_directory).isDirectory() !== true)
				return null;
		} catch(err){}


		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Launch New Browser Instance %%%%%%%%%%%%%%%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		// set headless based on passed through parameter
		var headless = false;
		if(params.headless === "yes")
			headless = true;

		// create a new browser 
		var new_browser = await browser.launch
		({
			headless: headless,
			defaultViewport:
			{
				width: 1500,
				height: 600
			}
		});
		
		// create new page
		var new_page = await new_browser.newPage();		


		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Optional: Clear Cookies/Issue CDP Commands %%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		// create CDP client session and clear cookies
		var client = await new_page.target().createCDPSession();
		await client.send('Network.clearBrowserCookies');
		

		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Move Page To Time.Gov %%%%%%%%%%%%%%%%%%%%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		// go to time.gov 
		await new_page.goto(params.url_to_download_from);


		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Run Some Code In The Context of Time.Gov %%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		// page injectables (jquery, utilities, etc)
		var injectables = await module_ref.getInjectables(module_ref.injectable_set);	

		// get the time in alaska
		await new_page.evaluate(injectables);
		var matching_links = await new_page.evaluate(async function(file_extension_to_download)
		{
			
			// select links that match 
			var matching_links = $("a").filter(function()
			{

				// gather file extension
				var file_extension = null;
				try
				{
					file_extension = this.href.split('.').pop();
				} catch(err){}

				if(file_extension === null)
					return false;
				if(file_extension_to_download.indexOf(file_extension) === -1)
					return false;

				// filter matches
				return true;
				
			});

			// gather hrefs from links
			var href_array = [];
			for(var idx = 0; idx < matching_links.length; idx++)
			{
				href_array.push(matching_links[idx].href);
			}
			
			// return the array of hrefs
			return href_array;

		}, params.file_extension_to_download);


		// ensure the array has some length to it
		if(Array.isArray(matching_links) !== true)
		{
			await new_browser.close();
			return null;
		}
		if(matching_links.length <= 0)
		{
			await new_browser.close();
			return null;
		}

		// randomize download order
		if(params.randomize_download_order === "yes")
		{
			matching_links = shuffle(matching_links);
		}

		// optionally display found links
		console.log({checking_and_downloading_links: matching_links});

		// Iterate through matching links and use fetch to download them.
		for(var idx = 0; idx < matching_links.length; idx++)
		{

			// Check if the UI has sent us a stop request, and if so reset the stop
			// request flag and then exit from this routine.
			if(module_ref.state.stop_requested === true)
			{

				// reset the flag
				module_ref.state.stop_requested = false;

				// notify parent window that we have stopped the download
				module_ref.window.webContents.send(module_ref.listener_name, {event: "STOP", data:{}});

				// exit the loop/download routine
				await new_browser.close();
				return null;

			}
		
			// gather file name
			var file_name = path.basename(matching_links[idx]);

			// create absolute path on filesystem
			var absolute_path = path.join(params.download_directory, file_name);

			// skip files that already exist
			if(fs.existsSync(absolute_path) === true)
				continue;

			// gather content
			var file_content = await fetch(matching_links[idx]);

			// gather buffer and write file to disk
			var file_buffer = await file_content.buffer();
			fs.writeFile(absolute_path, file_buffer, {}, function(err){});
			
			// notify application window that a file was downloaded
			module_ref.window.webContents.send(module_ref.listener_name, 
			{
				event: "DOWNLOADED_FILE",
				data:
				{
					downloaded_file: absolute_path,
					href:            matching_links[idx]
				}
			});
			
			// sleep one second
			await module_ref.asyncSleep(1000);

		}
		
		// close the browser before returning
		await new_browser.close();

		// return arbitrary data
		return matching_links;
		
	}


	
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Install The Module %%%%%%%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	async install(params)
	{

		// set self reference
		var module_ref = this;

		// set listener indicator
		this.settings.listening = true;

		// set global ref
		global_module_ref = this;

		// init the module listener
		await module_ref.initListener(async function(e, arg)
		{

			// handle events 
			switch(arg.event)
			{

				// message
				case 'MESSAGE':

					
					// notify parent window that we are starting
					module_ref.window.webContents.send(module_ref.listener_name, {event: "START", data:{}});

					// download and return
					var results = await module_ref.downloadFilesFromURLMatching(arg.data);
					e.reply(module_ref.listener_name, 
					{
						event: arg.event,
						data:
						{
							results: results
						}
					});			

					// notify parent window that we have finished
					module_ref.window.webContents.send(module_ref.listener_name, {event: "FINISHED", data:{}});	
					return;

				// stop downloads
				case 'STOP':
					module_ref.state.stop_requested = true;
					return;

				// do nothing (unhandled event)
				default:
					return;

			}

		});

		// setup listener
		return true;

	}

}
