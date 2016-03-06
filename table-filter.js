/**
 * Definition of TableFilter module. It's purpose is to add a filtering row in table thead section.
 * Filtering row for each column adds a dropdown list with all data values in that column.
 * Selecting an option in one of the dropdowns filters contents of the table to only show rows which
 * match the selection. Also, other filtering dropdowns are also filtered accordingly to allow selecting
 * only values that are currently visible.
 * 
 * To use the module invoke the TableFilter function passing table CSS selector as first argument
 * and optional config object as second argument.
 * Configuration options with default values are:
 * {
 *     emptyFilterText: '', // Text to be displayed as default in the filtering dropdown
 *     sortFilterValues: true, // Flag which controls if options in filtering dropdowns should be sorted
 *     numberOfColumns: -1 // Number of columns (starting from first column on the left) for which filters
 *                            should be added. -1 means that filters will be added for all columns in the table
 * }
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
    
    var findChild = function (parent, childSelector) {
        return parent.querySelector(childSelector) || emptyElement;
    };
    
    var findChildren = function (parent, childrenSelector) {
        return parent.querySelectorAll(childrenSelector) || emptyElement;
    };
    
    var Table = function(tableElement, tableFilterOptions) {
        this.rootElement = tableElement;
        this.config = this.parseConfig(tableFilterOptions);
        
        this.headElement = findChild(this.rootElement, 'thead'); 
        this.bodyElement = findChild(this.rootElement, 'tbody');
        this.headerCellElements = findChildren(this.headElement, 'th');
        
        if (this.config.numberOfColumns > -1) {
            this.headerCellElements = Array.prototype.slice.call(this.headerCellElements, 0, 
                this.config.numberOfColumns);
        }
        
        this.numberOfColumns = this.headerCellElements.length;
        this.rowElements = findChildren(this.bodyElement, 'tr');
        this.numberOfRows = this.rowElements.length;
        
        this.buildRowData();
    };
    
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
    
    Table.prototype.buildRowData = function () {
        var rowIndex;
        var columnIndex;
        var dataCellElements;
        var cellData;
        
        this.rowData = [];
        
        for (rowIndex = 0; rowIndex < this.numberOfRows; rowIndex++) {
            dataCellElements = findChildren(this.rowElements[rowIndex], 'td');
            
            if (this.config.numberOfColumns > -1) {
                dataCellElements = Array.prototype.slice.call(dataCellElements, 0, 
                    this.config.numberOfColumns);
            }
            
            cellData = [];
            
            for (columnIndex = 0; columnIndex < this.numberOfColumns; columnIndex++) {
                cellData.push(dataCellElements[columnIndex].innerHTML);
            }
            
            this.rowData.push({
                rowElement: this.rowElements[rowIndex],
                index: rowIndex,
                cellData: cellData,
                visible: true
            });
        }
    };
    
    Table.prototype.createFilters = function () {
        var columnIndex;
        var dropdownList;
        var filterCell;
        var filterRow = document.createElement('tr');
        
        this.filterDropdowns = [];
        
        filterRow.className = 'table-filter-row';
        
        for (columnIndex = 0; columnIndex < this.numberOfColumns; columnIndex++) {
            filterCell = document.createElement('th');
            
            filterCell.className = 'table-filter-cell';
            
            dropdownList = this.createFilterDropdown(columnIndex);
            
            this.filterDropdowns.push(dropdownList);
            
            filterCell.appendChild(dropdownList);
            filterRow.appendChild(filterCell);
        }
        
        this.headElement.appendChild(filterRow);
        
        this.populateColumnFilters();
    };
    
    Table.prototype.createFilterDropdown = function (columnIndex) {
        var dropdownList = document.createElement('select');
        
        dropdownList.className = 'form-control table-filter-dropdown';
        dropdownList.setAttribute('data-column-index', '' + columnIndex);
        
        dropdownList.addEventListener('change', this.columnFilterChangeHandler.bind(this));
        
        return dropdownList;
    };
    
    Table.prototype.populateColumnFilters = function () {
        var columnIndex;
        
        for (columnIndex = 0; columnIndex < this.numberOfColumns; columnIndex++) {
            this.populateColumnFilter(columnIndex);
        }
    };
    
    Table.prototype.populateColumnFilter = function (columnIndex) {
        var i;
        var length;
        var filterDropdown = this.filterDropdowns[columnIndex];
        var columnCellDataValues;
        
        if (filterDropdown.selectedIndex <= 0) {
            columnCellDataValues = this.getVisibleDataCellValues(columnIndex);
            
            this.clearColumnFilter(filterDropdown);
        
            filterDropdown.appendChild(this.createDropdownOption(this.config.emptyFilterText));
            
            for (i = 0, length = columnCellDataValues.length; i < length; i++) {
                filterDropdown.appendChild(this.createDropdownOption(columnCellDataValues[i]));
            }
        }
    };
    
    Table.prototype.clearColumnFilter = function (filterDropdown) {
        while(filterDropdown.options.length > 0){                
            filterDropdown.remove(0);
        }
    };
    
    Table.prototype.createDropdownOption = function (optionText) {
        var option = document.createElement('option');
        
        option.className = 'table-filter-option';
        option.value = optionText;
        option.text = optionText;
        
        return option;
    };
    
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
    
    Table.prototype.filterData = function () {
        var rowIndex;
        var row;
        
        for (rowIndex = 0; rowIndex < this.numberOfRows; rowIndex++) {
            row = this.rowData[rowIndex];
            
            if (this.rowMatchesFilters(row)) {
                this.showRow(row);
            } else {
                this.hideRow(row);
            }
        }
    };
    
    Table.prototype.rowMatchesFilters = function (row) {
        var columnIndex;
        var filterValue;
        var filterDropdown;
        
        for (columnIndex = 0; columnIndex < this.numberOfColumns; columnIndex++) {
            filterDropdown = this.filterDropdowns[columnIndex];
            
            if (filterDropdown.selectedIndex > 0) {
                filterValue = filterDropdown.options[filterDropdown.selectedIndex].value;
                
                if (row.cellData[columnIndex] !== filterValue) {
                    return false;
                }
            }
        }
        
        return true;
    };
    
    Table.prototype.showRow = function (row) {
        var rowIndex;
        var appended = false;
        
        if (!row.visible) {
            /*
            Iterate over all rows with index higher than current row and find one that's visible. This will
            be the point when current row should be inserted.
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
    
    Table.prototype.hideRow = function (row) {
        if (row.visible) {
            row.rowElement.parentElement.removeChild(row.rowElement);
            
            row.visible = false;
        }
    };
    
    Table.prototype.columnFilterChangeHandler = function (event) {
        this.filterData();
        
        this.populateColumnFilters();
    };

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