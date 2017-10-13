(function(window) {
  var scormInterceptor = {
    config: {
      // xapi LRS configuration 
      lrs: {
        endpoint: '', 
        username: '', // Username to use for auth
        password: '', // Password to use for atuh
        authKey: ''   // Auth key (use in place of username/password)
      },
      // xapi configuration 
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
      // scorm configuration
      scorm: {
        setValueFunction: 'SCORM_CallLMSSetValue',
        api: 'SCORM_objAPI'
      },
      debug: true // Output debug information
    },
    lrsEnabled: false,
    statements: [],

    /**
     * Initialize the converter with the specified configuration
     * @param {Object} config
     * 
     */
    init: function(config) {
      this.config = mergeDeep({}, this.config, config);

      init();
    }
  };
  
  /**
   * initialize all handlers
   */
  function init() {
    setTimeout(function() {
      initLRS();

      intercetpScormSetValue();
    }, 500);
  }
  
  /**
   * Initialize the LRS so we can send xapi statements to it
   */
  function initLRS() {
    var config = scormInterceptor.config;
    var lrs = config.lrs;

    if (lrs.endpoint) {
      var conf = {
        endpoint: lrs.endpoint
      };

      if (lrs.username && lrs.password) {
        conf.user = lrs.username;
        conf.password = lrs.password;
      } else {
        conf.auth = 'Basic ' +  lrs.authKey;
      }

      ADL.XAPIWrapper.changeConfig(conf);

      scormInterceptor.lrsEnabled = true;
    }
  }

  /**
   * Get the xapi actor from the scorm API
   */
  function getActor() {
    var config = scormInterceptor.config;
    var defaultUser = config.xapi.agent.defaultAgent;
    var scormApi = window[config.scorm.api];

    var name = (scormApi && scormApi.LearnerName) ? scormApi.LearnerName : defaultUser.name;
    var id = (scormApi && scormApi.LearnerId) ? scormApi.LearnerId : defaultUser.id;
    if (validateEmail(id)) {
      id = 'mailto:' + id;
    }

    return new ADL.XAPIStatement.Agent(
      id,
      name
    );
  }

  /**
   * Get the xapi verb from the scorm API
   * @param {string} element 
   */
  function getVerb(element) {
    var verb = 
      scormInterceptor.config.xapi.verbs.map[element] ||
      scormInterceptor.config.xapi.verbs.defaultVerb;

    return ADL.verbs[verb];
  }

  /**
   * Get the xapi activity from the scorm API
   * @param {string} element 
   * @param {string} value 
   */
  function getActivity(element, value) {
    var config = scormInterceptor.config;
    var id = location.origin + '/' + element;

    var activity = new ADL.XAPIStatement.Activity(
      id,
      element
    );

    activity.extensions = { 
      [id]: value
    }

    return activity;
  }

  /**
   * Convert a scorm statement into a valid xapi statement
   * @param {string} element 
   * @param {string} value 
   */
  function scormToxApi(element, value) {
    var statement = new ADL.XAPIStatement(
      getActor(),
      getVerb(element),
      getActivity(element, value)
    );

    // Save statements to a collection so we can read it from the console
    if (scormInterceptor.config.debug) {
      scormInterceptor.statements.push(statement);
    }

    // Send the statement off to the lrs
    if (scormInterceptor.lrsEnabled) {
      statement.generateId();

      ADL.XAPIWrapper.sendStatement(statement);
    }
  }

  /**
   * Override the set value function that sends scorm statements
   */
  function intercetpScormSetValue() {
    try {
      (function() {
        var setValueFunctionName = scormInterceptor.config.scorm.setValueFunction;
        var original_SCORM_CallLMSSetValue = window[setValueFunctionName];
  
        if (!original_SCORM_CallLMSSetValue) {
          console.log('could not find set value scorm function');
          return;
        }
  
        window[setValueFunctionName] = function(strElement, strValue) {
          // Generate and persist an xapi statement based off this value
          scormToxApi(strElement, strValue);
          
          // Run the original function
          original_SCORM_CallLMSSetValue(strElement, strValue);
        }
      })();
    } catch (e) {

    }
  }

  /*************   HELPERS  **************/

  /**
   * Determine if a string is a valid email
   */
  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  
  /**
   * Simple object check.
   * @param item
   * @returns {boolean}
   */
  function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  /**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   */
  function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    var source = sources.shift();

    if (isObject(target) && isObject(source)) {
      for (var key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return mergeDeep(target, ...sources);
  }

  window.scormInterceptor = scormInterceptor;
})(window);