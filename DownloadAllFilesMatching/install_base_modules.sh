#!/bin/bash

# If your module is not located in a directory tree containing 
# required modules, it may fail to load.
#
# This will likely happen if you create module directories outside
# the default parent paths for the appliction.  To fix these errors
# simply run this script or just run the "npm install" command below.

# initialize with npm
npm init

# fetch dependencies
npm install node-fetch \
			puppeteer \
			puppeteer-extra \
			puppeteer-extra-plugin-stealth \
			puppeteer-in-electron \
			puppeteer-core \
			fs-extra \
			jquery \
			jquery-ui \
			jquery-ui-dist \
			datatables.net \
			datatables.net-buttons
	