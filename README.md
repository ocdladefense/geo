

# NodeJS and Salesforce integrations.
A project template for NodeJS and Salesforce integrations.


## Salesforce
Parts of this project may require the Salesforce REST API.
* Install the [Salesforce development tools for VSCode](https://developer.salesforce.com/docs/platform/sfvscode-extensions/guide/install).
  * This includes the VSCode extensions, the Salesforce CLI, and an appropriate version of the Java Development Kit.
* Connect to org: <code>sf org login web --alias Sandbox__OcdPartial --instance-url https://test.salesforce.com</code>
* Display details about the connection: <code>sf org display</code>


## Installation
_Note: A secret is necessary to utilitze GitHub's Deploy to GitHub Pages functionality._
1. Clone this repository.
2. Run <code>git submodule update --init --recursive</code>.
3. Run <code>npm update</code>.
4. Run <code>npm run build</code>.
5. Optionally run any required server processes
 ** For example, <code>pm2 start [appname]</code>


## Running the app
### Node express environment:
1. Run <code>npm run build-prod</code> to build the appropriate code in <code>dist/</code>.
2. Run <code>npm run start-server</code>.
3. Disable any already-running server software (these will conflict with the port 80 config of Express server).
4. Navigate to [http://localhost](http://localhost).


## Using PM2
Use <code>pm2</code> to run this server as a daemon.
* <code>sudo pm2 status</code> - Show the status of currently running node servers.
* <code>sudo pm2 restart [app-name]</code> - Restart an app that has been updated.
* <code>sudo pm2 logs [app-name]</code> - Show the stdout and stderr logs for the specified app.


### Webpack server environment:
1. Preview the base website using <code>npm run watch</code>.

# Additional resources

## Babel transpiling
* [Babel online parser](https://babeljs.io/repl/#?browsers=defaults)

## React
* [React Router](https://reactrouter.com/start/framework/navigating)
* [Complete guide to routing in React](https://hygraph.com/blog/routing-in-react)

## Server setup
* Ubuntu: How to run an express server [as a service](https://www.google.com/search?q=ubuntu+how+to+run+a+node+express+server+as+a+service)

## Deployment
Headless deployment, on Ubuntu
## Install npm, node, sfdx, pm2 and related dependencies
<code>npm install @salesforce/cli --global</code>

### Display the SFDX Auth URL
<code>sf org display --target-org MyOrg --verbose --json > authFile.json</code>

### Authorize in CLI using the URL
<code>sf org login sfdx-url --sfdx-url-file authFile.json --alias Sandbox__OcdPartial</code>


## Adding submodules
Git submodules can be added to this repository using the <code>git submodule add</code> command:
* <code>git submodule add https://github.com/ocdladefense/node-lib-salesforce dev_modules/@ocdla/salesforce</code>


## Design Resources
* https://webflow.com/blog/google-fonts
* https://www.material-tailwind.com/blocks
* https://sentry.io/answers/how-to-change-the-css-background-opacity-of-an-element/
* Adobe Express
