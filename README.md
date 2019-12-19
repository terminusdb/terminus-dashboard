# terminus-dashboard

Management Dashboard for TerminusDB

The Terminus Dashboard is a simple javascript client application that provides users with an interface for managing and querying TerminusDB. It ships with TerminusDB and is available by default at the /dashboard URL of an installed TerminusDB server (default is http://localhost:6363/dashboard  

The dashboard requires terminus-client to be available. 

To install the manually dashboard, you have 3 choices: 

* Include the mininfied javascript libraries (in the /dist directory) in a web page 
* Download the package and use npm to manage the dependencies
* For developors, the npm package includes a development server

1. Minified Javascript libraries
For simple HTML use, you can just add the following scripts to any HTML page
```<script src="https://terminusdb.com/t/terminus-client.min.js"></script>
<script src="https://terminusdb.com/t/terminus-dashboard.min.js"></script>
```

2. npm
Clone this repo, then cd into the root dir and run: 
`npm install`
And all of the dependencies should be automatically installed

3. developers
As above and then type
`npm run start:dev`
