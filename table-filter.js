(function (origin) {
    'use strict';
    
    var emptyElement = {
        querySelector: function () {
            return emptyElement;
        },
        querySelectorAll: function () {
            return [];
        }
    }
    
    // var tableHead;
    // var tableBody;
    // var headerCells;
    // var numberOfColumns;

    if (origin.TableFilter) {
        return;
    }
    
    function getTableHead(tableElement) {
        return tableElement.querySelector('thead') || emptyElement;
    }
    
    function getTableBody(tableElement) {
        return tableElement.querySelector('thead') || emptyElement;
    }
    
    function getHeaderCells(tableHeadElement) {
        return tableHeadElement.querySelectorAll('th');
    }
    
    function createFilterRow(tableHeadElement) {
        var filterRow = document.createElement('tr');
        
        tableHeadElement.appendChild(filterRow);
        
        return filterRow;
    }
    
    function createFilter(tableElement) {
        var tableHeadElement = getTableHead(tableElement);
        var tableBodyElement = getTableBody(tableElement);
        
        var headerCells = getHeaderCells(tableHeadElement);
        
        var numberOfColumns = headerCells.length;
        
        var filterRow = createFilterRow(tableHeadElement);
        
        var filterCell;
        
        for (var i = 0; i < numberOfColumns; i++) {
            filterCell = document.createElement('th');
            
        }
    }

    origin.TableFilter = function (selector) {
        var element = document.querySelector(selector);
        
        if (!element) {
            console.error('Could not find element by selector', selector);
            
            return;
        }
        
        if (element.nodeName.toLowerCase() !== 'table') {
            console.error('Element with selector', selector, 'is not a table');
            
            return;
        }
        
        createFilter(element);
    };

})(this);