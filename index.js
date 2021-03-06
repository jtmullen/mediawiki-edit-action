const core = require('@actions/core');
const github = require('@actions/github');
const {mwn} = require('mwn');
const fs = require('fs');


async function run() {
  try {
    core.info("Media Wiki Edit Action v0.1.1");
    const context = github.context;
    core.debug("Context:")
    core.debug(context);


    // Get/Check inputs
    const username = core.getInput('username', {required: true});
    const url = core.getInput('api_url', {required: true});
    agent = core.getInput('user_agent)', {required: false});
    const pageName = core.getInput('page_name', {required: false});
    const pageId = core.getInput('page_id', {required: false});
    const inputText = core.getInput('wiki_text', {required: false});
    const inputFile = core.getInput('wiki_text_file', {required: false});
    const editMessage = core.getInput('edit_summary', {required: true});
    const toAppend = core.getInput('append', {required: false});
    const toPrepend = core.getInput('prepend', {required: false});
    const isMinor = core.getInput('minor', {required: false});

    if(!pageName && !pageId){
      throw Error ("No Page Name or Page ID Specified");
    }

    if(!inputText && !inputFile){
      throw Error ("No Text or File Specified");
    }

    if(toAppend && toPrepend){
      core.warning("Both Prepend and Append Specified, will append")
    }

    //Create User Agent
    if(!agent){
      agent = "action";
    }
    agent = context.payload.repository.full_name + "-" + context.workflow + "-" + context.runId + "-bot-" + agent;
    core.debug("Using User Agent: " + agent);

    //Log In
    core.info("Logging In...");
    core.debug("API URL is: " + url);
    core.debug("Username is: " + username);

    const bot = await mwn.init({
      apiUrl: url,

      // Can be skipped if the bot doesn't need to sign in
      username: username,
      password: core.getInput('password', {required: true}),

      // Set your user agent (required for WMF wikis, see https://meta.wikimedia.org/wiki/User-Agent_policy):
      userAgent: agent,

      // Set default parameters to be sent to be included in every API request
      defaultParams: {
        assert: 'user' // ensure we're logged in
      }
    });

    //set-up edit info
    if(!pageId){
      toEdit = pageName;
    }else{
      toEdit = pageId;
    }

    //choose where to get page text from
    if(!inputFile){
      editText = inputText;
    }else{
      editText = fs.readFileSync(process.env.GITHUB_WORKSPACE + "/" + inputFile, 'utf8');
    }

    editParams = {
      bot: true
    };

    if(!toAppend){
      if(!toPrepend){
        editParams.text = editText;
      }else{
        editParams.prependtext = editText;
      }
    }else{
      editParams.appendtext = editText;
    }
    editParams.summary = editMessage ;
    if(isMinor){
      editParams.minor = true;
    }
  

    //Edit Page
    core.info("Editing Page: " + toEdit);
    core.debug("Parameters: ");
    core.debug(editParams);

    retval = await bot.edit(toEdit, rev => {

      return editParams;

    });
    
    core.debug("Edit complete with: ");
    core.debug(retval);

    if(retval.result != 'Success'){
      throw Error ("Edit returned status of: " + retval.result);
    }

    if('nochange' in retval){
      core.warning('Page did not change with edit');
    }

    core.info('Successfully edited page: \"' + retval.title + '\" with id: ' + retval.pageid);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
