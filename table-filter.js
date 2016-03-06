/**
 * Definition of TableFilter module. It's purpose is to add a filtering row in table thead section.
 * Filtering row for each column adds a dropdown list with all data values in that column.
 * Selecting an option in one of the dropdowns filters contents of the table to only show rows which
 * match the selection. Also, other filtering dropdowns are also filtered accordingly to allow selecting
 * only values that are currently visible.
 * 
 * To use the module invoke the <code>TableFilter</code> function passing table CSS selector as first argument
 * and optional config object as second argument. @see <code>Table</code> constructor description for list 
 * of configuration options.
 */
(function (root) {
    'use strict';

    // Do nothing if namespace already contains such module
    if (root.TableFilter) {
        return;
    }
    
    /*
    Fake HTML Element which will be returned by querySelector(All) functions instead of null
    to save on some error checking
    */
    var emptyElement = {
        querySelector: function () {
            return emptyElement;
        },
        querySelectorAll: function () {
            return [];
        }
    }
    
    /**
     * Searches for single element with given selector under given parent.
     * 
     * @param {Element} parent Parent element
     * @param {String} childSelector CSS selector for searched child
     * @return {Element} A found HTML element or emptyElement if match was not found
     */
    var findChild = function (parent, childSelector) {
        return parent.querySelector(childSelector) || emptyElement;
    };
    
    /**
     * Searches for list of elements with given selector under given parent.
     * 
     * @param {Element} parent Parent element
     * @param {String} childrenSelector CSS selector for searched children
     * @return {Array} An array of HTML elements that match the selector
     */
    var findChildren = function (parent, childrenSelector) {
        return parent.querySelectorAll(childrenSelector);
    };
    
    /**
     * Constructs a table object based on passed table HTML element.
     * 
     * @param {Element} tableElement HTML element pointing to a table for which filters will be added
     * @param {{}} tableFilterOptions Object with configuration options for the module.
     * Configuration options with default values are:
     * <pre><code>
     * {
     *     emptyFilterText: '', // Text to be displayed as default in the filtering dropdown
     *     sortFilterValues: true, // Flag which controls if options in filtering dropdowns should be sorted
     *     numberOfColumns: -1 // Number of columns (starting from first column on the left) for which filters
     *                            should be added. -1 means that filters will be added for all columns in the table
     * }
     * </code></pre>
     * @class
     */
    var Table = function(tableElement, tableFilterOptions) {
        /**
         * Local configuration object.
         * @type {{}}
         */
        this.config = this.parseConfig(tableFilterOptions);
        
        /**
         * Referers to table <code>thead</code> element.
         * @type {Element}
         */
        this.headElement = findChild(tableElement, 'thead'); 
        
        /**
         * Referers to table <code>tbody</code> element.
         * @type {Element}
         */
        this.bodyElement = findChild(tableElement, 'tbody');
        
        /**
         * List of HTML elements pointing to cells in table header.
         * @type {Array}
         */
        this.headerCellElements = findChildren(this.headElement, 'th');
        
        /**
         * Number of all columns in the table.
         * @type {Number}
         */
        this.numberOfTableColumns = this.headerCellElements.length;
        
        // Set list of table head <code>th</code> elements in filtered columns
        if (this.config.numberOfColumns > -1 && this.config.numberOfColumns <= this.numberOfTableColumns) {
            /*
            If <code>numberOfColumns</code> config parameter is other than -1 and no more than total number
            of table columns then filtered header cells array is shortened accordingly
            */
            this.filteredHeaderCellElements = Array.prototype.slice.call(this.headerCellElements, 0, 
                this.config.numberOfColumns);
        } else {
            // Otherwise the filtered header cells will be the same as all header cells
            this.filteredHeaderCellElements = this.headerCellElements;
        }
        
        /**
         * Number of filtered columns in the table.
         * @type {Number}
         */
        this.numberOfFilteredColumns = this.filteredHeaderCellElements.length;
        
        /**
         * List of HTML elements pointing to <code>tr</code> elements in table body.
         * @type {Array}
         */
        this.rowElements = findChildren(this.bodyElement, 'tr');
        
        /**
         * Number of all rows (of <code>tbody</code> section) of original, unfiltered table.
         * @type {Number}
         */
        this.numberOfRows = this.rowElements.length;
        
        /**
         * Array with data of each data row of the table. Each item in the array has following properties:
         * - rowElement: HTML element which points to row's <code>tr</code> element,
         * - index: 0-based index of row's position in the unfiltered table,
         * - cellData: array with text values of cells in the row,
         * - visible: flag which indicates if row is visible in current filters state
         */
        this.rowData = this.buildRowData();
    };
    
    /**
     * Parses given configuration object and uses it to overwrite default configuration
     * parameters.
     * 
     * @param {{}} config Object with configuration options
     * @return {{}} Object with merged default and user's configuration options
     */
    Table.prototype.parseConfig = function (config) {
        var defaultConfig = {
            emptyFilterText: '',
            sortFilterValues: true,
            numberOfColumns: -1
        };
        
        if (!config) {
            return defaultConfig;
        }
        
        var i;
        var result = {};
        var configKeys = Object.keys(defaultConfig);
        var length = configKeys.length;
        
        for (i = 0; i < length; i++) {
            if (config.hasOwnProperty(configKeys[i])) {
                result[configKeys[i]] = config[configKeys[i]];
            } else {
                result[configKeys[i]] = defaultConfig[configKeys[i]];
            }
        }
        
        return result;
    };
    
    /**
     * Parses the rows data and builds an array of rows parameters.
     * 
     * @return {Array} Array with table rows parameters
     */
    Table.prototype.buildRowData = function () {
        var rowIndex;
        var columnIndex;
        var dataCellElements;
        var cellData;
        var result = [];
        
        for (rowIndex = 0; rowIndex < this.numberOfRows; rowIndex++) {
            // Cells in row
            dataCellElements = findChildren(this.rowElements[rowIndex], 'td');
            
            // Slice the cells array to number of filtered columns
            dataCellElements = Array.prototype.slice.call(dataCellElements, 0, 
                this.numberOfFilteredColumns);
            
            cellData = [];
            
            for (columnIndex = 0; columnIndex < this.numberOfFilteredColumns; columnIndex++) {
                /*
                Given cell data is value of it's innerHTML property with all whitespace characters replaced 
                by spaces
                */
                cellData.push(dataCellElements[columnIndex].innerHTML.replace(/\s/g, ' '));
            }
            
            result.push({
                rowElement: this.rowElements[rowIndex],
                index: rowIndex,
                cellData: cellData,
                visible: true
            });
        }
        
        return result;
    };
    
    /**
     * Creates <code>tr</code> element in table head and fills it with dropdown list for each filtered cell.
     */
    Table.prototype.createFilters = function () {
        var columnIndex;
        var dropdownList;
        var filterCell;
        var filterRow = document.createElement('tr');
        
        this.filterDropdowns = [];
        
        filterRow.className = 'table-filter-row';
        
        for (columnIndex = 0; columnIndex < this.numberOfTableColumns; columnIndex++) {
            // Create a cell in header
            filterCell = document.createElement('th');
            
            filterCell.className = 'table-filter-cell';
            
            if (columnIndex < this.numberOfFilteredColumns) {
                // For each filtered column create a dropdown list with filter values
                dropdownList = this.createFilterDropdown(columnIndex);
            
                this.filterDropdowns.push(dropdownList);
                
                filterCell.appendChild(dropdownList);
            } else {
                // If column is not filtered then only add a whitespece to the filtering cell
                filterCell.className += ' table-filter-cell-empty';
                filterCell.innerHTML = '&nbsp;';
            }
            
            filterRow.appendChild(filterCell);
        }
        
        this.headElement.appendChild(filterRow);
        
        this.populateColumnFilters();
    };
    
    /**
     * Creates a <code>select</code> element with options to filter table column with given index.
     * 
     * @param {Number} columnIndex 0-based index of the table column for which filter dropdown will be created
     * @return {Element} <code>select</code> element
     */
    Table.prototype.createFilterDropdown = function (columnIndex) {
        var dropdownList = document.createElement('select');
        
        dropdownList.className = 'form-control table-filter-dropdown';
        dropdownList.setAttribute('data-column-index', '' + columnIndex);
        
        dropdownList.addEventListener('change', this.columnFilterChangeHandler.bind(this));
        
        return dropdownList;
    };
    
    /**
     * Fills the filtering dropdown lists in table head with options according to values visible in given column.
     */
    Table.prototype.populateColumnFilters = function () {
        var columnIndex;
        
        for (columnIndex = 0; columnIndex < this.numberOfFilteredColumns; columnIndex++) {
            this.populateColumnFilter(columnIndex);
        }
    };
    
    /**
     * Fills the filtering dropdown list in column with given index.
     * 
     * @param {Number} columnIndex 0-based index of the table column
     */
    Table.prototype.populateColumnFilter = function (columnIndex) {
        var i;
        var length;
        var columnCellDataValues;
        var currentFilterValue;
        var filterDropdown = this.filterDropdowns[columnIndex];
        
        if (filterDropdown.selectedIndex > 0) {
            // Save currently selected value if non-default option is selected
            currentFilterValue = filterDropdown.value;
        }
        
        // Get array of unique text values of cells in given column
        columnCellDataValues = this.getVisibleDataCellValues(columnIndex);
        
        // Remove all options from the dropdown list
        this.clearColumnFilter(filterDropdown);
    
        // Add an option with default (non-filtered) value
        filterDropdown.appendChild(this.createDropdownOption(this.config.emptyFilterText));
        
        // Add option for each unique text value of cells in given column
        for (i = 0, length = columnCellDataValues.length; i < length; i++) {
            filterDropdown.appendChild(this.createDropdownOption(columnCellDataValues[i]));
        }
        
        if (currentFilterValue) {
            /*
            If non-default option was previously selected then find an option which matches that selected value
            and mark it as selected
            */
            findChild(filterDropdown, 'option[value="' + currentFilterValue + '"]').selected = true;
        }
    };
    
    /**
     * Removes all options from given dropdown list.
     * 
     * @param {Element} filterDropdown A <code>select</code> element to clear
     */
    Table.prototype.clearColumnFilter = function (filterDropdown) {
        while(filterDropdown.options.length > 0){                
            filterDropdown.remove(0);
        }
    };
    
    /**
     * Creates an <code>option</code> element with given text for the filter dropdown list.
     * 
     * @param {String} optionText Text of the option
     * @return {Element} Created <code>option</code> element
     */
    Table.prototype.createDropdownOption = function (optionText) {
        var option = document.createElement('option');
        
        option.className = 'table-filter-option';
        option.value = optionText;
        option.text = optionText;
        
        return option;
    };
    
    /**
     * Returns an array with unique text values of cells in table column with given index.
     * 
     * @param {Number} columnIndex 0-based table column index
     * @return {Array} Array with unique text values of cells in given column
     */
    Table.prototype.getVisibleDataCellValues = function (columnIndex) {
        var rowIndex;
        var columnDataCellValues = [];
        var row;
        
        for (rowIndex = 0; rowIndex < this.numberOfRows; rowIndex++) {
            row = this.rowData[rowIndex];
            
            if (row.visible && columnDataCellValues.indexOf(row.cellData[columnIndex]) === -1) {
                columnDataCellValues.push(row.cellData[columnIndex]);
            }
        }
        
        if (this.config.sortFilterValues) {
            columnDataCellValues.sort();
        }
        
        return columnDataCellValues;
    };
    
    /**
     * Filters table data to display only rows that match selected filter values.
     */
    Table.prototype.filterData = function () {
        var rowIndex;
        var row;
        
        for (rowIndex = 0; rowIndex < this.numberOfRows; rowIndex++) {
            row = this.rowData[rowIndex];
            
            if (this.rowMatchesFilters(row)) {
                // Show the row if it's cell values match selected filters
                this.showRow(row);
            } else {
                // Hide the row otherwise
                this.hideRow(row);
            }
        }
    };
    
    /**
     * Verifies if cell data values in given row match values selected in filter dropdowns.
     * 
     * @param {{}} row Object with row data
     * @return {Boolean} <code>true</code> if row matches filters. <code>false</code> otherwise
     */
    Table.prototype.rowMatchesFilters = function (row) {
        var columnIndex;
        var filterValue;
        var filterDropdown;
        
        // Iterate over all filter dropdowns
        for (columnIndex = 0; columnIndex < this.numberOfFilteredColumns; columnIndex++) {
            filterDropdown = this.filterDropdowns[columnIndex];
            
            if (filterDropdown.selectedIndex > 0) {
                /*
                If filter dropdown has a non-default value selected then check if cell text in verified row
                in the filters column matches filter value
                */
                filterValue = filterDropdown.options[filterDropdown.selectedIndex].value;
                
                if (row.cellData[columnIndex] !== filterValue) {
                    return false;
                }
            }
        }
        
        return true;
    };
    
    /**
     * Displays given row (adds it's element to DOM) if it's not currently visible.
     * 
     * @param {{}} row Object with row data
     */
    Table.prototype.showRow = function (row) {
        var rowIndex;
        var appended = false;
        
        if (!row.visible) {
            /*
            Row must be inserted at correct position, so iterate over all rows with index higher than current row 
            and find one that's visible. This will be the point when current row should be inserted.
            */
            for (rowIndex = row.index + 1; rowIndex < this.numberOfRows; rowIndex++) {
                if (this.rowData[rowIndex].visible) {
                    this.bodyElement.insertBefore(row.rowElement, this.rowData[rowIndex].rowElement);
                    
                    appended = true;
                    
                    break;
                }
            }
            
            // Append the row at the end of table body if there was no visible row with higher index
            if (!appended) {
                this.bodyElement.appendChild(row.rowElement);
            }
            
            row.visible = true;
        }
    };
    
    /**
     * Hides given row (remove it's element from DOM) if it's currently visible.
     * 
     * @param {{}} row Object with row data
     */
    Table.prototype.hideRow = function (row) {
        if (row.visible) {
            // Remove row's element from it's parent
            row.rowElement.parentElement.removeChild(row.rowElement);
            
            row.visible = false;
        }
    };
    
    /**
     * Handler of the <code>change</code> event of a filter dropdown.
     * 
     * @param {Event} event A <code>change</code> event
     */
    Table.prototype.columnFilterChangeHandler = function (event) {
        // Filter table data based on current filter values
        this.filterData();
        
        // Repopulate filter dropdown options to match data currently visible in the table
        this.populateColumnFilters();
    };

    /**
     * Main module entry point. Creates and attaches filtering row to a table with given selector considering
     * given options.
     * 
     * @param {String} selector A CSS selector which points to a <code>table</code> element
     * @param {{}} options An object with configuration options for the filters (@see <code>Table</code> 
     * constructor)
     */
    root.TableFilter = function (selector, options) {
        var element = document.querySelector(selector);
        
        if (!element) {
            console.error('Could not find element by selector', selector);
            
            return;
        }
        
        if (element.nodeName.toLowerCase() !== 'table') {
            console.error('Element with selector', selector, 'is not a table');
            
            return;
        }
        
        new Table(element, options).createFilters();
    };

})(this);