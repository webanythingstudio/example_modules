// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% FinViz Front Page: Main Process %%%%%%%%%%%%%
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
var stealth_plug = require('puppeteer-extra-plugin-stealth');
stealth_plug       = stealth_plug();
browser.use(stealth_plug);

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
	// %%% Get FinViz Page Data %%%%%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	async getFinVizDataFromFrontPage(params)
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

		// create a new browser (use random height and width)
		var new_browser = await browser.launch
		({
			headless: headless,
			defaultViewport:
			{
				width:  custom_utils.randomIntegerBetween(1200, 1500),
				height: custom_utils.randomIntegerBetween(500, 900)
			}
		});
		
		// create new page
		var new_page = await new_browser.newPage();		

		// create CDP client session and clear cookies
		var client = await new_page.target().createCDPSession();
		await client.send('Network.clearBrowserCookies');
		
		// move to finviz
		await new_page.goto("https://finviz.com/");


		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Extract Data From Front Page %%%%%%%%%%%%%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

		// evaluate code to extract data
		var injectables = await module_ref.getInjectables(module_ref.injectable_set);
		await new_page.evaluate(injectables);
		var page_stock_data = await new_page.evaluate(async function()
		{

			// gather links that have a price quote href
			var relevant_links = $("a").filter(function()
			{
				if(this.href.indexOf("https://finviz.com/quote.ashx?t=") !== -1)
					return true;
				return false;
			});

			// this will hold the rows for matching 
			var stock_rows = [];

			// iterate through relevant links in order to gather rows
			for(var idx = 0; idx < relevant_links.length; idx++)
			{

				// gather closest table row so we can use row cells to lookup values
				var closest_row = $(relevant_links[idx]).closest("tr");				
				stock_rows.push(closest_row);

			}

			// this will hold the finviz data
			var finviz_data = [];

			// iterate through stock rows
			for(var idx = 0; idx < stock_rows.length; idx++)
			{

				// raw stock info
				var stock_info_raw = stock_rows[idx][0];

				// gather stock information
				var stock_info = 
				{
					ticker: null,
					last:   null,
					change: null,
					volume: null,
					signal: null,
					link:   null,
					local_timestamp: Date.now()
				};

				// console.log("stock_info_raw");
				// console.log(stock_info_raw);

				// skip rows with no cells
				if(!stock_info_raw.cells)
					continue;
				
				// rows are always going to be 6 long unless they change something
				if(stock_info_raw.cells.length !== 6)
					continue;

				// gather cell entries as text nodes (positions 0, 1, 2, 3, and 5 are relevant)
				var cell_0 = $(stock_info_raw.cells[0]).text();
				var cell_1 = $(stock_info_raw.cells[1]).text();
				var cell_2 = $(stock_info_raw.cells[2]).text();
				var cell_3 = $(stock_info_raw.cells[3]).text();
				var cell_4 = $(stock_info_raw.cells[4]).text();
				var cell_5 = $(stock_info_raw.cells[5]).text();

				// set stock info from row text
				stock_info.ticker = cell_0;
				stock_info.last   = cell_1;
				stock_info.change = cell_2;
				stock_info.volume = cell_3;
				stock_info.signal = cell_5;
				stock_info.link   = "https://finviz.com/quote.ashx?t="+cell_0;

				// ensure table values match regular expressions
				if(/^[0-9.]+$/.test(stock_info.last) !== true)
					continue;
				if(/^[0-9.]+$/.test(stock_info.volume) !== true)
					continue;

				// store stock data 
				finviz_data.push(stock_info);

			}


			// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
			// %%% Sort Data By Signal %%%%%%%%%%%%%%%%%%%%%%
			// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

			// Sorted finviz data will be held here, sorted by signal.
			var sorted_finviz_data = {};

			// iterate data and sort
			if(Array.isArray(finviz_data) === true)
			for(var idx = 0; idx < finviz_data.length; idx++)
			{

				// gather the stock signal
				var signal = finviz_data[idx].signal

				// create signal array
				if(!sorted_finviz_data[signal])
					sorted_finviz_data[signal] = [];

				// push finviz data into signal array
				sorted_finviz_data[signal].push(finviz_data[idx]);

			}
			
			// return the parsed data as an array
			return sorted_finviz_data;
			
		});

		// close the browser before returning
		await new_browser.close();

		// return arbitrary data
		return page_stock_data;
		
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
					
					var results = await module_ref.getFinVizDataFromFrontPage(arg.data);
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
