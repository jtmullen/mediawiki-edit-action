# mediawiki-edit-action

A [github action](https://help.github.com/en/actions) to edit a page on a MediaWiki wiki. 

This action is flexible for use in Workflows on any trigger - push, pull request, release, cron, etc. It can be used on it's own, such as adding new release info to a page - which is available in the context, or with custom workflow steps that generate the wiki text from content. 

*Please make sure all usage of this action follow the bot guidelines for the wiki you are editing. All edits with this action are marked as bot edits.*

## Inputs
### Wiki & Login Information
#### `api_url`
The url of the API Endpoint for the MediaWiki wiki you are editing. See [MediaWiki API documentation](https://www.mediawiki.org/wiki/API:Main_page).

#### `username`
The username to login with. This action requires all edits be made by a logged in user. Typically this is a bot specific account or the username associated with a [bot password](https://www.mediawiki.org/wiki/Manual:Bot_passwords)

#### `password`
The password to login with. For security reasons this should be stored in a [GitHub Secret](https://docs.github.com/en/actions/reference/encrypted-secrets)

#### `user_agent`
*Optional* Custom User Agent to Append. In line with the [MediaWiki User Agent Policy](https://meta.wikimedia.org/wiki/User-Agent_policy) there is a required default user agent, this input will be appended to the default user agent in the following pattern: `[user or org name]/[repo name]-[workflow name]-[run ID]-bot-[your user agent appended here]`


### Edit Information
#### `page_name`
The name of the page to edit. Only one of page name or id is required. 

#### `page_id`
The ID of the page to edit. Only one of page name or id is required, if both are specified id will take preference. 

#### `wiki_text`
Use this input to directly pass in the wiki text for your edit. Only one of `wiki_text` or `wiki_text_file` is required. 

#### `wiki_text_file`
The path to a file with tthe wiki text to use for this edit. This will override `wiki_text` if both are specified. The path should be relative to the [GitHub Workspace](https://docs.github.com/en/actions/reference/environment-variables). The file should be utf-8 encoded. 

#### `edit_summary`
Summary of what is being changed for the [MediaWiki Edit Summary](https://meta.wikimedia.org/wiki/Help:Edit_summary)

#### `append`
Include this input to append your changes to the page instead of replacing the existing content. 

#### `prepend`
Include this input to prepend your changes to the page instead of replacing the existing content. Append takes priority over prepend if both are specified. 

#### `minor`
Include this input to mark the edit as a [minor edit](https://meta.wikimedia.org/wiki/Help:Minor_edit). 

## Outputs
None

## Example Usage

To add to a repo create a [workflow file](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions) (such as `.github/workflows/edit-wiki.yml`). The following is an example of a workflow that appends a file from a repo as a minor change on pushes to main.

```yml
name: Edit-Wiki-Page

on:
  push:
    branches:
      - main

jobs: 
  append-file:
    name: Append File To Wiki Page
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Repo
      uses: actions/checkout@v2
    - name: Edit Wiki Page
      uses: jtmullen/mediawiki-edit-action@v0
      with: 
        wiki_text_file: "path/to/file.txt"
        edit_summary: "Append Latest Update to File.txt"
        page_name: "Test Page"
        api_url: "https://www.example.com/w/api.php"
        username: "User@bot-name"
        password: ${{ secrets.WIKI_PASSWORD }}
        append: true
        minor: true

```


## Potential Future Additions
*Things I am considering adding, if any of these are of use to you please open an issue about it!*

- Multiple Page Editing
- More inputs from file(s)
- Tags
- Create/Create Only/Recreate
- Additional Content Formats

