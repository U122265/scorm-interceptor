# scorm-interceptor
A tool that intercepts SCORM and translates it into xAPI statements.

## Description
This project contains a drop in javascript plugin for any SCORM package that will automatically
intercept SCORM statements, convert them to valid xAPI statements, and send them to an LRS.

## Features
* Compatible with xAPI Spec 1.0.3
* Compatible with any SCORM compliant package
* Fully configurable

## Installation
1) Include Javascript
```javascript
<script type="text/javascript" src="/lib/scorm-xapi.js"></script>
<script type="text/javascript" src="/lib/scorm-interceptor.js"></script>
```
2) Initialize the interceptor
```javascript
xapiInterceptor.init({ /* config goes here */});
```

## Table of Contents
* [**Description**](#description)
* [**Installation**](#installation)
* [**Configuration**](#script-usage)
  * [LRS](#LRS)
  * [xAPI](#xAPI)
  * [SCORM](#SCORM)

  ## Configuration

  ### Sample Configuration Object
```javascript
{
  lrs: {
    endpoint: 'https://example.com/lrs', 
    username: 'exampleUser',
    password: 'examplePassword',
    authKey: ''
  },
  xapi: {
    verbs: {
      defaultVerb: 'interacted',
      map: {
        'cmi.suspend_data': 'interacted'
      }
    },
    agent: {
      defaultAgent: {
        id: 'DEFAULT_AGENT_ID',
        name: 'DEFAULT_AGENT_NAME'
      }
    }
  },
  scorm: {
    setValueFunction: 'SCORM_CallLMSSetValue',
    api: 'SCORM_objAPI'
  },
  debug: true
}
```

  Below are the different ways you can configure the interceptor.

  ### LRS
```javascript
{
  lrs: {
    endpoint: 'https://example.com/lrs', 
    username: 'exampleUser',
    password: 'examplePassword',
    authKey: ''
  }
}
```

  #### Set the lrs endpoint to post xApi statements to

  `config.lrs.endpoint` : string

  #### Set the lrs username for authentication

  `config.lrs.username` : string

  #### Set the lrs password for authentication

  `config.lrs.password` : string

  #### Set the lrs authorization key (overrides username/password)

  `config.lrs.authKey` : string


  ### xAPI
```javascript
{
  xapi: {
    verbs: {
      defaultVerb: 'interacted',
      map: {
        'cmi.suspend_data': 'interacted'
      }
    },
    agent: {
      defaultAgent: {
        id: 'DEFAULT_AGENT_ID',
        name: 'DEFAULT_AGENT_NAME'
      }
    }
  }
}
```

  #### Set the default verb to use when generating xAPI statements

  `config.xapi.verbs.defaultVerb` : string

  #### A map of the ScormSetValue elements to xAPI verbs

  `config.xapi.verbs.map` : string

  #### Default agent(actor) to use when sending xAPI Statments (only used if an actor cannot be identified automatically)

  `config.xapi.agent.id` : string
  `config.xapi.agent.name` : string

  ### SCORM
```javascript
{
  scorm: {
    setValueFunction: 'SCORM_CallLMSSetValue',
    api: 'SCORM_objAPI'
  }
}
```

  #### Set the Scorm Set Value function that resides in your scorm package (REQUIRED)

  This function MUST exist for the interceptor to work. You can find this function on the window object
  when you run your scorm package. Look for a function with the "SetValue" name in it.

  `config.scorm.setValueFunction` : string

  #### Set the SCORM API object (Used to access actor information NOT REQUIRED)

  `config.scorm.api` : string
