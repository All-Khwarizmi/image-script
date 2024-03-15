# Node Image To PDF Script

This is a simple script that scans a folder and prompts the user to select which images to convert into a single PDF file. It uses the `pdfkit`, `prompts` and `fs` modules to accomplish this.

On Mac OS you can use Automator to create a service that will do the job. However, this script is useful for those who are not on Mac OS, or for those who want to automate the process using a script. Moreover, this script can be used as a starting point for more complex image to PDF conversion tasks.

I envision this script to be the starting point for a simple drag and drop image to PDF converter.

## Getting Started

clone the repository and run the script with the following command:

```bash
npm run conv
```

>By default the script will scan the parent folder. 

