#!/bin/bash

# If your module is not located in a directory tree containing 
# required modules, it may fail to load.
#
# This will likely happen if you create module directories outside
# the default parent paths for the appliction.  To fix these errors
# simply run this script or just run the "npm install" command below.

# Important note: Do not install puppeteer-core if you want to use puppeteer-extra.

# initialize with npm
npm init

# fetch dependencies
npm install node-fetch \
			puppeteer \
			puppeteer-extra \
			puppeteer-extra-plugin-stealth \
			puppeteer-extra-plugin-adblocker \
			puppeteer-extra-plugin-recaptcha \
			puppeteer-extra-plugin-block-resources \
			puppeteer-extra-plugin-anonymize-ua \
			puppeteer-extra-plugin-user-preferences \
			puppeteer-extra-plugin-minmax \
			puppeteer-in-electron \
			fs-extra \
			jquery \
			jquery-ui \
			jquery-ui-dist \
			datatables.net \
			datatables.net-buttons

# has to be run again for some reason
npm install puppeteer puppeteer-extra
