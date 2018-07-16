
[![node](https://img.shields.io/badge/version-1.0.0-green.svg)]()


# Multiple Server Ftp Sync

Script to sync a local directory on a predefined ftp server list.

## Getting Started

### Installing

A step by step series of examples that tell you have to get packet running


```shell
npm install multiple-server-ftp-sync -g
```

Move to your to the folder where there is the ftp server list and files to upload

```shell
cd /your/wordpress/direcotry/of/work/
```


Without any options the script search a csv file named **ftp-server.csv** and a folder with the files to uload named **files**

Than run the comand

```shell
sync-ftp
```


The script accept two inpit param for overriding defaults:

```shell
sync-ftp  --dir /path/to/file/to/upload/ --list /path/to/server/list/list.csv
```


## Built With

* NodeJS


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Pasqui Andrea** - *Initial work*

## License

This project is licensed under the MIT License 

## Acknowledgments

-

