"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Base - Template
// -------------------------------------
/**
    * @name template
    * @desc A base module that is used to create template
            tag elements that represents templates used
            by an app for any purpose.
**/

(function() {
    console.log("base/template.js loaded.");

    // @name createTemplateTags
    // @desc the main function for the base
    function createTemplateTags() {
        if ("content" in document.createElement("template")) {
            return false;
        }

        var templates = document.getElementsByTagName("template");
        var plateLen = templates.length;

        for (var x = 0; x < plateLen; ++x) { try {
            var template = templates[x];
            var content  = template.childNodes;
            var fragment = document.createDocumentFragment();

            while (content[0]) {
                fragment.appendChild(content[0]);
            }

            template.content = fragment;}
            catch(error){ console.log(error); }
        }
    }

    // ---------------------------------------------
    //   Attach base to the global namespace
    // ---------------------------------------------
    window.createTemplateTags = createTemplateTags;
    createTemplateTags();

})();
