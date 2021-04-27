// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Random Number Utilities %%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// random integer between
var randomIntegerBetween = function(min, max)
{

    // run basic checks
    if(min > max)
        return -1;
    if(min === max)
        return min;

    // generate random
    return Math.floor(Math.random()*(max-min+1)+min);

}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Time/Sleep Utilities %%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

var asyncSleep = async function(sleep_ms)
{
	await new Promise(function(resolve, reject)
	{
		setTimeout(function(){
			resolve();
		}, sleep_ms, resolve)
	});
}


// sleep random seconds between min and max
var asyncSleepRandom = async function(min_ms, max_ms)
{

    // generate random integer
    var random_sleep_ms = randomIntegerBetween(min_ms, max_ms);
    if(random_sleep_ms === -1)
        return;
    if(random_sleep_ms === 0)
        return;

    // sleep async
    await asyncSleep(random_sleep_ms);

}


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Empty Checks %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// checks if object, string, or array is empty.  (true/false)
//   empty types:
//           undefined
//           null
//           zero length array
//           zero length string
//           object with no keys
var isEmpty = function(test_if_this_is_empty)
{

    // undefined values are considered empty
    if(typeof test_if_this_is_empty === "undefined")
        return true;

    // null values are considered empty
    if(test_if_this_is_empty === null)
        return true;

    // null values are considered empty
    if(test_if_this_is_empty == null)
        return true;

    // zero length arrays are considered empty
    if(Array.isArray(test_if_this_is_empty) === true)
    {
        if(test_if_this_is_empty.length === 0)
            return true;
    }

    // zero length strings are considered empty
    if(typeof test_if_this_is_empty === "string")
    {
        if(test_if_this_is_empty.length === 0)
            return true;
    }

    // object with no keys is considered empty
    if(typeof test_if_this_is_empty === "object")
    {
        
        // first check if the object is a date (has the getMonth property set)
        if(typeof test_if_this_is_empty.getMonth === 'function')
        {
            return false;
        }
        else if(Object.keys(test_if_this_is_empty).length === 0)
        {
            return true;
        }
    }

    
    // the object is not empty
    return false;

}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Selector Utilities %%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// wait for selector
var waitForSelector = async function(selector, max_wait_time_secs = 30)
{
	
	var curr_wait_time = 0;
	while(true)
	{

		var elements = null;
		try
		{
			elements = $(selector);
		} catch(err){}

		// wait for element
		curr_wait_time++;
		if(curr_wait_time >= max_wait_time_secs)
			break;
		
		if(elements === null)
		{
			console.log("Elements null.");
			await asyncSleep(1000);
			continue;
		}

		if(elements.length === 0)
		{
			console.log("Elements length-zero.");
			await asyncSleep(1000);
			continue;
		}

		if(elements.length > 0)
			return elements;

	}

	return null;

}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Shuffle an Array %%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// shuffle an array
function shuffle(arr, options) 
{

	if (!Array.isArray(arr)) 
	{
		return null;
	}
  
	options = options || {};
  
	var collection = arr,
		len = arr.length,
		rng = options.rng || Math.random,
		random,
		temp;
  
	if (options.copy === true) {
	  collection = arr.slice();
	}
  
	while (len) {
	  random = Math.floor(rng() * len);
	  len -= 1;
	  temp = collection[len];
	  collection[len] = collection[random];
	  collection[random] = temp;
	}
  
	return collection;
  };

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Search Text Nodes %%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// recursing search that finds text nodes that match a string or regexp
function searchTextNodes(node, search)
{

	// all found text nodes that match
	var all = [];
	for 
	(
		node = node.firstChild;
		node;
		node = node.nextSibling
	)
	{

		// check for text nodes
		if (node.nodeType==3)
		{

			// ensure we have a string value
			if(typeof node.nodeValue !== "string")
				continue;

			// run searches  
			if(typeof search === "string")
			{
				if(node.nodeValue.indexOf(search) !== -1)
					all.push(node);
			}			
			else if(search instanceof RegExp)
			{
				if(search.test(node.nodeValue) === true)
					all.push(node);
			}

		}
		else
		{
			all = all.concat(searchTextNodes(node, search));
		}

	}

	// return all matches
	return all;

}


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Element Searching %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// search for elements containing text
function selectElementsContainingText(selection, search, options = {})
{
  
	// this holds matching elements
	var found_elements = [];
		
	// ensure we have a selection
	if(!selection)
		return null;
	if(selection.length <= 0)
		return null;
  
	// iterate selections
	for(var idx = 0; idx < selection.length; idx++)
	{
		
		// gather element
		var element = selection[idx];
		
		// ensure we have a first child
		if(!element.firstChild)
			continue;

		// search text elements
		if(element.firstChild.nodeType === 3)
		if(element.firstChild.wholeText.length > 0)
		{

			// set node value and search value
			var node_value   = element.firstChild.wholeText;
			var search_value = search;
			
			// set values to lower case if we're searching case insensitive
			if(options.case_insensitive === true)
			{
				
				// lower node value
				node_value   = node_value.toLowerCase();
				
				// lower sewarch value if it's not a regexp search
				if(typeof search_value === "string")
					search_value = search_value.toLowerCase();
				
			}
			
			// run searches  
			if(typeof search_value === "string")
			{
				
			
				// run substring match
				if(options.partial_match === true)
				if(node_value.indexOf(search_value) !== -1)
				{
					found_elements.push(element.firstChild);
					continue;
				}
			
				// if we're not substring matching, check literal match
				if(node_value === search_value)
				{
					found_elements.push(element.firstChild);
					continue;
				}
			
			}
			else if(search_value instanceof RegExp)
			{
				if(search_value.test(node_value) === true)
					found_elements.push(element.firstChild);
			}    
		
		}
		
	}
  
	// return matching/found elements
	return found_elements;

}


// wait for element containing text
async function waitForElementContainingText(selector, search, options = {}, max_wait_time_secs = 30)
{

	var curr_wait_time     = 0;
	var max_wait_time_secs = 30;
	while(true)
	{

		if(curr_wait_time >= max_wait_time_secs)
			break;

		// gather selection
		var selection = $(selector);

		// try and retrieve selection
		var selected = selectElementsContainingText(selection, search, options);
		if(isEmpty(selected) === true)
		{
			await asyncSleep(1000);
			curr_wait_time++;
			continue;
		}

		// return selected values
		if(selected.length > 0)
		{
			return selected;
		}

		// wait one second
		await asyncSleep(1000);

	}

	// return null if we don't have anything to work with
	return null;

}


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Move Up Parent Nodes From Current Node %%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// move to an element above the one supplied by tag name (useful for searching for things like anchors above)
var moveToTagAboveElement = async function(element_bottom, tag_name_above)
{
  var parent_node = element_bottom.parentNode;
  while(parent_node.tagName.toLowerCase() !== tag_name_above)
	parent_node = parent_node.parentNode;

  return parent_node;
}
