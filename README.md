# Table Filter

A simple JavaScript module which adds a filtering row to given HTML table.

### Sample usage:

```html
<html>
<body>

    <table class="my-table">
        <thead>
            <tr>
                <th>First name</th>
                <th>Last name</th>
                <th>Age</th>
            </tr>
        </thead>
        
        <tbody>
            <tr>
                <td>John</td>
                <td>Smith</td>
                <td>49</td>
            </tr>
            
            <tr>
                <td>Anne</td>
                <td>Cartwright</td>
                <td>22</td>
            </tr>
            
            <!-- ... -->
        </tbody>
    </table>

    <script src="table-filter.js"></script>
    <script type="text/javascript">

        (function () {
            document.addEventListener('DOMContentLoaded', function () {
                TableFilter('.my-table', {
                    emptyFilterText: '',
                    sortFilterValues: true,
                    numberOfColumns: -1
                });
            });
        })();

    </script>

</body>
</html>
```
`TableFilter` function signature is:
```javascript
TableFilter = function (selector, options)
```
where:
- `selector` is a CSS selector of the `table` element for which filters will be applied,
- `options` is an optional object with configuration for the module. Configuration parameters are:
  - `emptyFilterText`: text to be put into default filter dropdown option (for example `'All'`, `'-Select value-'`, etc.). Defaults to an empty string,
  - `sortFilterValues`: a `true`/`false` flag which indicates if options in filter dropdowns should be sorted alphabetically. Defaults to `true`,
  - `numberOfColumns`: as a default, the module will add filters to all columns in the table. This parameter allows to specify number of columns for which filtering will be applied. A value of `n` will add filters only to first `n` columns of the table. A value of `-1` will add filters to all columns. Defaults to `-1`.
  
All of the parameters are optional. If any parameter is not given then default value will be used. 

Above example will add following markup to the table's `<thead>` section:
```html
<tr class="table-filter-row">
    <th class="table-filter-cell">
        <select class="form-control table-filter-dropdown" data-column-index="0">
            <option class="table-filter-option" value=""></option>
            <option class="table-filter-option" value="Anne">Anne</option>
            <option class="table-filter-option" value="John">John</option>
            <!-- ... -->
        </select>
    </th>
    
    <th class="table-filter-cell">
        <select class="form-control table-filter-dropdown" data-column-index="1">
            <option class="table-filter-option" value=""></option>
            <option class="table-filter-option" value="Cartwright">Cartwright</option>
            <option class="table-filter-option" value="Smith">Smith</option>
            <!-- ... -->
        </select>
    </th>
    
    <th class="table-filter-cell">
        <select class="form-control table-filter-dropdown" data-column-index="2">
            <option class="table-filter-option" value=""></option>
            <option class="table-filter-option" value="22">22</option>
            <option class="table-filter-option" value="49">49</option>
            <!-- ... -->
        </select>
    </th>
</tr>
```
The `form-control` class in `select` element applies Bootstrap styling to the dropdown.

In case when user decides to apply filters to specific number of columns, the non-filter header cells will get markup:
```html
<th class="table-filter-cell table-filter-cell-empty">
    &nbsp;
</th>
```

# License

[ISC](https://en.wikipedia.org/wiki/ISC_license) License.
