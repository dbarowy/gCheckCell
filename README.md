gCheckCell
==========

CheckCell for Google Spreadsheet

Instructions:
CheckCell can be used by copying an existing instance of the project or by creating a new Google spreadsheet and Google code project from scratch.

1. Copy existing project

1.1 Copy this Google Spreadsheet https://docs.google.com/spreadsheet/ccc?key=0Ar39NjA6XMesdDFSeWh3OXdpcmZzZXVZVUF2OVY5dUE&usp=sharing . This will also copy the underlying code project.

1.2 (Optional) Replace the spreadsheet document with another one

1.3 Run CheckCell by clicking CheckCell -> Run (You will have to grant permissions.)



2. Create project from scratch:

In order to use gCheckCell you have to first create a new spreadsheet in Google Docs.
After creating the spreadsheet, go to: Tools->Script editor and create a new project.

The project will have the following files:
Code.gs  #Copied from javascript\ExcelParser\src folder
index.html #Copied from the javascript\ExcelParser\src folder
require.html #Will contain require.js withing <script> tags
CheckCell.html # See note
JQueryCss.html #Copied from the javascript\ExcelParser\src folder.


CheckCell.html is created by using requirejs to merge all the dependencies in one file.
You must first install nodejs (http://nodejs.org/).
The javascript file is created in the following way:

gCheckCell\javascript\ExcelParser\src> node ..\..\r.js -o baseUrl=. name=main out=main-built.js

The contents of main-built.js are copied inside CheckCell.html inside <script> tags