// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Duck Duck Go Search: Main Process %%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// import basics
const { BrowserWindow } = require("electron");
var fs                  = require('fs-extra');
var fetch               = require('node-fetch');
var path                = require('path');
var url                 = require('url');
const { ipcMain }       = require('electron');
const pie               = require("puppeteer-in-electron");
const browser           = require("puppeteer-extra");
var custom_utils        = require(path.join(__dirname, "custom", "classes", "main", "custom_utils.js"));

// import the main base class
var ModuleMain__Base    = require(path.join(__dirname, "custom", "classes", "base", "ModuleMain__Base.class.js")).ModuleMain__Base;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Puppeteer Extra: Plugins %%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// enable puppeteer stealth plugin
const stealth_plug      = require('puppeteer-extra-plugin-stealth');
browser.use(stealth_plug());

// enable user agent randomization plugin
browser.use(require('puppeteer-extra-plugin-anonymize-ua')())


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
		
	}


	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// %%% Search Duck Duck Go %%%%%%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	async searchDuckDuckGo(params)
	{

		// set self reference
		var module_ref = this;

		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Launch New Browser Instance %%%%%%%%%%%%%%%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		// set headless based on passed through parameter
		var headless = false;
		if(params.headless === "yes")
			headless = true;

		// create a new browser with random viewport size
		var new_browser = await browser.launch
		({
			headless: headless,
			defaultViewport:
			{
				width:  custom_utils.randomIntegerBetween(1200, 1600),
				height: custom_utils.randomIntegerBetween(400, 900)
			}
		});
		
		// create new page
		var new_page = await new_browser.newPage();		
		
		// create CDP client session and clear cookies
		var client = await new_page.target().createCDPSession();
		await client.send('Network.clearBrowserCookies');
		
		// go to page
		await new_page.goto("https://duckduckgo.com/");


		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Run Search and Wait For Results %%%%%%%%%%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		// wait for the search input to show up
		var search_input = await new_page.waitForSelector("#search_form_input_homepage");

		// sleep between half a second and a second after input shows up
		await custom_utils.asyncSleepRandomMiliseconds(500,2000);
		await search_input.click();

		// send the search term as keystroke events
		await new_page.keyboard.type(params.search_term);
		await custom_utils.asyncSleepRandomMiliseconds(500,1500);
		await new_page.keyboard.press("Enter");

		// attempt to click more buttons if they exist
		try
		{

			// wait for the more button to show up
			more_button = await new_page.waitForSelector(".result--more__btn", {timeout: 5000});

			// since search results for duck duck go are displayed on a single page,
			// and expanded using the "More Results" button, this loop will just keep
			// clicking more results till there are none.
			var more_button = null;
			do
			{

				// gather more button
				more_button = await new_page.$(".result--more__btn");
				if(custom_utils.isEmpty(more_button) === true)
					break;

				// click the more button and sleep a few seconds
				await more_button.click();
				await custom_utils.asyncSleepRandomMiliseconds(2000,3500);

			} while(true);

		} catch(err){}

		// run search
		var injectables = await module_ref.getInjectables(module_ref.injectable_set);
		await new_page.evaluate(injectables);
		var search_results = await new_page.evaluate(async function()
		{

			// get all result divs from page
			var all_result_divs = $(".result__title").closest("div");		

			// iterate through all results divs
			var search_results = [];
			for(var idx = 0; idx < all_result_divs.length; idx++)
			{

				// gather a result
				var result_div = all_result_divs[idx];
				
				// skip any without only 3 children
				if(result_div.children.length !== 3)
					continue;

				// get the link anchor
				var link_anchor = $(result_div).find("a.result__a");

				// get snippet
				var snippet = $(result_div).find("div.result__snippet.js-result-snippet").text();

				// skip any self links (can show up as sponsored content)
				var link = $(link_anchor).attr("href");
				if(link.indexOf("duckduckgo.com") !== -1)
					continue;

				// create and push the search result onto the results stack.
				search_results.push
				({
					title:   $(link_anchor).text(),
					link:    $(link_anchor).attr("href"),
					snippet: snippet,
					local_timestamp: Date.now()
				});

			}

			// return the parsed search results
			return search_results;

		});
		
		// check if directory exists
		var directory_exists = false;
		try
		{
			if(fs.lstatSync(params.save_directory).isDirectory() === true)
				directory_exists = true;
		} catch(err){}

		// create search overview
		var search_overview = 
		{
			search_term:    params.search_term,
			saved_file:     null,
			search_results: search_results
		};

		// write search results as json
		if(directory_exists === true)
		{
			search_overview.saved_file = path.join(params.save_directory, Date.now() + ".json");
			fs.writeFileSync(search_overview.saved_file, JSON.stringify(search_overview, 1, 1));
		}
		
		// close the browser before returning
		await new_browser.close();

		// return results
		return search_overview;
		
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

					var results = await module_ref.searchDuckDuckGo(arg.data);
					e.reply(module_ref.listener_name, 
					{
						event: arg.event,
						data:
						{
							results: results
						}
					});				
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
