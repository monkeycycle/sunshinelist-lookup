//
// TODO:
// [*] fix namespace on results table
// [*] check number format (commas)
// [ ] sort on salary then last name
// [ ] paging
// [ ] index for individual history?
// [ ] update currentDataYear var to 2016
// [ ] populate initial table with top 25 earners

var giProject = giProject || {};

giProject.main = (function() {

    "use strict";

    var obj = {};

    var currentDataYear = 2015;
    // Dev
    // var esAPI = 'https://d2p809mlp4e6dh.cloudfront.net/api/search?q=';

    // Production
    var esAPI = 'https://d23ngf161jxh3l.cloudfront.net/api/search?q=';


    var queryTermID = 'sunshine-search-term';
    var querySelectID = 'sunshine-search-predefined';
    var resultsDivID = 'results';

    var queryTermEL = document.getElementById(queryTermID);
    var querySelectEL = document.getElementById(querySelectID);
    var resultsEL = document.getElementById(resultsDivID);

    live(queryTermID, 'change', function() {
        var value = this.value;

        if(value !== ''){

            // Reset the other input
            querySelectEL.value = '';

            // Run the query
            queryES(value,'all');
        }

        return obj;
    });

    live(querySelectID, 'change', function() {
        var value = this.value;
        if(value !== ''){

            // Reset the other input
            queryTermEL.value = '';

            // Run the query
            queryES(value,'employer');
        }

        return obj;
    });

    function queryES(term,type){

        console.log("Query Elasticsearch for " + term + " on type: " + type);

        var queryURL = esAPI + term;

        getCORS(queryURL, function(request){
            var corsResponse = request.currentTarget.response || request.target.responseText;
            obj = JSON.parse(corsResponse);


            // var resultsTable = '<table class="tablesaw  tablesaw-stack " data-tablesaw-mode="stack" >';
            var resultsTable = '<table class="tablesaw "  data-tablesaw-mode="columntoggle"  data-tablesaw-sortable  data-tablesaw-minimap  >';

                resultsTable += '<thead>'
                                + '<tr>'
                                + '<th scope="col" data-tablesaw-sortable-col data-tablesaw-priority="1" >Name</td>'
                                + '<th scope="col" data-tablesaw-sortable-col data-tablesaw-priority="3" >Department</th>'
                                + '<th scope="col" data-tablesaw-sortable-col data-tablesaw-priority="3" >Position</th>'
                                + '<th scope="col" data-tablesaw-sortable-col data-tablesaw-priority="1" >Salary</th>'
                                + '<th scope="col" data-tablesaw-sortable-col data-tablesaw-priority="2" >Benefits</th>'
                                + '</tr>'
                                + '</thead>';

            var resultsTableRows = '';

            //Loop through the results array and spit out a table
            var resultsArray = obj.results;
            if(resultsArray.length > 0){

                var resultsArraySorted = _.sortBy(resultsArray, [function(o) { return +o.salary; }]);

                console.log("resultsArraySorted: %o", resultsArraySorted);

                // Combine the first and last names for a fullname field to group on below
                resultsArraySorted.forEach( function (arrayItem, i) {

                    resultsArray[i].fullname = arrayItem.firstname + ' ' + arrayItem.lastname;

                    var resultsRow = '';

                    if(arrayItem.year == 2016){

                        resultsRow  = '<tr>'
                                    + '<th>' + arrayItem.firstname + ' ' + arrayItem.lastname + '</th>'
                                    + '<td>' + arrayItem.department + '</td>'
                                    + '<td>' + arrayItem.position + '</td>'
                                    + '<td>' + formatWithCommaSep(arrayItem.salary) + '</td>'
                                    + '<td>' + formatWithCommaSep(arrayItem.benefits) + '</td>'
                                    + '</tr>';

                        resultsTableRows += resultsRow;
                    }

                });

            }
            else{
                console.log("No results");

                var resultsRow = '';

                    resultsRow  = '<tr>'
                                + '<td colspan="5">Your search did not return any results. Try another?</td>'
                                + '</tr>';

                resultsTableRows += resultsRow;

            }

            // Close the table and update the page contents
            resultsTable += '<tbody>' + resultsTableRows + '</tbody>';
            resultsTable += '</table>';

            resultsEL.innerHTML = '';
            resultsEL.innerHTML = resultsTable;

        });

    }


    /********************************************************************************
    *
    * Utilities
    ********************************************************************************/
    function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent('on' + type, handler);
        else el.addEventListener(type, handler);
    }

    function removeEvent(el, type, handler) {
        if (el.detachEvent) el.detachEvent('on' + type, handler);
        else el.removeEventListener(type, handler);
    }

    function live(selector, event, callback, context) {
        addEvent(context || document, event, function(e) {
            var found, el = e.target || e.srcElement;
            while (el && !(found = el.id == selector)) el = el.parentElement;
            if (found) callback.call(el, e);
        });
    }

    function getCORS(url, success) {
        var xhr = new XMLHttpRequest();
        if (!('withCredentials' in xhr)) xhr = new XDomainRequest(); // fix IE8/9
        xhr.open('GET', url);
        xhr.onload = success;
        xhr.send();
        return xhr;
    }

    function formatWithCommaSep(number) {

        var decimalSeparator = ".";
        var thousandSeparator = ",";

        // make sure we have a string
        var result = String(number);

        // split the number in the integer and decimals, if any
        var parts = result.split(decimalSeparator);

        // if we don't have decimals, add .00
        if (!parts[1]) {
          parts[1] = "00";
        }

        // reverse the string (1719 becomes 9171)
        result = parts[0].split("").reverse().join("");

        // add thousand separator each 3 characters, except at the end of the string
        result = result.replace(/(\d{3}(?!$))/g, "$1" + thousandSeparator);

        // reverse back the integer and replace the original integer
        parts[0] = result.split("").reverse().join("");

        // recombine integer with decimals
        var reformattedNumer = parts.join(decimalSeparator);
        return reformattedNumer;
    }

    /********************************************************************************
    * Utilities
    ********************************************************************************/


})();
