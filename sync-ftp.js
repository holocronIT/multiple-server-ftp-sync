#!/usr/bin/env node

/*
* Written by Pasqui Andrea @ Holocron
*/

var fs 					=	require('fs-extra');
var path 				= 	require('path');
var FtpClient 			= 	require('ftp');
var CsvReadableStream 	= 	require('csv-reader');
const chalk 			= 	require('chalk');
var async 				= 	require("async");


/*============================================
=            VARIABLES & COSTANTS            =
============================================*/

const FTP_SERVERLIST_FILENAME 	= process.cwd()+'/ftp-server.csv';
const FILE_TO_SYNC_DIR 			= process.cwd()+'/files';

var  totalFtpSuccess 			= 0;
var  totalFtpError				= 0;

var fileToUpload 				= [];

var totalServerCount			= false;
var tempTotalServerCount 		= 0;

var isWin = process.platform === "win32";



/*=====  End of VARIABLES & COSTANTS  ======*/



/*=========================================
=            Process Arguments            =
=========================================*/
const optionDefinitions = [
  { name: 'dir', alias: 'd', type: String , defaultValue: FILE_TO_SYNC_DIR },
  { name: 'list', type: String, defaultValue: FTP_SERVERLIST_FILENAME },
]
const commandLineArgs = require('command-line-args');
var processOptions = commandLineArgs(optionDefinitions);

/*=====  End of Process Arguments  ======*/


console.log(chalk.yellow('==========================================='));
console.log(chalk.yellow('============= Ftp Multiple Server File Sync'));
console.log(chalk.yellow('==========================================='));
console.log();

/**
 *
 * Check all things before start
 *
 */
if( !path.isAbsolute(processOptions.dir) ){
	processOptions.dir = path.join( process.cwd() , processOptions.dir );
}
if( !path.isAbsolute(processOptions.list) ){
	processOptions.list = path.join( process.cwd() , processOptions.list );
}

if( !fs.existsSync( processOptions.dir ) ){
	console.log(chalk.red('File directory not exist. Searching: '+processOptions.dir));
}

if( !fs.existsSync( processOptions.list ) ){
	console.log(chalk.red('Server list not exist. Searching: '+processOptions.list));

}

if( isWin ){
	processOptions.dir 	= processOptions.dir.replace('/', '\\' );
}




/**
 *
 * List file to upload
 *
 */
fromDir( processOptions.dir ,/\.*/,function(filename){
	fileToUpload.push(filename);
});




/**
 *
 * Reading CSV
 *
 */
console.log(chalk.white('Reading ftp server list.....'));
console.log();
console.log();


var inputStream = fs.createReadStream(processOptions.list, 'utf8');

inputStream.pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data', function (row) {

    	tempTotalServerCount++;

    	inputStream.pause();
    	var ftp = new FtpClient();

    	console.log(chalk.magenta('===> Connecting to: '+row[1]+'@'+row[0]+':'+row[3]));

    	// host
    	// user
    	// password
    	// port
    	// path
    	
    	totalFtpError++;
		ftp.on('ready', function() {

			console.log(chalk.white('=====> Connection OK'));
			totalFtpSuccess++;
			totalFtpError--;

			async.every(fileToUpload, function(file, callback) {

				var stat 			= fs.lstatSync(file);
				var remoteFilePath 	= file.replace(processOptions.dir, '' );


				
				remoteFilePath 		= row[4]+remoteFilePath;

				if( isWin ){
					remoteFilePath = remoteFilePath.replace(/\\/g, '/');
				}

				
				if( stat.isDirectory() ){
					ftp.mkdir(remoteFilePath, true,  function(err) {
					  if (err){
					  	console.log(err);
					  }
					  callback(null, !err) 
					});
				}else{
					ftp.put(file, remoteFilePath, function(err) {
					  if (err){
					  	console.log(err);
					  }
					  console.log(chalk.white('=======> Uploaded  '+remoteFilePath));
					  callback(null, !err) 
					});
				}
			    
			}, function(err, result) {
				if(result){
					ftp.end();
				}
			});

		});

		ftp.on('error', function(error) {
			console.log(chalk.red('=======> Error FTP'),error);
			
		});
		ftp.on('close', function(error) {
			console.log(chalk.white('=======> FTP close  '));
			console.log();
			ftp.end();
			inputStream.resume();
			evaluateIfIsFinished();
		});
		// connect to localhost:21 as anonymous
		ftp.connect( { host: row[0], port: row[3], secure: false, user: row[1], password: row[2] } );

        // 
    })
    .on('end', function (data) {
    	totalServerCount = tempTotalServerCount;
    });



function evaluateIfIsFinished() {
	if( totalServerCount == ( totalFtpError + totalFtpSuccess ) ){
		finishSync();
	}
}



function finishSync() {
	console.log();
	console.log();
	console.log(chalk.yellow('==========================================='));
	console.log(chalk.yellow('Sync finished.'));
	console.log(chalk.green('Total Success transfer: '+totalFtpSuccess));
	console.log(chalk.red('Total Failed transfer: '+totalFtpError));
}




/**
 *
 * HELPER FUNCTIONS
 *
 */
function fromDir(startPath,filter,callback){

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
        	callback(filename);
            fromDir(filename,filter,callback); //recurse
        }
        else if (filter.test(filename)) callback(filename);
    };
};
