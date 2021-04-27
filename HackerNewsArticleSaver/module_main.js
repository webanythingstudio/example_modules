// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Module Main: Main Process %%%%%%%%%%%%%%%%%%%
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
	// %%% Get News Articles %%%%%%%%%%%%%%%%%%
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	async getHackerNewsArticles(params)
	{

		// set self reference
		var module_ref = this;

		// parse the page count 
		var pages_to_retrieve = parseInt(params.pages_to_retrieve);
		if(Number.isSafeInteger(pages_to_retrieve) !== true)
		{
			return null;
		}

		// set between 1 and 20 pages
		if(pages_to_retrieve <= 0)
			pages_to_retrieve = 1;
		if(pages_to_retrieve > 20)
			pages_to_retrieve = 20;
			

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

		// page injectables (jquery, utilities, etc)
		var injectables = await module_ref.getInjectables(module_ref.injectable_set);
				
		// create CDP client session and clear cookies
		var client = await new_page.target().createCDPSession();
		await client.send('Network.clearBrowserCookies');	

		// go to ycombinator
		await new_page.goto("https://news.ycombinator.com/");

		
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%% Parse Articles %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		
		// Iterate through pages to retrieve
		var articles = {};
		for(var idx = 0; idx < pages_to_retrieve; idx++)
		{

			// Wait for the "More" link to show up
			await new_page.waitForSelector(".morelink");

			// get page contents
			await new_page.evaluate(injectables);
			var page_articles = await new_page.evaluate(async function()
			{
				
				// get article rows
				var article_rows = $(".athing");
				
				// iterate through articles and save them
				var page_articles = {};
				for(var article_idx = 0; article_idx < article_rows.length; article_idx++)
				{

					// gather row
					var row = article_rows[article_idx];

					// get the next tr in the table using the row index, and the parent tbody.
					var next_row = row.parentNode.rows[row.rowIndex + 1];

					// get site rank
					var article_site_rank = $(row).find(".rank").text();

					// get article parts
					var article_title    = $(row).find(".storylink").text();
					var article_link     = $(row).find(".storylink")[0].href;
					var article_score    = $(next_row).find(".score").text();
					var article_username = $(next_row).find(".hnuser").text();

					// gather article comments link
					var article_comments_link = $(next_row).find("a").filter(function()
					{

						// check for comments or discuss link
						if
						(
							$(this).text().indexOf("comment")  !== -1 ||
							$(this).text().indexOf("discuss")  !== -1 
						){ 
							return true; 
						}

						// skip bad link
						return false;

					});
					
					// It's very possible for articles to not have comments, such as in
					// the case of job postings.  For this reason, we look them up in a try/catch
					// block.
					var article_comments_link_href = "";
					var article_comment_count = 0;

					try
					{

						// get comments link as href
						article_comments_link_href = article_comments_link[0].href;

						// Gather comment count via some string replacements and integer parsing.
						if($(article_comments_link[0]).text().indexOf("comment") !== -1)
						{

							// remove " comments" and " comment" from the count string.
							comments_text = $(article_comments_link[0]).text();
							comments_text = comments_text.replace(' comments', '');
							comments_text = comments_text.replace(' comment',  '');

							// parse the comment count
							article_comment_count = parseInt(comments_text);

						}

					} catch(err){}

					// set article based on title
					page_articles[article_title] = 
					{
						site_rank:       parseInt(article_site_rank),
						title:           article_title,
						link:            article_link,
						score:           parseInt(article_score),
						username:        article_username,
						comments_link:   article_comments_link_href,
						comment_count:   article_comment_count,
						local_timestamp: Date.now()
					};

				}

				// return the found page articles
				return page_articles;

			});


			// assign found articles
			articles = Object.assign(articles, page_articles);

			// skip moving to next page if we don't have to
			if(idx+1 >= pages_to_retrieve)
				break;
		
			// sleep raondom time
			await custom_utils.asyncSleepRandomMiliseconds(1500, 2500);
			
			// move to the next page using the "More" link.
			await new_page.evaluate(async function()
			{		

				// gather the "More" link and navigate to the next page
				var more_link = $(".morelink")[0].href;	
				
				// move locations
				location.href = more_link;

			});

			// wati for navigation
			await new_page.waitForNavigation();		
		
		}

		// ensure the output directory exists
		var output_directory_exists = false;
		try
		{
			output_directory_exists = fs.lstatSync(params.save_directory).isDirectory();
		} catch(err){}

		// gather file path
		var file_path = "";
		if(output_directory_exists === true)
			file_path = path.join(params.save_directory, "hacker_news__"+Date.now()+".json");

		// hacker news articles
		var hacker_news_articles = 
		{
			pages_retireved:    pages_to_retrieve,
			saved_in:           file_path,
			total_articles:     Object.keys(articles).length,
			finished_timestamp: Date.now(),
			articles:           articles
		};

		// write file if we have one
		if(file_path !== "")
			fs.writeFileSync(file_path, JSON.stringify(hacker_news_articles, 1, 1));

		// close the browser before returning
		await new_browser.close();
		return hacker_news_articles;

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

					
					// IMPORTANT: run whatever you want here and collect resutls.  Run a method, a function, some 
					// inline code, whatever, just do it here.  In the base example we just go to time.gov and collect
					// the time in alaska.
					var time_in_alaska = await module_ref.getHackerNewsArticles(arg.data);
					
					// when you're done, reply back to the UI thread the results so they can be displayed.
					e.reply(module_ref.listener_name, 
					{
						event: arg.event,
						data:
						{
							results: time_in_alaska
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
