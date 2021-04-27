

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Character Checks %%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// simply checks if a buffer is all ascii characters
var isAsciiPrintable = function(str)
{
    var ascii_check_regexp = new RegExp('^[\x09\x0a\x0d\x20-\x7e]+$', "g");
    if(ascii_check_regexp.test(str) === true)
        return true;
    
    return false;
}

// check if a string contains alphanumeric or underscore
var isAlphaNumericUnderscoreSpace = function(str)
{
    var ascii_check_regexp = new RegExp('^[A-Za-z0-9_ ]+$', "g");
    if(ascii_check_regexp.test(str) === true)
        return true;
    
    return false;
}

// check if a string contains alphanumeric or underscore
var isAlphaNumericUnderscore = function(str)
{
    var ascii_check_regexp = new RegExp('^[A-Za-z0-9_]+$', "g");
    if(ascii_check_regexp.test(str) === true)
        return true;
    
    return false;
}

// check if a string contains alphanumeric values
var isAlphaNumeric = function(str)
{
    var ascii_check_regexp = new RegExp('^[A-Za-z0-9]+$', "g");
    if(ascii_check_regexp.test(str) === true)
        return true;
    
    return false;
}

// Check if a string contains alphabet characters only.
var isAlphabet = function(str)
{
    var ascii_check_regexp = new RegExp('^[A-Za-z]+$', "g");
    if(ascii_check_regexp.test(str) === true)
        return true;
    
    return false;
}

// export checks
module.exports.isAsciiPrintable              = isAsciiPrintable;
module.exports.isAlphaNumericUnderscoreSpace = isAlphaNumericUnderscoreSpace;
module.exports.isAlphaNumericUnderscore      = isAlphaNumericUnderscore;
module.exports.isAlphaNumeric                = isAlphaNumeric;
module.exports.isAlphabet                    = isAlphabet;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Chop/Chomp String %%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// simply remove the last character in a string
var chop = function(str)
{
    return str.substr(0, str.length - 1);
}

var ltrim = function(str)
{
    return str.substring(1);
}

// string chop aliases
module.exports.chop  = chop;
module.exports.rtrim = chop;

// left trim aliases
module.exports.lchop = ltrim;
module.exports.ltrim = ltrim;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Check if Async Function %%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

var isAsyncFunction = function(func)
{

    // check if a function is async
    var is_async_function = false;
    try
    {
        if(func.constructor.name == 'AsyncFunction')
            is_async_function = true;
    } catch(err){}

    // return true or false
    return is_async_function;

}

// export the test function
module.exports.isAsyncFunction = isAsyncFunction;



// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Class Information %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// get class methods
var getClassMethods = function(class_instance)
{

    // check class properties
    if(isEmpty(class_instance) === true)
        return null;
    if(typeof class_instance !== "object")
        return null;

    // get class methods 
    class_methods = Object.getOwnPropertyNames(class_instance.__proto__).filter(function(p)
    {
        return typeof class_instance[p] === "function";
    });

    // return the class methods
    return class_methods;

}

// explort the class method parser
module.exports.getClassMethods = getClassMethods;



// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Simple Validators %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// check if value is a uuid
var isValidUUID = function(uuid_val)
{
   

    // ensure value isn't empty
    if(isEmpty(uuid_val) === true)
        return false;

    // check to ensure guid is valid double length guid
    if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid_val) !== true)
    {
        return false;
    }

    // return indicating success
    return true;

}

// check for valid double length uuid
var isValidDoubleLengthUUID = function(double_length_uuid_val)
{

    // ensure value isn't empty
    if(isEmpty(double_length_uuid_val) === true)
        return false;

    // check to ensure guid is valid double length guid
    if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(double_length_uuid_val) !== true)
    {
        return false;
    }

    // return indicating success
    return true;

}


module.exports.isValidUUID = isValidUUID;
module.exports.isValidDoubleLengthUUID = isValidDoubleLengthUUID;



// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Array Sorting Utilities %%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// sort the ipv4 array
var sortIPv4Array = function(ipv4_string_array)
{

    // ensure input is an array
    if(Array.isArray(ipv4_string_array) === false)
        return null;

    
    // sorted results
    var sorted_results = [];

    // iterate through data and add results
    for(var idx = 0; idx < ipv4_string_array.length; idx++)
    {
        try
        {
            sorted_results.push(ip.toLong(ipv4_string_array[idx]));
        } catch(err){}
    }

    // sort the results by integer
    sorted_results.sort(function(a, b){ return a - b;});

    // iterate through results
    for(var idx = 0; idx < sorted_results.length; idx++)
    {
        sorted_results[idx] = ip.fromLong(sorted_results[idx]);
    }

    // return sorted results
    return sorted_results;

}


// sort integer string array (parses to in, then sorts by string)
var sortIntegerStringArray = function(int_string_array)
{

    // ensure input is an array
    if(Array.isArray(int_string_array) === false)
        return null;

    
    // sorted results
    var sorted_results = [];

    // iterate through data and add results
    for(var idx = 0; idx < int_string_array.length; idx++)
    {
        try
        {
            sorted_results.push(parseInt(int_string_array[idx]));
        } catch(err){}
    }

    // sort the results by integer
    sorted_results.sort(function(a, b){ return a - b;});
    
    // iterate through results
    for(var idx = 0; idx < sorted_results.length; idx++)
    {
        sorted_results[idx] = sorted_results[idx].toString();
    }

    // return sorted results
    return sorted_results;

}

// export sorting utilities 
module.exports.sortIPv4Array          = sortIPv4Array;
module.exports.sortIntegerStringArray = sortIntegerStringArray;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Time Utils %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// Sleep asynchronously, resolving the returned promise only after a timeout executes.
var asyncSleep = function(seconds)
{
    return new Promise(function(resolve, reject)
    {
        setTimeout
        (
            function()
            {
                resolve();
            }, 
            seconds * 1000
        );
    });
}

// Sleep asynchronously (in miliseconds), resolving the returned promise only after a timeout executes.
var asyncSleepMiliseconds = function(miliseconds)
{
    return new Promise(function(resolve, reject)
    {
        setTimeout
        (
            function()
            {
                resolve();
            }, 
            miliseconds
        );
    });
}

// sleep random seconds between min and max
var asyncSleepRandom = async function(min_sec, max_sec)
{

    // generate random integer
    var random_sleep_sec = randomIntegerBetween(min_sec, max_sec);
    if(random_sleep_sec === -1)
        return;
    if(random_sleep_sec === 0)
        return;

    // sleep async
    await asyncSleep(random_sleep_sec);

}

// sleep random seconds between min and max
var asyncSleepRandomMiliseconds = async function(min_mili, max_mili)
{

    // generate random integer
    var random_sleep_mili = randomIntegerBetween(min_mili, max_mili);
    if(random_sleep_mili === -1)
        return;
    if(random_sleep_mili === 0)
        return;

    // sleep async
    await asyncSleepMiliseconds(random_sleep_mili);

}

// export the sleep function
module.exports.asyncSleep            = asyncSleep;
module.exports.asyncSleepMiliseconds = asyncSleepMiliseconds;

// export the random sleep functions
module.exports.asyncSleepRandom            = asyncSleepRandom;
module.exports.asyncSleepRandomMiliseconds = asyncSleepRandomMiliseconds;


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

// export the random generator
module.exports.randomIntegerBetween = randomIntegerBetween;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Capitalize Strings %%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// capitalizes words in a string
var capitalizeWords = function(str, separator = " ")
{

    if(typeof str !== "string")
        return null;
    if(str.length <= 0)
        return null;

    // try to separate string
    var separated_string = str.split(separator);
    if(isEmpty(separated_string) === true)
        return str.charAt(0).toUpperCase();
    
    // capitalize first letters
    var capitalized_string = str.split(separator).map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(separator);

    // return the capitalized string
    return capitalized_string;

}

// capitalize some words
module.exports.capitalizeWords = capitalizeWords;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Random String Utilities %%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// char sets
var chars_a_to_z_small = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
var chars_a_to_z_caps  = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var chars_zero_to_nine = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
var chars_special      = 
[
    '!', '@', '#', '$', '%', '^', '&', '*',   '(',
    ')', '_', '+', '-', '=', '{', '}', '[',   ']',
    '|', '\\', ':', ';', '"', '\'', '<', '>', '?', 
    ',', '.', '/', '~', '`'
];

// all hex
var chars_all_hex_00_to_ff = 
[
    "\x00", "\x01", "\x02", "\x03", "\x04", "\x05", "\x06", "\x07", "\x08", "\x09", "\x0a", "\x0b", "\x0c", "\x0d", "\x0e", "\x0f", 
    "\x10", "\x11", "\x12", "\x13", "\x14", "\x15", "\x16", "\x17", "\x18", "\x19", "\x1a", "\x1b", "\x1c", "\x1d", "\x1e", "\x1f", 
    "\x20", "\x21", "\x22", "\x23", "\x24", "\x25", "\x26", "\x27", "\x28", "\x29", "\x2a", "\x2b", "\x2c", "\x2d", "\x2e", "\x2f", 
    "\x30", "\x31", "\x32", "\x33", "\x34", "\x35", "\x36", "\x37", "\x38", "\x39", "\x3a", "\x3b", "\x3c", "\x3d", "\x3e", "\x3f", 
    "\x40", "\x41", "\x42", "\x43", "\x44", "\x45", "\x46", "\x47", "\x48", "\x49", "\x4a", "\x4b", "\x4c", "\x4d", "\x4e", "\x4f", 
    "\x50", "\x51", "\x52", "\x53", "\x54", "\x55", "\x56", "\x57", "\x58", "\x59", "\x5a", "\x5b", "\x5c", "\x5d", "\x5e", "\x5f", 
    "\x60", "\x61", "\x62", "\x63", "\x64", "\x65", "\x66", "\x67", "\x68", "\x69", "\x6a", "\x6b", "\x6c", "\x6d", "\x6e", "\x6f", 
    "\x70", "\x71", "\x72", "\x73", "\x74", "\x75", "\x76", "\x77", "\x78", "\x79", "\x7a", "\x7b", "\x7c", "\x7d", "\x7e", "\x7f", 
    "\x80", "\x81", "\x82", "\x83", "\x84", "\x85", "\x86", "\x87", "\x88", "\x89", "\x8a", "\x8b", "\x8c", "\x8d", "\x8e", "\x8f", 
    "\x90", "\x91", "\x92", "\x93", "\x94", "\x95", "\x96", "\x97", "\x98", "\x99", "\x9a", "\x9b", "\x9c", "\x9d", "\x9e", "\x9f", 
    "\xa0", "\xa1", "\xa2", "\xa3", "\xa4", "\xa5", "\xa6", "\xa7", "\xa8", "\xa9", "\xaa", "\xab", "\xac", "\xad", "\xae", "\xaf", 
    "\xb0", "\xb1", "\xb2", "\xb3", "\xb4", "\xb5", "\xb6", "\xb7", "\xb8", "\xb9", "\xba", "\xbb", "\xbc", "\xbd", "\xbe", "\xbf", 
    "\xc0", "\xc1", "\xc2", "\xc3", "\xc4", "\xc5", "\xc6", "\xc7", "\xc8", "\xc9", "\xca", "\xcb", "\xcc", "\xcd", "\xce", "\xcf", 
    "\xd0", "\xd1", "\xd2", "\xd3", "\xd4", "\xd5", "\xd6", "\xd7", "\xd8", "\xd9", "\xda", "\xdb", "\xdc", "\xdd", "\xde", "\xdf", 
    "\xe0", "\xe1", "\xe2", "\xe3", "\xe4", "\xe5", "\xe6", "\xe7", "\xe8", "\xe9", "\xea", "\xeb", "\xec", "\xed", "\xee", "\xef", 
    "\xf0", "\xf1", "\xf2", "\xf3", "\xf4", "\xf5", "\xf6", "\xf7", "\xf8", "\xf9", "\xfa", "\xfb", "\xfc", "\xfd", "\xfe", "\xff"
];

// all hex without null byte
var chars_all_hex_01_to_ff = 
[
    "\x01", "\x02", "\x03", "\x04", "\x05", "\x06", "\x07", "\x08", "\x09", "\x0a", "\x0b", "\x0c", "\x0d", "\x0e", "\x0f", 
    "\x10", "\x11", "\x12", "\x13", "\x14", "\x15", "\x16", "\x17", "\x18", "\x19", "\x1a", "\x1b", "\x1c", "\x1d", "\x1e", "\x1f", 
    "\x20", "\x21", "\x22", "\x23", "\x24", "\x25", "\x26", "\x27", "\x28", "\x29", "\x2a", "\x2b", "\x2c", "\x2d", "\x2e", "\x2f", 
    "\x30", "\x31", "\x32", "\x33", "\x34", "\x35", "\x36", "\x37", "\x38", "\x39", "\x3a", "\x3b", "\x3c", "\x3d", "\x3e", "\x3f", 
    "\x40", "\x41", "\x42", "\x43", "\x44", "\x45", "\x46", "\x47", "\x48", "\x49", "\x4a", "\x4b", "\x4c", "\x4d", "\x4e", "\x4f", 
    "\x50", "\x51", "\x52", "\x53", "\x54", "\x55", "\x56", "\x57", "\x58", "\x59", "\x5a", "\x5b", "\x5c", "\x5d", "\x5e", "\x5f", 
    "\x60", "\x61", "\x62", "\x63", "\x64", "\x65", "\x66", "\x67", "\x68", "\x69", "\x6a", "\x6b", "\x6c", "\x6d", "\x6e", "\x6f", 
    "\x70", "\x71", "\x72", "\x73", "\x74", "\x75", "\x76", "\x77", "\x78", "\x79", "\x7a", "\x7b", "\x7c", "\x7d", "\x7e", "\x7f", 
    "\x80", "\x81", "\x82", "\x83", "\x84", "\x85", "\x86", "\x87", "\x88", "\x89", "\x8a", "\x8b", "\x8c", "\x8d", "\x8e", "\x8f", 
    "\x90", "\x91", "\x92", "\x93", "\x94", "\x95", "\x96", "\x97", "\x98", "\x99", "\x9a", "\x9b", "\x9c", "\x9d", "\x9e", "\x9f", 
    "\xa0", "\xa1", "\xa2", "\xa3", "\xa4", "\xa5", "\xa6", "\xa7", "\xa8", "\xa9", "\xaa", "\xab", "\xac", "\xad", "\xae", "\xaf", 
    "\xb0", "\xb1", "\xb2", "\xb3", "\xb4", "\xb5", "\xb6", "\xb7", "\xb8", "\xb9", "\xba", "\xbb", "\xbc", "\xbd", "\xbe", "\xbf", 
    "\xc0", "\xc1", "\xc2", "\xc3", "\xc4", "\xc5", "\xc6", "\xc7", "\xc8", "\xc9", "\xca", "\xcb", "\xcc", "\xcd", "\xce", "\xcf", 
    "\xd0", "\xd1", "\xd2", "\xd3", "\xd4", "\xd5", "\xd6", "\xd7", "\xd8", "\xd9", "\xda", "\xdb", "\xdc", "\xdd", "\xde", "\xdf", 
    "\xe0", "\xe1", "\xe2", "\xe3", "\xe4", "\xe5", "\xe6", "\xe7", "\xe8", "\xe9", "\xea", "\xeb", "\xec", "\xed", "\xee", "\xef", 
    "\xf0", "\xf1", "\xf2", "\xf3", "\xf4", "\xf5", "\xf6", "\xf7", "\xf8", "\xf9", "\xfa", "\xfb", "\xfc", "\xfd", "\xfe", "\xff"
];


// all hex from 7f to ff
var chars_all_hex_7f_to_ff = 
[
    "\x7f", 
    "\x80", "\x81", "\x82", "\x83", "\x84", "\x85", "\x86", "\x87", "\x88", "\x89", "\x8a", "\x8b", "\x8c", "\x8d", "\x8e", "\x8f", 
    "\x90", "\x91", "\x92", "\x93", "\x94", "\x95", "\x96", "\x97", "\x98", "\x99", "\x9a", "\x9b", "\x9c", "\x9d", "\x9e", "\x9f", 
    "\xa0", "\xa1", "\xa2", "\xa3", "\xa4", "\xa5", "\xa6", "\xa7", "\xa8", "\xa9", "\xaa", "\xab", "\xac", "\xad", "\xae", "\xaf", 
    "\xb0", "\xb1", "\xb2", "\xb3", "\xb4", "\xb5", "\xb6", "\xb7", "\xb8", "\xb9", "\xba", "\xbb", "\xbc", "\xbd", "\xbe", "\xbf", 
    "\xc0", "\xc1", "\xc2", "\xc3", "\xc4", "\xc5", "\xc6", "\xc7", "\xc8", "\xc9", "\xca", "\xcb", "\xcc", "\xcd", "\xce", "\xcf", 
    "\xd0", "\xd1", "\xd2", "\xd3", "\xd4", "\xd5", "\xd6", "\xd7", "\xd8", "\xd9", "\xda", "\xdb", "\xdc", "\xdd", "\xde", "\xdf", 
    "\xe0", "\xe1", "\xe2", "\xe3", "\xe4", "\xe5", "\xe6", "\xe7", "\xe8", "\xe9", "\xea", "\xeb", "\xec", "\xed", "\xee", "\xef", 
    "\xf0", "\xf1", "\xf2", "\xf3", "\xf4", "\xf5", "\xf6", "\xf7", "\xf8", "\xf9", "\xfa", "\xfb", "\xfc", "\xfd", "\xfe", "\xff"
];

// generate a random string
var randomString = function (length, chars) 
{
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}


// generate a random alphabet string
var randomAlphabetString = function (length) 
{

	// set characters to use
	var chars = [].concat
	(
		chars_a_to_z_small,
		chars_a_to_z_caps
	);

	// create random string
    var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	
	// return result
    return result;
}

// generate a random string
var randomAlphanumericString = function (length) 
{

	// set characters to use
	var chars = [].concat
	(
		chars_a_to_z_small,
		chars_a_to_z_caps,
		chars_zero_to_nine
	);

	// create random string
    var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	
	// return result
    return result;
}


// export character set arrays
module.exports.chars_a_to_z_small     = chars_a_to_z_small;
module.exports.chars_a_to_z_caps      = chars_a_to_z_caps;
module.exports.chars_zero_to_nine     = chars_zero_to_nine;
module.exports.chars_special          = chars_special;
module.exports.chars_all_hex_00_to_ff = chars_all_hex_00_to_ff;
module.exports.chars_all_hex_01_to_ff = chars_all_hex_01_to_ff;
module.exports.chars_all_hex_7f_to_ff = chars_all_hex_7f_to_ff;

// export random string functions
module.exports.randomString             = randomString;
module.exports.randomAlphabetString     = randomAlphabetString;
module.exports.randomAlphanumericString = randomAlphanumericString;



// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% ID Generation/Retrieval %%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// create guid 
var guid = function()
{
    return uuid_random();
}

// export guid creator(s)
module.exports.guid = guid;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Validation Utilities %%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

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

// checks if an array of values are "empty" using the isEmpty routine.
//   empty types:
//           undefined
//           null
//           zero length array
//           zero length string
//           object with no keys
var valuesAreEmpty = function(array_of_values_to_check)
{

    // ensure it's an array
    if(Array.isArray(array_of_values_to_check) !== true)
        return true;
    
    // iterate through values
    for(var array_idx in array_of_values_to_check)
    {
        if(isEmpty(array_of_values_to_check[array_idx]) !== true)
            return false;
    }

    // return indicating success
    return true;

}

// checks that all values provided are not empty
var valuesAreNotEmpty = function(array_of_values_to_check)
{
    // ensure it's an array
    if(Array.isArray(array_of_values_to_check) === false)
        return false;

    // iterate through values
    for(var array_idx in array_of_values_to_check)
    {
        if(isEmpty(array_of_values_to_check[array_idx]) === true)
            return false;
    }

    // return indicating success
    return true;
}
// export empty check
module.exports.isEmpty = isEmpty;
module.exports.valuesAreEmpty = valuesAreEmpty;
module.exports.valuesAreNotEmpty = valuesAreNotEmpty;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Load File As Base64 %%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// attempt to load file as base64
var loadFileAsBase64 = function(full_file_path)
{

    if(isEmpty(full_file_path) === true)
        return null;
    if(fs.existsSync(full_file_path) !== true)
        return null;

    // attempt to read file data
    var file_data = fs.readFileSync(full_file_path);

    // ensure we have file data
    if(isEmpty(file_data) === true)
        return null;

    // set ret data
    var ret_data = file_data.toString('base64');

    // return the ret data
    return ret_data;

}

// load file as png
module.exports.loadFileAsBase64 = loadFileAsBase64;





// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Load File As Array %%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// read file lines into an array (skips empty lines)
var readFileLinesIntoArray = function(filename)
{

    // gather data
    var fs = require('fs');
    var ret_array = null;
    try
    {
        notice(filename);
        ret_array = fs.readFileSync(filename).toString().split("\n");
    } catch(err){}

    if(isEmpty(ret_array) === true)
    {
        try
        {
            notice(filename);
            ret_array = fs.readFileSync(filename).toString().split("\r");
        } catch(err){}
    }

    // final array
    var final_array = [];

    // iterate through array
    for(i in ret_array) 
    {

        // set element from array
        var element = ret_array[i];

        // remove any newlines or returns that may have somehow got in
        element = element.replace(/\n$/, '');
        element = element.replace(/\r$/, '');
        
        // ensure the element isn't empty
        if(isEmpty(element) === true)
            continue;
        
        // push final array
        final_array.push(element);

    }

    // return the file array
    return final_array;

}

// attempt to read an array containing file names into a single buffer with no duplicates
var readFileArrayLinesIntoArray = function(file_array)
{

    // set final array
    var final_array = [];
    if(isEmpty(file_array) === true)
        return false;
    if(Array.isArray(file_array) === false)
        return false;

    // iterate through file array
    for(var idx = 0; idx < file_array.length; idx++)
    {

        // read lines
        var line_array = readFileLinesIntoArray(file_array[idx]);
        if(isEmpty(line_array) === true)
            continue;

        // iterate through loaded line array
        for(var line_idx in line_array)
        {

            // ensure the element doesn't already exist
            if(final_array.indexOf(line_array[line_idx]) !== -1)
                continue;

            // add line if it doesn't exist in array
            final_array.push(line_array[line_idx]);

        }

    }

    // return the final array
    return final_array;

}

// set exports
module.exports.readFileLinesIntoArray      = readFileLinesIntoArray;
module.exports.readFileArrayLinesIntoArray = readFileArrayLinesIntoArray;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Image Utilities %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// load png file
var loadPNGFile = async function(full_file_path)
{

    // run basic checks
    if(isEmpty(full_file_path) === true)
        return null;
    if(fs.existsSync(full_file_path) !== true)
        return null;

    // attempt to read file data
    var file_data = fs.readFileSync(full_file_path);

    // ensure we have file data
    if(isEmpty(file_data) === true)
        return null;

    // set ret data
    var ret_data = await parsePng(file_data);
    if(isEmpty(ret_data) === true)
        return null;

    // set base64 data
    ret_data.base64_data = loadFileAsBase64(full_file_path);

    // set parser to null (deref)
    ret_data._parser      = null;
    ret_data._packer      = null;
    ret_data._events      = null;
    ret_data._eventsCount = null;

    // remove internal references
    delete ret_data.data;
    delete ret_data._parser;
    delete ret_data._packer;
    delete ret_data._events;
    delete ret_data._eventsCount;

    // set marker as indicator
    ret_data.is_png = true;

    // return the ret data
    return ret_data;

}

// load png file
module.exports.loadPNGFile = loadPNGFile;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Raw JWT Decoder %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// decode jwt
var decodeJWTFromBase64 = function(base64_jwt)
{


    if(typeof base64_jwt !== "string")
        return null;

    // run arbitrary checks
    if(base64_jwt.length > 1024 || base64_jwt.length < 20)
        return null;

    // return null if its
    if(isEmpty(base64_jwt) === true)
        return null;

    // return null if we cant decode
    var buff = Buffer.from(base64_jwt, 'base64');
    if(isEmpty(buff) === true)
        return null;

    // convert to string
    var jwt_str = buff.toString();
    
    // ensure that parts are filled out
    var parts = jwt_str.split("}");
    if(parts.length < 3)
        return null;


    // set header part
    parts[0] = parts[0]+"}";
    if(parts[0].length > 100)
        return null;

    // set data part
    parts[1] = parts[1]+"}";
    if(parts[1].length > 500)
        return null;


    var decoded = 
    {
        header: JSON.parse(parts[0]),
        body:   JSON.parse(parts[1]),
        signature: buff.slice(parts[0].length + parts[1].length)
    };

    // return decoded values
    return decoded;

}

// export jwt
module.exports.decodeJWTFromBase64 = decodeJWTFromBase64;


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Redactions %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// redact object by keys
var redactObjectsByKeys = function(object_to_redact, keys_to_redact)
{

    for(var key_idx in object_to_redact)
    {

        // recurse if this is an object
        if(typeof object_to_redact[key_idx] === "object" || Array.isArray(object_to_redact[key_idx]))
        {

            // see if the current value is in the list of redadction keys
            var redact_idx = keys_to_redact.indexOf(key_idx);
            if(redact_idx === -1)
            {
                redactObjectsByKeys(object_to_redact[key_idx], keys_to_redact);
            }
            else
            {
                // overwrite the object_to_redact if necessary
                object_to_redact[key_idx] = "This value has been redacted before transmission.";
            }

            
        }
        else if(typeof object_to_redact[key_idx] === "string")
        {

            // see if the current value is in the list of redadction keys
            var redact_idx = keys_to_redact.indexOf(key_idx);
            if(redact_idx === -1)
                continue;
            
            // overwrite the object_to_redact if necessary
            object_to_redact[key_idx] = "This value has been redacted before transmission.";

        }

    }

}


// redact object by object_to_redact
var redactObjectsByValues = function(object_to_redact, values_to_redact)
{

    for(var value_idx in object_to_redact)
    {

        // recurse if this is an object
        if(typeof object_to_redact[value_idx] === "object" || Array.isArray(object_to_redact[value_idx]))
        {
            redactObjectsByValues(object_to_redact[value_idx], values_to_redact);
        }
        else if(typeof object_to_redact[value_idx] === "string")
        {

            // see if the current value is in the list of redadction keys
            var redact_idx = values_to_redact.indexOf(object_to_redact[value_idx]);
            if(redact_idx === -1)
                continue;
            
            // overwrite the object_to_redact if necessary
            object_to_redact[value_idx] = "This value has been redacted before transmission.";

        }

    }

}

// substitute object values by regex
var substituteValueInObjectByRegex = function(object_to_redact, regex_to_substitute, value_to_replace_with)
{

    // iterate object
    for(var value_idx in object_to_redact)
    {

        // recurse if this is an object
        if(typeof object_to_redact[value_idx] === "object" || Array.isArray(object_to_redact[value_idx]))
        {
            substituteValueInObjectByRegex(object_to_redact[value_idx], regex_to_substitute, value_to_replace_with);
        }
        else if(typeof object_to_redact[value_idx] === "string")
        {

            // see if the current value is in the list of redadction keys
            var matched_regex = regex_to_substitute.test(object_to_redact[value_idx]);
            if(matched_regex === false)
                continue;

            // perform replacement
            object_to_redact[value_idx] = object_to_redact[value_idx].replace(regex_to_substitute, value_to_replace_with);

        }

    }

}

// redact objects
module.exports.redactObjectsByValues = redactObjectsByValues;
module.exports.redactObjectsByKeys   = redactObjectsByKeys;

// replace in objects by regex
module.exports.substituteValueInObjectByRegex = substituteValueInObjectByRegex;